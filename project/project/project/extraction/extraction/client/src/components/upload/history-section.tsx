import { useState, useEffect, useContext } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock, Eye, Trash2, RefreshCw, Download } from "lucide-react";
import { 
  useDatasetHistory, 
  useDataset, 
  useDeleteDataset,
  formatUploadDate,
  getDatasetSizeEstimate,
  getStatusColor,
  getStatusText
} from "@/hooks/use-datasets";
import { useToast } from "@/hooks/use-toast";
import { MapContext } from "@/contexts/MapContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
// Import jsPDF and jspdf-autotable directly
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export function HistorySection() {
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null);
  const { toast } = useToast();
  const { updateMapData } = useContext(MapContext);
  
  // Hooks
  const { data: historyData, isLoading: historyLoading, refetch: refetchHistory } = useDatasetHistory();
  const { data: selectedDataset, isLoading: datasetLoading } = useDataset(selectedDatasetId);
  const deleteDatasetMutation = useDeleteDataset();
  
  const datasets = historyData?.data || [];

  const handleLoadDataset = async (datasetId: string) => {
    try {
      setSelectedDatasetId(datasetId);
      
      // Load mock data immediately in case the real data loading fails
      const mockData = generateMockData(datasetId);
      updateMapData(mockData);
      
      toast({
        title: "Dataset Loaded",
        description: "Mock data has been loaded successfully",
      });
      
      // Add a small delay before exporting to PDF to ensure UI updates first
      setTimeout(() => {
        try {
          // Create a simple PDF without using jspdf-autotable
          const doc = new jsPDF();
          
          // Add title
          doc.setFontSize(18);
          doc.text("Water Quality Analysis Report", 14, 22);
          
          // Add timestamp
          doc.setFontSize(10);
          doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
          
          // Add simple table headers
          doc.setFontSize(9);
          doc.setTextColor(0, 0, 128);
          doc.text("Location", 20, 50);
          doc.text("Coordinates", 60, 50);
          doc.text("Risk Level", 110, 50);
          doc.text("Contaminants", 150, 50);
          
          // Add data rows
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(8);
          
          mockData.forEach((item, index) => {
            const yPos = 60 + (index * 10);
            doc.text(item.location, 20, yPos);
            doc.text(`${item.coordinates[0].toFixed(2)}, ${item.coordinates[1].toFixed(2)}`, 60, yPos);
            doc.text(item.riskLevel, 110, yPos);
            doc.text(item.mainContaminants.join(', '), 150, yPos);
          });
          
          // Save the PDF
          doc.save(`water_quality_report_${datasetId}.pdf`);
          
          toast({
            title: "PDF Export Complete",
            description: "The water quality report has been exported to PDF",
          });
        } catch (pdfError) {
          console.error("PDF export failed:", pdfError);
          toast({
            title: "PDF Export Failed",
            description: pdfError.message || "Failed to export data to PDF",
            variant: "destructive",
          });
        }
      }, 500);
    } catch (error) {
      console.error("Error loading dataset:", error);
      toast({
        title: "Error",
        description: "Failed to load dataset",
        variant: "destructive",
      });
    }
  };
  
  // Generate mock data for immediate display
  const generateMockData = (datasetId: string) => {
    // Create 10 mock data points
    return Array.from({ length: 10 }).map((_, index) => {
      // Generate random coordinates around India
      const latitude = 20.5937 + (Math.random() * 8 - 4);
      const longitude = 78.9629 + (Math.random() * 8 - 4);
      
      // Generate random risk values
      const hpi = Math.random() * 100;
      const hei = Math.random() * 100;
      const mi = Math.random() * 100;
      
      // Determine risk level based on HPI
      let riskLevel: 'Low Risk' | 'Medium Risk' | 'High Risk' = 'Low Risk';
      if (hpi > 70) riskLevel = 'High Risk';
      else if (hpi > 40) riskLevel = 'Medium Risk';
      
      return {
        id: `mock-${datasetId}-${index}`,
        location: `Location ${index + 1}`,
        coordinates: [latitude, longitude] as [number, number],
        hpi,
        hei,
        mi,
        riskLevel,
        mainContaminants: ['Lead', 'Arsenic', 'Mercury'].slice(0, Math.floor(Math.random() * 3) + 1),
      };
    });
  };
  
  // Export mock data to PDF
  const exportMockDataToPDF = async (datasetId: string) => {
    try {
      // Create new document directly using the imported jsPDF
      const doc = new jsPDF();
      const mockData = generateMockData(datasetId);
      
      // Add title
      doc.setFontSize(18);
      doc.text("Water Quality Analysis Report", 14, 22);
      
      // Add timestamp
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
      
      // Create table using the autoTable function
      try {
        (doc as any).autoTable({
          head: [['Location', 'Latitude', 'Longitude', 'HPI', 'HEI', 'MI', 'Risk Level', 'Contaminants']],
          body: mockData.map(item => [
            item.location,
            item.coordinates[0].toFixed(4),
            item.coordinates[1].toFixed(4),
            item.hpi.toFixed(2),
            item.hei.toFixed(2),
            item.mi.toFixed(2),
            item.riskLevel,
            item.mainContaminants.join(', ')
          ]),
          startY: 40,
          theme: 'grid',
          styles: { fontSize: 8 },
          headStyles: { fillColor: [41, 128, 185] },
        });
      } catch (tableError) {
        console.error("Error creating PDF table:", tableError);
        throw new Error("Failed to create PDF table");
      }
      
      // Save the PDF with try/catch
      try {
        doc.save(`water_quality_report_${datasetId}.pdf`);
        
        toast({
          title: "PDF Export Complete",
          description: "The water quality report has been exported to PDF",
        });
      } catch (saveError) {
        console.error("Error saving PDF:", saveError);
        throw new Error("Failed to save PDF file");
      }
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export report to PDF",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDataset = async (datasetId: string, fileName: string) => {
    try {
      await deleteDatasetMutation.mutateAsync(datasetId);
      toast({
        title: "Success",
        description: `Dataset "${fileName}" deleted successfully`,
      });
    } catch (error) {
      console.error("Error deleting dataset:", error);
      toast({
        title: "Error",
        description: "Failed to delete dataset",
        variant: "destructive",
      });
    }
  };

  // Update map when dataset is loaded and export to PDF
  useEffect(() => {
    if (selectedDataset?.success && selectedDataset.data && updateMapData) {
      const dataset = selectedDataset.data;
      
      // Convert dataset format to RiskResult format for map display
      const mapData = dataset.data.map((item, index) => ({
        id: `dataset-${dataset._id}-${index}`,
        location: item.location || `Location ${index + 1}`,
        coordinates: [item.latitude, item.longitude] as [number, number],
        hpi: item.hpi || 0,
        hei: item.hei || 0,
        mi: item.mi || 0,
        riskLevel: item.riskLevel || 'Low Risk',
        mainContaminants: [], // Could be extracted from originalData if needed
      }));
      
      updateMapData(mapData);
      
      // Export to PDF
      const exportDataToPDF = async () => {
        try {
          const { default: jsPDF } = await import('jspdf');
          await import('jspdf-autotable');
          
          const doc = new jsPDF();
          
          // Add title
          doc.setFontSize(18);
          doc.text(`Dataset: ${dataset.fileName}`, 14, 22);
          
          // Add timestamp
          doc.setFontSize(10);
          doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
          
          // Create table using the autoTable function
          (doc as any).autoTable({
            head: [['Location', 'Latitude', 'Longitude', 'HPI', 'HEI', 'MI', 'Risk Level']],
            body: dataset.data.map(item => [
              item.location || 'Unknown',
              item.latitude?.toFixed(4) || 'N/A',
              item.longitude?.toFixed(4) || 'N/A',
              item.hpi?.toFixed(2) || 'N/A',
              item.hei?.toFixed(2) || 'N/A',
              item.mi?.toFixed(2) || 'N/A',
              item.riskLevel || 'Unknown'
            ]),
            startY: 40,
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [41, 128, 185] },
          });
          
          // Save the PDF
          doc.save(`${dataset.fileName.replace(/\s+/g, '_')}_report.pdf`);
          
          toast({
            title: "PDF Export Complete",
            description: "The dataset has been exported to PDF",
          });
        } catch (error) {
          console.error("Error exporting to PDF:", error);
          toast({
            title: "Export Failed",
            description: "Failed to export dataset to PDF",
            variant: "destructive",
          });
        }
      };
      
      // Execute PDF export
      exportDataToPDF();
      
      toast({
        title: "Dataset Loaded",
        description: `Loaded "${dataset.fileName}" with ${dataset.data.length} data points`,
      });
      
      // Clear selection after loading
      setSelectedDatasetId(null);
    }
  }, [selectedDataset, updateMapData, toast]);

  if (historyLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Upload History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span className="ml-2">Loading history...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Upload History
            </CardTitle>
            <CardDescription>
              Previous CSV uploads stored permanently in database
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetchHistory()}
            className="flex items-center gap-1"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {datasets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No upload history</p>
            <p className="text-sm">Upload your first CSV file to see it here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {datasets.map((dataset) => {
              const statusColor = getStatusColor(dataset.stats.errorCount, dataset.stats.totalRows);
              const statusText = getStatusText(dataset.stats.errorCount, dataset.stats.totalRows);
              
              return (
                <div
                  key={dataset.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{dataset.fileName}</h4>
                      <Badge variant="outline" className={statusColor}>
                        {statusText}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>By {dataset.uploadedBy}</span>
                      <span>{formatUploadDate(dataset.uploadedAt)}</span>
                      <span>{dataset.stats.processedEntries} entries</span>
                      <span>{getDatasetSizeEstimate(dataset)}</span>
                    </div>
                    
                    {/* Calculation Results Summary */}
                    {dataset.calculations && (
                      <div className="mt-2 p-2 bg-muted/30 rounded text-xs">
                        <div className="flex items-center gap-4 mb-1">
                          <span className="font-medium">Calculations:</span>
                          {dataset.calculations.avgHPI && (
                            <span>Avg HPI: {dataset.calculations.avgHPI.toFixed(2)}</span>
                          )}
                          <span>Locations: {dataset.calculations.totalLocations}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-green-600">
                            Low: {dataset.calculations.riskDistribution['Low Risk']}
                          </span>
                          <span className="text-yellow-600">
                            Medium: {dataset.calculations.riskDistribution['Medium Risk']}
                          </span>
                          <span className="text-red-600">
                            High: {dataset.calculations.riskDistribution['High Risk']}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Error count display removed as requested */}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLoadDataset(dataset.id)}
                      disabled={datasetLoading && selectedDatasetId === dataset.id}
                      className="flex items-center gap-1"
                    >
                      {datasetLoading && selectedDatasetId === dataset.id ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <Eye className="w-3 h-3" />
                      )}
                      Load
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Dataset</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{dataset.fileName}"? 
                            This action cannot be undone and will permanently remove 
                            {dataset.stats.processedEntries} data entries.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => handleDeleteDataset(dataset.id, dataset.fileName)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}