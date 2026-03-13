import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Cpu, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Thermometer, 
  Droplets, 
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface SensorReading {
  timestamp: string;
  ph: number;
  tds: number;
  turbidity: number;
  pollution_index: number;
  classification: 'Safe' | 'Moderate' | 'Hazardous';
}

interface SensorStatus {
  success: boolean;
  connected: boolean;
  message: string;
  thresholds?: {
    PH: { SAFE_MIN: number; SAFE_MAX: number };
    TDS: { SAFE_MAX: number; MODERATE_MAX: number };
    TURBIDITY: { SAFE_MAX: number; MODERATE_MAX: number };
  };
}

interface SensorDataResponse {
  success: boolean;
  message: string;
  connected: boolean;
  data: SensorReading | null;
}

export function HardwareSensorData() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch sensor status
  const { data: status, isLoading: statusLoading } = useQuery<SensorStatus>({
    queryKey: ['hardware-sensor-status'],
    queryFn: async () => {
      const response = await fetch('/api/hardware-sensor-status');
      if (!response.ok) {
        throw new Error('Failed to fetch sensor status');
      }
      return response.json();
    },
    refetchInterval: 10000, // Check status every 10 seconds
  });

  // Fetch sensor data
  const { 
    data: sensorData, 
    isLoading: dataLoading, 
    refetch: refetchData,
    error: dataError 
  } = useQuery<SensorDataResponse>({
    queryKey: ['hardware-sensor-data'],
    queryFn: async () => {
      const response = await fetch('/api/hardware-sensor-data');
      if (!response.ok) {
        throw new Error('Failed to fetch sensor data');
      }
      return response.json();
    },
    refetchInterval: autoRefresh ? 5000 : false, // Auto-refresh every 5 seconds if enabled
    enabled: status?.connected || false, // Only fetch data if connected
  });

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'Safe':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Hazardous':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getParameterColor = (value: number, type: 'ph' | 'tds' | 'turbidity') => {
    if (!status?.thresholds) return 'bg-gray-500';
    
    const thresholds = status.thresholds;
    
    switch (type) {
      case 'ph':
        if (value >= thresholds.PH.SAFE_MIN && value <= thresholds.PH.SAFE_MAX) {
          return 'bg-green-500';
        }
        return 'bg-yellow-500';
      
      case 'tds':
        if (value <= thresholds.TDS.SAFE_MAX) {
          return 'bg-green-500';
        } else if (value <= thresholds.TDS.MODERATE_MAX) {
          return 'bg-yellow-500';
        }
        return 'bg-red-500';
      
      case 'turbidity':
        if (value <= thresholds.TURBIDITY.SAFE_MAX) {
          return 'bg-green-500';
        } else if (value <= thresholds.TURBIDITY.MODERATE_MAX) {
          return 'bg-yellow-500';
        }
        return 'bg-red-500';
      
      default:
        return 'bg-gray-500';
    }
  };

  const getProgressValue = (value: number, type: 'ph' | 'tds' | 'turbidity') => {
    if (!status?.thresholds) return 0;
    
    const thresholds = status.thresholds;
    
    switch (type) {
      case 'ph':
        // pH scale from 0-14, normalize to percentage
        return Math.min(100, (value / 14) * 100);
      
      case 'tds':
        // TDS scale up to 2000 for visualization
        return Math.min(100, (value / 2000) * 100);
      
      case 'turbidity':
        // Turbidity scale up to 100 for visualization
        return Math.min(100, (value / 100) * 100);
      
      default:
        return 0;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (statusLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-dashboard-component">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Hardware Sensor Data</h2>
          <p className="text-muted-foreground">Real-time water quality readings from sensors</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchData()}
            disabled={dataLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${dataLoading ? 'animate-spin' : ''}`} />
            Refresh Now
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Cpu className="h-5 w-5" />
            <span>Hardware Connection Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {status?.connected ? (
                <>
                  <Wifi className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Connected</p>
                    <p className="text-sm text-green-600">{status.message}</p>
                  </div>
                </>
              ) : (
                <>
                  <WifiOff className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-800">Disconnected</p>
                    <p className="text-sm text-red-600">{status?.message || 'Waiting for hardware data...'}</p>
                  </div>
                </>
              )}
            </div>
            <Badge variant={status?.connected ? "default" : "destructive"}>
              {status?.connected ? "Online" : "Offline"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Sensor Data Display */}
      {status?.connected && sensorData?.data ? (
        <>
          {/* Overall Classification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {sensorData.data.classification === 'Safe' && <CheckCircle className="h-5 w-5 text-green-600" />}
                {sensorData.data.classification === 'Moderate' && <AlertTriangle className="h-5 w-5 text-yellow-600" />}
                {sensorData.data.classification === 'Hazardous' && <AlertTriangle className="h-5 w-5 text-red-600" />}
                <span>Overall Water Quality Classification</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <Badge 
                  className={`text-lg px-4 py-2 ${getClassificationColor(sensorData.data.classification)}`}
                >
                  {sensorData.data.classification.toUpperCase()}
                </Badge>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Pollution Index</p>
                    <p className="text-2xl font-bold">{sensorData.data.pollution_index}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Updated</p>
                    <p className="text-sm">{formatTimestamp(sensorData.data.timestamp)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Individual Sensor Readings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* pH Sensor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Droplets className="h-5 w-5 text-blue-600" />
                  <span>pH Level</span>
                </CardTitle>
                <CardDescription>Acidity/Alkalinity (6.5-8.5 safe)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">{sensorData.data.ph.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">pH units</div>
                </div>
                <Progress 
                  value={getProgressValue(sensorData.data.ph, 'ph')} 
                  className="h-3"
                />
                <div className={`w-full h-2 rounded-full ${getParameterColor(sensorData.data.ph, 'ph')}`}></div>
                {status?.thresholds && (
                  <div className="text-xs text-muted-foreground">
                    Safe: {status.thresholds.PH.SAFE_MIN} - {status.thresholds.PH.SAFE_MAX}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* TDS Sensor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Thermometer className="h-5 w-5 text-orange-600" />
                  <span>TDS Level</span>
                </CardTitle>
                <CardDescription>Total Dissolved Solids (≤500 safe)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">{sensorData.data.tds.toFixed(0)}</div>
                  <div className="text-sm text-muted-foreground">ppm</div>
                </div>
                <Progress 
                  value={getProgressValue(sensorData.data.tds, 'tds')} 
                  className="h-3"
                />
                <div className={`w-full h-2 rounded-full ${getParameterColor(sensorData.data.tds, 'tds')}`}></div>
                {status?.thresholds && (
                  <div className="text-xs text-muted-foreground">
                    Safe: ≤{status.thresholds.TDS.SAFE_MAX} | Moderate: ≤{status.thresholds.TDS.MODERATE_MAX}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Turbidity Sensor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-purple-600" />
                  <span>Turbidity</span>
                </CardTitle>
                <CardDescription>Water Clarity (≤5 safe)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">{sensorData.data.turbidity.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">NTU</div>
                </div>
                <Progress 
                  value={getProgressValue(sensorData.data.turbidity, 'turbidity')} 
                  className="h-3"
                />
                <div className={`w-full h-2 rounded-full ${getParameterColor(sensorData.data.turbidity, 'turbidity')}`}></div>
                {status?.thresholds && (
                  <div className="text-xs text-muted-foreground">
                    Safe: ≤{status.thresholds.TURBIDITY.SAFE_MAX} | Moderate: ≤{status.thresholds.TURBIDITY.MODERATE_MAX}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Real-time Data Table */}
          <Card>
            <CardHeader>
              <CardTitle>Real-time Sensor Readings</CardTitle>
              <CardDescription>Live data from hardware sensors with automatic updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Parameter</th>
                      <th className="text-left p-2">Value</th>
                      <th className="text-left p-2">Unit</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2 font-medium">pH Level</td>
                      <td className="p-2">{sensorData.data.ph.toFixed(2)}</td>
                      <td className="p-2">pH units</td>
                      <td className="p-2">
                        <Badge className={getClassificationColor(
                          sensorData.data.ph >= 6.5 && sensorData.data.ph <= 8.5 ? 'Safe' : 'Moderate'
                        )}>
                          {sensorData.data.ph >= 6.5 && sensorData.data.ph <= 8.5 ? 'Safe' : 'Moderate'}
                        </Badge>
                      </td>
                      <td className="p-2 text-sm text-muted-foreground">
                        {formatTimestamp(sensorData.data.timestamp)}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">TDS</td>
                      <td className="p-2">{sensorData.data.tds.toFixed(0)}</td>
                      <td className="p-2">ppm</td>
                      <td className="p-2">
                        <Badge className={getClassificationColor(
                          sensorData.data.tds <= 500 ? 'Safe' : 
                          sensorData.data.tds <= 1500 ? 'Moderate' : 'Hazardous'
                        )}>
                          {sensorData.data.tds <= 500 ? 'Safe' : 
                           sensorData.data.tds <= 1500 ? 'Moderate' : 'Hazardous'}
                        </Badge>
                      </td>
                      <td className="p-2 text-sm text-muted-foreground">
                        {formatTimestamp(sensorData.data.timestamp)}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">Turbidity</td>
                      <td className="p-2">{sensorData.data.turbidity.toFixed(2)}</td>
                      <td className="p-2">NTU</td>
                      <td className="p-2">
                        <Badge className={getClassificationColor(
                          sensorData.data.turbidity <= 5 ? 'Safe' : 
                          sensorData.data.turbidity <= 50 ? 'Moderate' : 'Hazardous'
                        )}>
                          {sensorData.data.turbidity <= 5 ? 'Safe' : 
                           sensorData.data.turbidity <= 50 ? 'Moderate' : 'Hazardous'}
                        </Badge>
                      </td>
                      <td className="p-2 text-sm text-muted-foreground">
                        {formatTimestamp(sensorData.data.timestamp)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        /* No Data Available */
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Waiting for Hardware Data</h3>
            <p className="text-muted-foreground mb-4">
              {status?.connected 
                ? "Hardware is connected but no sensor data is available yet." 
                : "Please ensure your hardware sensors are connected and transmitting data."}
            </p>
            {dataError && (
              <Alert className="max-w-md mx-auto">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Error fetching sensor data: {dataError.message}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}