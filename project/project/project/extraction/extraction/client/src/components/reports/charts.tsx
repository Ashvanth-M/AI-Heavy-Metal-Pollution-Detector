import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

interface ChartsProps {
  categoryCounts: {
    Safe: number;
    Moderate: number;
    Critical: number;
  };
  samples: Array<{
    hpi: number;
    uploadedAt?: Date | null;
  }>;
}

export function Charts({ categoryCounts, samples }: ChartsProps) {
  const barData = [
    { category: "Safe", count: categoryCounts.Safe, fill: "#10b981" },
    { category: "Moderate", count: categoryCounts.Moderate, fill: "#f59e0b" },
    { category: "Critical", count: categoryCounts.Critical, fill: "#ef4444" },
  ];

  // Generate trend data (mock data for demonstration)
  const trendData = samples
    .filter(sample => sample.uploadedAt)
    .sort((a, b) => {
      const dateA = new Date(a.uploadedAt!);
      const dateB = new Date(b.uploadedAt!);
      return dateA.getTime() - dateB.getTime();
    })
    .reduce((acc, sample, index) => {
      const uploadDate = new Date(sample.uploadedAt!);
      const date = uploadDate.toLocaleDateString();
      const existingEntry = acc.find(entry => entry.date === date);
      
      if (existingEntry) {
        existingEntry.totalHPI += sample.hpi;
        existingEntry.count += 1;
        existingEntry.avgHPI = existingEntry.totalHPI / existingEntry.count;
      } else {
        acc.push({
          date,
          avgHPI: sample.hpi,
          totalHPI: sample.hpi,
          count: 1,
        });
      }
      
      return acc;
    }, [] as Array<{ date: string; avgHPI: number; totalHPI: number; count: number }>)
    .slice(-7); // Show last 7 data points

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Bar Chart */}
      <Card>
        <CardContent className="p-6">
          <h4 className="text-lg font-semibold mb-4">Samples by Category</h4>
          <div className="h-64" data-testid="chart-bar-categories">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                  }}
                />
                <Bar dataKey="count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Line Chart */}
      <Card>
        <CardContent className="p-6">
          <h4 className="text-lg font-semibold mb-4">HPI Trend Over Time</h4>
          <div className="h-64" data-testid="chart-line-trend">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avgHPI" 
                    stroke="var(--primary)" 
                    strokeWidth={2}
                    dot={{ fill: 'var(--primary)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <p>No trend data available</p>
                  <p className="text-sm">Upload samples with date information to see trends</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
