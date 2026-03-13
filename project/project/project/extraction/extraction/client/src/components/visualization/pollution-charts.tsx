import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSamples } from '@/hooks/use-samples';
import { Sample } from '@shared/schema';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  Legend,
  ScatterChart,
  Scatter
} from 'recharts';
import { 
  TrendingUp, 
  AlertTriangle, 
  BarChart3, 
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';

interface ChartData {
  name: string;
  value: number;
  color?: string;
}

interface MetalTrendData {
  date: string;
  lead: number;
  cadmium: number;
  arsenic: number;
  mercury: number;
  chromium: number;
  [key: string]: string | number;
}

export function PollutionCharts() {
  const { data: samples, isLoading } = useSamples();

  const chartData = useMemo(() => {
    if (!samples || samples.length === 0) return null;

    // 1. HPI Category Distribution
    const categoryData = samples.reduce((acc, sample) => {
      const category = sample.category || 'Unknown';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const hpiDistribution: ChartData[] = Object.entries(categoryData).map(([category, count]) => ({
      name: category,
      value: count,
      color: category === 'Safe' ? '#10B981' : 
             category === 'Moderate' ? '#F59E0B' : 
             category === 'Critical' ? '#EF4444' : '#6B7280'
    }));

    // 2. WHO Compliance Overview
    const whoCompliant = samples.filter(s => !s.exceedsWhoLimits).length;
    const whoNonCompliant = samples.length - whoCompliant;
    
    const whoComplianceData: ChartData[] = [
      { name: 'WHO Compliant', value: whoCompliant, color: '#10B981' },
      { name: 'Exceeds WHO Limits', value: whoNonCompliant, color: '#EF4444' }
    ];

    // 3. Metal Concentration Averages
    // Use the standard metal fields from samples
    const metalAverages = ['lead', 'cadmium', 'arsenic', 'mercury', 'chromium', 'nickel', 'zinc', 'copper']
      .map(metal => {
        const metalKey = metal as keyof Sample;
        const validSamples = samples.filter(s => s[metalKey] !== null && s[metalKey] !== undefined);
        const avg = validSamples.length > 0 
          ? validSamples.reduce((sum, s) => sum + (Number(s[metalKey]) || 0), 0) / validSamples.length
          : 0;
        
        return {
          name: metal.charAt(0).toUpperCase() + metal.slice(1),
          value: Number(avg.toFixed(4)),
          samples: validSamples.length
        };
      })
      .filter(item => item.samples > 0);

    // 4. Geographic Distribution (by location prefix)
    const locationData = samples.reduce((acc, sample) => {
      const locationPrefix = sample.location.split(',')[0] || 'Unknown';
      acc[locationPrefix] = (acc[locationPrefix] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topLocations = Object.entries(locationData)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([location, count]) => ({
        name: location.length > 15 ? location.substring(0, 15) + '...' : location,
        value: count
      }));

    // 5. Trend over time (if we have date data)
    const sortedSamples = [...samples].sort((a, b) => 
      new Date(a.dateCollected).getTime() - new Date(b.dateCollected).getTime()
    );

    const monthlyData = sortedSamples.reduce((acc, sample) => {
      const month = new Date(sample.dateCollected).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      
      if (!acc[month]) {
        acc[month] = {
          date: month,
          lead: 0,
          cadmium: 0,
          arsenic: 0,
          mercury: 0,
          chromium: 0,
          count: 0
        };
      }
      
      acc[month].lead += Number(sample.lead) || 0;
      acc[month].cadmium += Number(sample.cadmium) || 0;
      acc[month].arsenic += Number(sample.arsenic) || 0;
      acc[month].mercury += Number(sample.mercury) || 0;
      acc[month].chromium += Number(sample.chromium) || 0;
      acc[month].count += 1;
      
      return acc;
    }, {} as Record<string, any>);

    const trendData = Object.values(monthlyData).map((month: any) => ({
      ...month,
      lead: Number((month.lead / month.count).toFixed(4)),
      cadmium: Number((month.cadmium / month.count).toFixed(4)),
      arsenic: Number((month.arsenic / month.count).toFixed(4)),
      mercury: Number((month.mercury / month.count).toFixed(4)),
      chromium: Number((month.chromium / month.count).toFixed(4))
    }));

    // 6. HPI vs Location scatter plot
    const hpiLocationData = samples
      .filter(s => s.hpi && s.latitude && s.longitude)
      .map(s => ({
        latitude: s.latitude,
        longitude: s.longitude,
        hpi: s.hpi,
        location: s.location.split(',')[0],
        category: s.category
      }));

    return {
      hpiDistribution,
      whoComplianceData,
      metalAverages,
      topLocations,
      trendData,
      hpiLocationData,
      totalSamples: samples.length,
      avgHPI: samples.reduce((sum, s) => sum + (s.hpi || 0), 0) / samples.length
    };
  }, [samples]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
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
    );
  }

  if (!chartData || !samples || samples.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Data Available</h3>
          <p className="text-gray-500">Upload some water quality samples to see visualizations.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
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
                <p className="text-2xl font-bold">{chartData.avgHPI.toFixed(1)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">WHO Compliant</p>
                <p className="text-2xl font-bold">
                  {chartData.whoComplianceData[0]?.value || 0}
                </p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {((chartData.whoComplianceData[0]?.value || 0) / chartData.totalSamples * 100).toFixed(1)}%
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical Sites</p>
                <p className="text-2xl font-bold text-red-600">
                  {chartData.hpiDistribution.find(d => d.name === 'Critical')?.value || 0}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* HPI Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChartIcon className="h-5 w-5" />
              <span>Pollution Category Distribution</span>
            </CardTitle>
            <CardDescription>
              Distribution of samples by Heavy Metal Pollution Index (HPI) categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.hpiDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.hpiDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* WHO Compliance */}
        <Card>
          <CardHeader>
            <CardTitle>WHO Standards Compliance</CardTitle>
            <CardDescription>
              Samples meeting vs exceeding WHO safety limits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.whoComplianceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.whoComplianceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Metal Concentrations */}
        <Card>
          <CardHeader>
            <CardTitle>Average Metal Concentrations</CardTitle>
            <CardDescription>
              Average heavy metal levels across all samples (mg/L)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.metalAverages}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: any, name: any) => [
                    `${Number(value).toFixed(4)} mg/L`,
                    'Average Concentration'
                  ]}
                />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Geographic Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Top Sampling Locations</CardTitle>
            <CardDescription>
              Most frequently sampled locations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.topLocations} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Trend Analysis */}
      {chartData.trendData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Pollution Trends Over Time</CardTitle>
            <CardDescription>
              Average heavy metal concentrations by month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData.trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any, name: any) => [
                    `${Number(value).toFixed(4)} mg/L`,
                    name.charAt(0).toUpperCase() + name.slice(1)
                  ]}
                />
                <Legend />
                <Line type="monotone" dataKey="lead" stroke="#EF4444" strokeWidth={2} />
                <Line type="monotone" dataKey="cadmium" stroke="#F59E0B" strokeWidth={2} />
                <Line type="monotone" dataKey="arsenic" stroke="#8B5CF6" strokeWidth={2} />
                <Line type="monotone" dataKey="mercury" stroke="#06B6D4" strokeWidth={2} />
                <Line type="monotone" dataKey="chromium" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}