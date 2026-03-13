import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

// Adafruit IO configuration
const AIO_USERNAME = process.env.AIO_USERNAME || 'asifa_h';
const AIO_KEY = process.env.ADAFRUIT_IO_KEY;
const AIO_BASE_URL = 'https://io.adafruit.com/api/v2';

// Feed names for sensor data
const FEEDS = {
  PH: 'ph',
  TDS: 'tds',
  TURBIDITY: 'turbidity'
};

// Classification thresholds
const THRESHOLDS = {
  PH: {
    SAFE_MIN: 6.5,
    SAFE_MAX: 8.5
  },
  TDS: {
    SAFE_MAX: 500,
    MODERATE_MAX: 1500
  },
  TURBIDITY: {
    SAFE_MAX: 5,
    MODERATE_MAX: 50
  }
};

export interface SensorReading {
  timestamp: string;
  ph: number;
  tds: number;
  turbidity: number;
  pollution_index: number;
  classification: 'Safe' | 'Moderate' | 'Hazardous';
}

export interface AdafruitFeedData {
  id: string;
  value: string;
  created_at: string;
  updated_at: string;
}

class AdafruitIOService {
  private async fetchFeedData(feedName: string): Promise<AdafruitFeedData | null> {
    try {
      const url = `${AIO_BASE_URL}/${AIO_USERNAME}/feeds/${feedName}/data/last`;
      const response = await fetch(url, {
        headers: {
          'X-AIO-Key': AIO_KEY as string,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error(`Failed to fetch ${feedName} data:`, response.status, response.statusText);
        return null;
      }

      const data = await response.json() as AdafruitFeedData;
      return data;
    } catch (error) {
      console.error(`Error fetching ${feedName} data:`, error);
      return null;
    }
  }

  private classifyParameter(value: number, type: 'ph' | 'tds' | 'turbidity'): 'Safe' | 'Moderate' | 'Hazardous' {
    switch (type) {
      case 'ph':
        if (value >= THRESHOLDS.PH.SAFE_MIN && value <= THRESHOLDS.PH.SAFE_MAX) {
          return 'Safe';
        }
        return 'Moderate';

      case 'tds':
        if (value <= THRESHOLDS.TDS.SAFE_MAX) {
          return 'Safe';
        } else if (value <= THRESHOLDS.TDS.MODERATE_MAX) {
          return 'Moderate';
        }
        return 'Hazardous';

      case 'turbidity':
        if (value <= THRESHOLDS.TURBIDITY.SAFE_MAX) {
          return 'Safe';
        } else if (value <= THRESHOLDS.TURBIDITY.MODERATE_MAX) {
          return 'Moderate';
        }
        return 'Hazardous';

      default:
        return 'Safe';
    }
  }

  private calculatePollutionIndex(ph: number, tds: number, turbidity: number): number {
    // Normalize each parameter to a 0-100 scale based on thresholds
    let phScore = 0;
    let tdsScore = 0;
    let turbidityScore = 0;

    // pH scoring (inverted - closer to neutral is better)
    const phDeviation = Math.min(
      Math.abs(ph - THRESHOLDS.PH.SAFE_MIN),
      Math.abs(ph - THRESHOLDS.PH.SAFE_MAX)
    );
    phScore = Math.min(100, phDeviation * 20); // Scale deviation

    // TDS scoring
    if (tds <= THRESHOLDS.TDS.SAFE_MAX) {
      tdsScore = (tds / THRESHOLDS.TDS.SAFE_MAX) * 30;
    } else if (tds <= THRESHOLDS.TDS.MODERATE_MAX) {
      tdsScore = 30 + ((tds - THRESHOLDS.TDS.SAFE_MAX) / (THRESHOLDS.TDS.MODERATE_MAX - THRESHOLDS.TDS.SAFE_MAX)) * 40;
    } else {
      tdsScore = 70 + Math.min(30, (tds - THRESHOLDS.TDS.MODERATE_MAX) / 100);
    }

    // Turbidity scoring
    if (turbidity <= THRESHOLDS.TURBIDITY.SAFE_MAX) {
      turbidityScore = (turbidity / THRESHOLDS.TURBIDITY.SAFE_MAX) * 30;
    } else if (turbidity <= THRESHOLDS.TURBIDITY.MODERATE_MAX) {
      turbidityScore = 30 + ((turbidity - THRESHOLDS.TURBIDITY.SAFE_MAX) / (THRESHOLDS.TURBIDITY.MODERATE_MAX - THRESHOLDS.TURBIDITY.SAFE_MAX)) * 40;
    } else {
      turbidityScore = 70 + Math.min(30, (turbidity - THRESHOLDS.TURBIDITY.MODERATE_MAX) / 10);
    }

    // Weighted average (pH: 30%, TDS: 40%, Turbidity: 30%)
    const pollutionIndex = (phScore * 0.3) + (tdsScore * 0.4) + (turbidityScore * 0.3);
    return Math.round(pollutionIndex * 100) / 100; // Round to 2 decimal places
  }

  private getOverallClassification(ph: number, tds: number, turbidity: number): 'Safe' | 'Moderate' | 'Hazardous' {
    const phClass = this.classifyParameter(ph, 'ph');
    const tdsClass = this.classifyParameter(tds, 'tds');
    const turbidityClass = this.classifyParameter(turbidity, 'turbidity');

    // If any parameter is hazardous, overall is hazardous
    if (phClass === 'Hazardous' || tdsClass === 'Hazardous' || turbidityClass === 'Hazardous') {
      return 'Hazardous';
    }

    // If any parameter is moderate, overall is moderate
    if (phClass === 'Moderate' || tdsClass === 'Moderate' || turbidityClass === 'Moderate') {
      return 'Moderate';
    }

    // All parameters are safe
    return 'Safe';
  }

  public async getSensorReadings(): Promise<SensorReading | null> {
    try {
      // Fetch data from all feeds concurrently
      const [phData, tdsData, turbidityData] = await Promise.all([
        this.fetchFeedData(FEEDS.PH),
        this.fetchFeedData(FEEDS.TDS),
        this.fetchFeedData(FEEDS.TURBIDITY)
      ]);

      // Check if all feeds returned data
      if (!phData || !tdsData || !turbidityData) {
        console.error('Failed to fetch data from one or more Adafruit IO feeds');
        return null;
      }

      // Parse values
      const ph = parseFloat(phData.value);
      const tds = parseFloat(tdsData.value);
      const turbidity = parseFloat(turbidityData.value);

      // Validate parsed values
      if (isNaN(ph) || isNaN(tds) || isNaN(turbidity)) {
        console.error('Invalid sensor data received from Adafruit IO');
        return null;
      }

      // Calculate pollution index and classification
      const pollution_index = this.calculatePollutionIndex(ph, tds, turbidity);
      const classification = this.getOverallClassification(ph, tds, turbidity);

      // Use the most recent timestamp from the feeds
      const timestamps = [phData.updated_at, tdsData.updated_at, turbidityData.updated_at];
      const mostRecentTimestamp = timestamps.sort().reverse()[0];

      return {
        timestamp: new Date(mostRecentTimestamp).toISOString(),
        ph,
        tds,
        turbidity,
        pollution_index,
        classification
      };
    } catch (error) {
      console.error('Error getting sensor readings:', error);
      return null;
    }
  }

  public async checkConnection(): Promise<boolean> {
    try {
      // Try to fetch data from one feed to check connectivity
      const testData = await this.fetchFeedData(FEEDS.PH);
      return testData !== null;
    } catch (error) {
      console.error('Adafruit IO connection check failed:', error);
      return false;
    }
  }

  // Get individual parameter classifications for detailed display
  public getParameterClassifications(ph: number, tds: number, turbidity: number) {
    return {
      ph: this.classifyParameter(ph, 'ph'),
      tds: this.classifyParameter(tds, 'tds'),
      turbidity: this.classifyParameter(turbidity, 'turbidity')
    };
  }

  // Get thresholds for frontend display
  public getThresholds() {
    return THRESHOLDS;
  }
}

export const adafruitIOService = new AdafruitIOService();
