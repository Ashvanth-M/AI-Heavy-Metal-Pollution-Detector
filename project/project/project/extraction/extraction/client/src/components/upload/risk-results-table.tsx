import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Download, Filter, FileText, BarChart3, PieChart as PieChartIcon, TrendingUp, AlertTriangle } from "lucide-react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
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
  Area,
  AreaChart
} from 'recharts';

// Define the risk level types
type RiskLevel = "Low Risk" | "Medium Risk" | "High Risk";

// Define the structure for risk results
export interface RiskResult {
  id: string;
  location: string;
  coordinates: [number, number];
  riskLevel: RiskLevel;
  hpi: number;
  hei: number;
  mi: number;
  mainContaminants: string[];
}

interface RiskResultsTableProps {
  results: RiskResult[];
}

export function RiskResultsTable({ results }: RiskResultsTableProps) {
  const [filter, setFilter] = useState<RiskLevel | "All">("All");
  
  // Filter results based on selected risk level
  const filteredResults = filter === "All" 
    ? results 
    : results.filter(result => result.riskLevel === filter);

  // Chart data calculations
  const chartData = useMemo(() => {
    if (!results || results.length === 0) return null;

    // 1. Risk Level Distribution for Pie Chart
    const riskDistribution = results.reduce((acc, result) => {
      acc[result.riskLevel] = (acc[result.riskLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const riskPieData = Object.entries(riskDistribution).map(([risk, count]) => ({
      name: risk,
      value: count,
      color: risk === 'Low Risk' ? '#10B981' : 
             risk === 'Medium Risk' ? '#F59E0B' : 
             risk === 'High Risk' ? '#EF4444' : '#6B7280'
    }));

    // 2. Average Index Values for Bar Chart
    const avgHPI = results.reduce((sum, r) => sum + r.hpi, 0) / results.length;
    const avgHEI = results.reduce((sum, r) => sum + r.hei, 0) / results.length;
    const avgMI = results.reduce((sum, r) => sum + r.mi, 0) / results.length;

    const indexBarData = [
      { name: 'HPI', value: Number(avgHPI.toFixed(2)), full: 'Heavy Metal Pollution Index' },
      { name: 'HEI', value: Number(avgHEI.toFixed(2)), full: 'Heavy Metal Evaluation Index' },
      { name: 'MI', value: Number(avgMI.toFixed(2)), full: 'Metal Index' }
    ];

    // 3. Contaminant Frequency for Bar Chart
    const contaminantCounts = results.reduce((acc, result) => {
      result.mainContaminants.forEach(contaminant => {
        acc[contaminant] = (acc[contaminant] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const contaminantBarData = Object.entries(contaminantCounts)
      .map(([contaminant, count]) => ({
        name: contaminant,
        value: count,
        percentage: Number(((count / results.length) * 100).toFixed(1))
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 contaminants

    // 4. Index Range Distribution
    const hpiRanges = {
      'Low (0-25)': 0,
      'Moderate (25-50)': 0,
      'High (50-75)': 0,
      'Very High (75-100)': 0,
      'Extreme (>100)': 0
    };

    results.forEach(result => {
      const hpi = result.hpi;
      if (hpi <= 25) hpiRanges['Low (0-25)']++;
      else if (hpi <= 50) hpiRanges['Moderate (25-50)']++;
      else if (hpi <= 75) hpiRanges['High (50-75)']++;
      else if (hpi <= 100) hpiRanges['Very High (75-100)']++;
      else hpiRanges['Extreme (>100)']++;
    });

    const hpiRangeData = Object.entries(hpiRanges).map(([range, count]) => ({
      name: range,
      value: count
    }));

    return {
      riskPieData,
      indexBarData,
      contaminantBarData,
      hpiRangeData,
      totalSamples: results.length,
      avgHPI: Number(avgHPI.toFixed(2)),
      avgHEI: Number(avgHEI.toFixed(2)),
      avgMI: Number(avgMI.toFixed(2))
    };
  }, [results]);
  
  // Get badge variant based on risk level
  const getBadgeVariant = (riskLevel: RiskLevel): "default" | "destructive" | "secondary" | "outline" => {
    switch (riskLevel) {
      case "Low Risk":
        return "secondary";
      case "Medium Risk":
        return "outline";
      case "High Risk":
        return "destructive";
      default:
        return "secondary";
    }
  };
  
  // Export table data to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text("Risk Classification Results", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 22);
    
    // Create table data
    const tableData = filteredResults.map(result => [
      result.location,
      `${result.coordinates[0].toFixed(4)}, ${result.coordinates[1].toFixed(4)}`,
      result.riskLevel,
      result.hpi.toFixed(2),
      result.hei.toFixed(2),
      result.mi.toFixed(2),
      result.mainContaminants.join(", ")
    ]);
    
    // Add table
    (doc as any).autoTable({
      head: [['Location', 'Coordinates', 'Risk Level', 'HPI', 'HEI', 'MI', 'Main Contaminants']],
      body: tableData,
      startY: 30,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      rowStyles: { 
        0: { minCellHeight: 10 } 
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 30 },
        2: { cellWidth: 20 },
        3: { cellWidth: 15 },
        4: { cellWidth: 15 },
        5: { cellWidth: 15 },
        6: { cellWidth: 'auto' }
      }
    });
    
    // Save the PDF
    doc.save(`risk-results-${new Date().toISOString().slice(0, 10)}.pdf`);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 animate-dashboard-component"
    >
      {/* Results Table */}
      <Card className="dashboard-card">
        <CardHeader className="dashboard-card-header flex flex-row items-center justify-between">
          <div>
            <CardTitle className="dashboard-card-title">Risk Classification Results</CardTitle>
            <CardDescription>Water quality assessment based on heavy metal concentrations</CardDescription>
          </div>
          <div className="flex space-x-2">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <div className="flex space-x-1">
                <Button 
                  variant={filter === "All" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFilter("All")}
                >
                  All
                </Button>
                <Button 
                  variant={filter === "Low Risk" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFilter("Low Risk")}
                >
                  Low
                </Button>
                <Button 
                  variant={filter === "Medium Risk" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFilter("Medium Risk")}
                >
                  Medium
                </Button>
                <Button 
                  variant={filter === "High Risk" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFilter("High Risk")}
                >
                  High
                </Button>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={exportToPDF}>
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent className="dashboard-card-content">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Location</TableHead>
                <TableHead>Coordinates</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>HPI</TableHead>
                <TableHead>HEI</TableHead>
                <TableHead>MI</TableHead>
                <TableHead>Main Contaminants</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResults.length > 0 ? (
                filteredResults.map((result) => (
                  <TableRow key={result.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{result.location}</TableCell>
                    <TableCell>{`${result.coordinates[0].toFixed(4)}, ${result.coordinates[1].toFixed(4)}`}</TableCell>
                    <TableCell>
                      <Badge variant={getBadgeVariant(result.riskLevel)}>
                        {result.riskLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>{result.hpi.toFixed(2)}</TableCell>
                    <TableCell>{result.hei.toFixed(2)}</TableCell>
                    <TableCell>{result.mi.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {result.mainContaminants.map((contaminant, index) => (
                          <Badge key={index} variant="outline">
                            {contaminant}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <AlertTriangle className="h-8 w-8 text-muted-foreground mb-2" />
                      <p>No results found for the selected filter.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Data Visualization Section */}
      {results.length > 0 && chartData && (
        <div className="space-y-6">
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-2">Data Visualization</h4>
            <p className="text-sm text-muted-foreground">Visual analysis of uploaded CSV data</p>
          </div>
          
          {/* Summary Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="dashboard-card">
              <CardContent className="dashboard-card-content p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Samples</p>
                    <p className="text-2xl font-bold">{chartData.totalSamples}</p>
                  </div>
                  <FileText className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="dashboard-card">
              <CardContent className="dashboard-card-content p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Average HPI</p>
                    <p className="text-2xl font-bold">{chartData.avgHPI}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="dashboard-card">
              <CardContent className="dashboard-card-content p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">High Risk Sites</p>
                    <p className="text-2xl font-bold text-destructive">
                      {chartData.riskPieData.find(d => d.name === 'High Risk')?.value || 0}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-destructive/10 rounded-full flex items-center justify-center">
                    <div className="h-4 w-4 bg-destructive rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="dashboard-card">
              <CardContent className="dashboard-card-content p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Safe Sites</p>
                    <p className="text-2xl font-bold text-primary">
                      {chartData.riskPieData.find(d => d.name === 'Low Risk')?.value || 0}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <div className="h-4 w-4 bg-primary rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Level Distribution Pie Chart */}
            <Card className="dashboard-card">
              <CardContent className="dashboard-card-content p-4">
                <div className="flex items-center mb-4">
                  <PieChartIcon className="h-5 w-5 mr-2 text-primary" />
                  <h5 className="font-medium">Risk Level Distribution</h5>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData.riskPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.riskPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Average Index Values Bar Chart */}
            <Card className="dashboard-card">
              <CardContent className="dashboard-card-content p-4">
                <div className="flex items-center mb-4">
                  <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                  <h5 className="font-medium">Average Pollution Indices</h5>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.indexBarData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis 
                      label={{ value: 'Index Value', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      formatter={(value: any, name: any, props: any) => [
                        `${Number(value).toFixed(2)}`,
                        props.payload.full || name
                      ]}
                    />
                    <Bar dataKey="value" fill="var(--primary)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Contaminants Bar Chart */}
            <Card className="dashboard-card">
              <CardContent className="dashboard-card-content p-4">
                <div className="flex items-center mb-4">
                  <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                  <h5 className="font-medium">Most Common Contaminants</h5>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.contaminantBarData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis 
                      label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      formatter={(value: any, name: any, props: any) => [
                        `${value} samples (${props.payload.percentage}%)`,
                        'Detected in'
                      ]}
                    />
                    <Bar dataKey="value" fill="var(--destructive)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* HPI Range Distribution */}
            <Card className="dashboard-card">
              <CardContent className="dashboard-card-content p-4">
                <div className="flex items-center mb-4">
                  <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                  <h5 className="font-medium">HPI Range Distribution</h5>
                </div>
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
                      formatter={(value: any) => [
                        `${value} samples`,
                        'Count'
                      ]}
                    />
                    <Bar dataKey="value" fill="var(--chart-1)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </motion.div>
  );
}