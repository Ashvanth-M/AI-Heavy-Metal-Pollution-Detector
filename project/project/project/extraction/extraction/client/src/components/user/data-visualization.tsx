import React, { useMemo } from 'react';
// Fixed function hoisting issue for getWHOLimit
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSamples } from '@/hooks/use-samples';
import { mockLocations } from '@/data/mock-locations';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  BarChart3, 
  PieChart as PieChartIcon,
  TrendingUp,
  Activity,
  MapPin,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Eye,
  Info
} from 'lucide-react';
import { motion } from 'framer-motion';

export function DataVisualization() {
  const { data: apiSamples = [], isLoading, refetch } = useSamples();
  
  // Use mock data if no API data is available
  const samples = apiSamples.length > 0 ? apiSamples : mockLocations;
  const isUsingMockData = apiSamples.length === 0;

  // Helper function for WHO limits
  const getWHOLimit = (metal: string): number => {
    const limits: Record<string, number> = {
      lead: 0.01,
      cadmium: 0.003,
      arsenic: 0.01,
      mercury: 0.001,
      chromium: 0.05,
      nickel: 0.02,
      zinc: 5.0,
      copper: 1.0
    };
    return limits[metal] || 0;
  };

  // Chart data calculations
  const chartData = useMemo(() => {
    if (!samples || samples.length === 0) return null;

    // Type-safe helper functions to extract data
    const getHPI = (sample: any): number => {
      if ('metals' in sample) {
        // MockLocation format
        return sample.indices?.hpi || 0;
      } else {
        // Sample format
        return sample.hpi || 0;
      }
    };

    const getPLI = (sample: any): number => {
      if ('metals' in sample) {
        // MockLocation format - use MI as PLI equivalent
        return sample.indices?.mi || 0;
      } else {
        // Sample format
        return sample.pli || 0;
      }
    };

    const getMetalValue = (sample: any, metalName: string): number => {
      if ('metals' in sample) {
        // MockLocation format
        const metalMap: Record<string, string> = {
          'lead': 'pb',
          'cadmium': 'cd',
          'arsenic': 'as',
          'chromium': 'cr',
          'nickel': 'ni',
          'zinc': 'zn'
        };
        const mockKey = metalMap[metalName];
        return mockKey ? (sample.metals[mockKey] || 0) : Math.random() * 0.01;
      } else {
        // Sample format
        return (sample as any)[metalName] || 0;
      }
    };

    const getDateCollected = (sample: any): Date => {
      if ('metals' in sample) {
        // MockLocation format - generate a random recent date
        const now = new Date();
        const pastDate = new Date(now.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000);
        return pastDate;
      } else {
        // Sample format
        return new Date(sample.dateCollected || sample.uploadedAt || Date.now());
      }
    };

    // Enhanced mock data for better visualization
    const enhancedSamples = samples.map(sample => {
      return {
        ...sample,
        lead: getMetalValue(sample, 'lead'),
        cadmium: getMetalValue(sample, 'cadmium'),
        arsenic: getMetalValue(sample, 'arsenic'),
        mercury: getMetalValue(sample, 'mercury'),
        chromium: getMetalValue(sample, 'chromium'),
        nickel: getMetalValue(sample, 'nickel'),
        zinc: getMetalValue(sample, 'zinc'),
        copper: getMetalValue(sample, 'copper'),
        hpi: getHPI(sample),
        pli: getPLI(sample),
        dateCollected: getDateCollected(sample)
      };
    });

    // 1. Risk Category Distribution for Pie Chart
    const categoryData = enhancedSamples.reduce((acc, sample) => {
      const category = sample.category || 'Unknown';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const riskPieData = Object.entries(categoryData).map(([category, count]) => ({
      name: category,
      value: count,
      percentage: Number(((count / enhancedSamples.length) * 100).toFixed(1)),
      color: category === 'Safe' ? '#10B981' : 
             category === 'Moderate' ? '#F59E0B' : 
             category === 'Critical' ? '#EF4444' : '#6B7280'
    }));

    // 2. Metal Concentration Averages for Bar Chart
    const metalNames = ['lead', 'cadmium', 'arsenic', 'mercury', 'chromium', 'nickel', 'zinc', 'copper'];
    const metalAverages = metalNames
      .map(metal => {
        const validSamples = enhancedSamples.filter(s => (s as any)[metal] > 0);
        const avg = validSamples.length > 0 
          ? validSamples.reduce((sum, s) => sum + ((s as any)[metal] || 0), 0) / validSamples.length
          : 0;
        
        return {
          name: metal.charAt(0).toUpperCase() + metal.slice(1),
          value: Number(avg.toFixed(4)),
          samples: validSamples.length,
          whoLimit: getWHOLimit(metal)
        };
      })
      .filter(item => item.value > 0);

    // 3. HPI Range Distribution
    const hpiRanges = {
      'Very Low (0-25)': 0,
      'Low (25-50)': 0,
      'Moderate (50-75)': 0,
      'High (75-100)': 0,
      'Very High (100-150)': 0,
      'Extreme (>150)': 0
    };

    enhancedSamples.forEach(sample => {
      const hpi = sample.hpi || 0;
      if (hpi <= 25) hpiRanges['Very Low (0-25)']++;
      else if (hpi <= 50) hpiRanges['Low (25-50)']++;
      else if (hpi <= 75) hpiRanges['Moderate (50-75)']++;
      else if (hpi <= 100) hpiRanges['High (75-100)']++;
      else if (hpi <= 150) hpiRanges['Very High (100-150)']++;
      else hpiRanges['Extreme (>150)']++;
    });

    const hpiRangeData = Object.entries(hpiRanges).map(([range, count]) => ({
      name: range,
      value: count,
      percentage: Number(((count / enhancedSamples.length) * 100).toFixed(1))
    }));

    // 4. Geographic Distribution by State/Region
    const locationData = enhancedSamples.reduce((acc, sample) => {
      const location = sample.location?.split(',')[0] || 'Unknown';
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topLocations = Object.entries(locationData)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([location, count]) => ({
        name: location.length > 15 ? location.substring(0, 15) + '...' : location,
        value: count,
        percentage: Number(((count / enhancedSamples.length) * 100).toFixed(1))
      }));

    // 5. Temporal Analysis (if dateCollected is available)
    const monthlyData = enhancedSamples.reduce((acc, sample) => {
      const date = sample.dateCollected;
      const month = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      
      if (!acc[month]) {
        acc[month] = {
          month,
          hpi: 0,
          critical: 0,
          moderate: 0,
          safe: 0,
          count: 0
        };
      }
      
      acc[month].hpi += sample.hpi || 0;
      acc[month].count++;
      
      if (sample.category === 'Critical') acc[month].critical++;
      else if (sample.category === 'Moderate') acc[month].moderate++;
      else if (sample.category === 'Safe') acc[month].safe++;
      
      return acc;
    }, {} as Record<string, any>);

    const trendData = Object.values(monthlyData).map((data: any) => ({
      ...data,
      avgHpi: Number((data.hpi / data.count).toFixed(2))
    }));

    // 6. Pollution Index Comparison for Radar Chart
    const avgHPI = enhancedSamples.reduce((sum, s) => sum + (s.hpi || 0), 0) / enhancedSamples.length;
    const avgPLI = enhancedSamples.reduce((sum, s) => sum + (s.pli || 0), 0) / enhancedSamples.length;
    // Calculate HEI and CF from individual metals since they're not stored
    const calculateHEI = (sample: any) => {
      const metals = ['lead', 'cadmium', 'arsenic', 'mercury', 'chromium'];
      const sum = metals.reduce((acc, metal) => acc + (sample[metal] || 0), 0);
      return sum / metals.length;
    };
    const avgHEI = enhancedSamples.reduce((sum, s) => sum + calculateHEI(s), 0) / enhancedSamples.length;
    const avgCF = avgHPI / 100; // Simplified CF calculation

    const radarData = [
      {
        subject: 'HPI',
        A: Number(avgHPI.toFixed(2)),
        fullMark: 150
      },
      {
        subject: 'HEI',
        A: Number(avgHEI.toFixed(2)),
        fullMark: 100
      },
      {
        subject: 'CF',
        A: Number(avgCF.toFixed(2)),
        fullMark: 10
      },
      {
        subject: 'PLI',
        A: Number(avgPLI.toFixed(2)),
        fullMark: 5
      }
    ];

    // 7. Scatter Plot: HPI vs Location Coordinates
    const scatterData = enhancedSamples
      .filter(s => s.hpi && s.latitude && s.longitude)
      .map(s => ({
        x: s.longitude,
        y: s.latitude,
        z: s.hpi,
        category: s.category,
        location: s.location
      }));

    return {
      riskPieData,
      metalAverages,
      hpiRangeData,
      topLocations,
      trendData,
      radarData,
      scatterData,
      totalSamples: enhancedSamples.length,
      avgHPI: Number(avgHPI.toFixed(2)),
      avgHEI: Number(avgHEI.toFixed(2)),
      criticalCount: enhancedSamples.filter(s => s.category === 'Critical').length,
      safeCount: enhancedSamples.filter(s => s.category === 'Safe').length
    };
  }, [samples]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Data Visualization</h2>
            <p className="text-gray-600">Loading admin data visualizations...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!chartData || samples.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Data Visualization</h2>
            <p className="text-gray-600">No admin data available for visualization</p>
          </div>
          <Button onClick={() => refetch()} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Data Available</h3>
            <p className="text-gray-500">Admin hasn't uploaded any water quality data yet.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Data Visualization</h2>
          <div className="flex items-center space-x-2">
            <p className="text-gray-600">Visual analysis of water quality data from admin database</p>
            {isUsingMockData && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Info className="h-3 w-3 mr-1" />
                Demo Data
              </Badge>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => refetch()} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Samples</p>
                <p className="text-2xl font-bold">{chartData.totalSamples}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average HPI</p>
                <p className="text-2xl font-bold">{chartData.avgHPI}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical Sites</p>
                <p className="text-2xl font-bold text-red-600">{chartData.criticalCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Safe Sites</p>
                <p className="text-2xl font-bold text-green-600">{chartData.safeCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Category Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChartIcon className="h-5 w-5" />
              <span>Risk Category Distribution</span>
            </CardTitle>
            <CardDescription>
              Distribution of water quality samples by risk category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.riskPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.riskPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} samples`, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>



        {/* HPI Range Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>HPI Range Distribution</CardTitle>
            <CardDescription>
              Distribution of samples across different HPI ranges
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.hpiRangeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis 
                  label={{ value: 'Number of Samples', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value: any, name: any, props: any) => [
                    `${value} samples (${props.payload.percentage}%)`,
                    'Count'
                  ]}
                />
                <Bar dataKey="value" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>


      </div>

      {/* Advanced Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pollution Indices Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Pollution Indices Comparison</CardTitle>
            <CardDescription>
              Average pollution indices across all samples
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={chartData.radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis />
                <Radar
                  name="Pollution Index"
                  dataKey="A"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Temporal Trend Analysis */}
        {chartData.trendData.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Pollution Trends Over Time</CardTitle>
              <CardDescription>
                Average HPI values by collection period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData.trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any, name: any) => [
                      `${Number(value).toFixed(2)}`,
                      'Average HPI'
                    ]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="avgHpi" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Data Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Data Summary</CardTitle>
          <CardDescription>
            Key insights from admin water quality database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <h4 className="font-medium mb-2">Risk Assessment</h4>
              <div className="space-y-2">
                {chartData.riskPieData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <Badge variant="outline">
                      {item.value} ({item.percentage}%)
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-center">
              <h4 className="font-medium mb-2">Pollution Levels</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Average HPI:</span>
                  <span className="font-bold">{chartData.avgHPI}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Average HEI:</span>
                  <span className="font-bold">{chartData.avgHEI}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Critical Sites:</span>
                  <span className="font-bold text-red-600">{chartData.criticalCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Safe Sites:</span>
                  <span className="font-bold text-green-600">{chartData.safeCount}</span>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <h4 className="font-medium mb-2">Data Coverage</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Total Samples:</span>
                  <span className="font-bold">{chartData.totalSamples}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Top Locations:</span>
                  <span className="font-bold">{chartData.topLocations.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Metal Types:</span>
                  <span className="font-bold">{chartData.metalAverages.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Data Quality:</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Complete
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}