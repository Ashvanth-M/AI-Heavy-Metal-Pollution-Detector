
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, FileDown, AlertCircle, CheckCircle2, X } from "lucide-react";
import { useUploadCSV, usePollutionData, usePollutionDataCount } from "@/hooks/use-samples";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { RiskResultsTable, type RiskResult } from "./risk-results-table";
import { HistorySection } from "./history-section";
import { MapContext } from "@/contexts/MapContext";
import Papa from "papaparse";
import { useState, useRef, useContext, useCallback, useMemo } from "react";
// We'll import jsPDF and jspdf-autotable dynamically in the exportToPDF function


export function UploadForm() {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [riskResults, setRiskResults] = useState<RiskResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadCSV();
  const { toast } = useToast();
  const { updateMapData } = useContext(MapContext);
  
  // Fetch persistent pollution data and count
  const { data: pollutionData = [], refetch: refetchPollutionData } = usePollutionData();
  const { data: pollutionCount } = usePollutionDataCount();

  // Parse CSV file with PapaParse for preview and validation
  const parseCSVFile = useCallback((file: File) => {
    if (!file) return;
    
    setUploadProgress(10);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      preview: 5, // Preview first 5 rows
      complete: (results) => {
        console.log("CSV Parse Results:", results);
        
        setCsvHeaders(results.meta.fields || []);
        setCsvPreview(results.data as any[]);
        
        // Validate required columns
        const headers = results.meta.fields || [];
        const normalizedHeaders = headers.map(h => h.toLowerCase());
        
        const errors: string[] = [];
        
        // Check for latitude/longitude
        const hasLat = normalizedHeaders.some(h => 
          ['latitude', 'lat', 'y'].some(term => h.includes(term))
        );
        const hasLng = normalizedHeaders.some(h => 
          ['longitude', 'long', 'lng', 'x'].some(term => h.includes(term))
        );
        
        if (!hasLat) errors.push("Missing latitude column (latitude, lat, or y)");
        if (!hasLng) errors.push("Missing longitude column (longitude, long, lng, or x)");
        
        // Check for value columns (at least one should exist)
        const hasValue = normalizedHeaders.some(h => 
          ['value', 'concentration', 'hpi', 'reading', 'amount', 'level'].some(term => h.includes(term))
        ) || normalizedHeaders.some(h => 
          ['lead', 'cadmium', 'arsenic', 'mercury', 'chromium', 'nickel', 'zinc', 'copper', 'pb', 'cd', 'as', 'hg', 'cr', 'ni', 'zn', 'cu'].some(term => h.includes(term))
        );
        
        if (!hasValue) {
          errors.push("Missing value columns (should have 'value', 'concentration', metal names, or calculated indices)");
        }
        
        setParseErrors(errors);
        setUploadProgress(25);
        
        if (errors.length === 0) {
          toast({
            title: "CSV Preview Ready",
            description: `Found ${results.data.length} rows with ${headers.length} columns`,
          });
        } else {
          toast({
            title: "CSV Validation Issues",
            description: `Found ${errors.length} issues that need to be resolved`,
            variant: "destructive",
          });
        }
      },
      error: (error) => {
        console.error("CSV Parse Error:", error);
        setParseErrors([`Failed to parse CSV: ${error.message}`]);
        toast({
          title: "CSV Parse Error",
          description: error.message,
          variant: "destructive",
        });
      }
    });
  }, [toast]);
  const quickChartData = useMemo(() => {
    if (!riskResults || riskResults.length === 0) return null;

    const riskDistribution = riskResults.reduce((acc, result) => {
      acc[result.riskLevel] = (acc[result.riskLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const pieData = Object.entries(riskDistribution).map(([risk, count]) => ({
      name: risk,
      value: count,
      color: risk === 'Low Risk' ? '#10B981' : 
             risk === 'Medium Risk' ? '#F59E0B' : 
             risk === 'High Risk' ? '#EF4444' : '#6B7280'
    }));

    const avgHPI = riskResults.reduce((sum, r) => sum + r.hpi, 0) / riskResults.length;
    const avgHEI = riskResults.reduce((sum, r) => sum + r.hei, 0) / riskResults.length;
    const avgMI = riskResults.reduce((sum, r) => sum + r.mi, 0) / riskResults.length;

    const indexData = [
      { name: 'HPI', value: Number(avgHPI.toFixed(2)) },
      { name: 'HEI', value: Number(avgHEI.toFixed(2)) },
      { name: 'MI', value: Number(avgMI.toFixed(2)) }
    ];

    return { pieData, indexData };
  }, [riskResults]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type === "text/csv" || file.name.endsWith('.csv')) {
        setSelectedFile(file);
        // Reset previous state
        setCsvPreview([]);
        setCsvHeaders([]);
        setParseErrors([]);
        setUploadProgress(0);
        // Parse the file for preview
        parseCSVFile(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select a CSV file",
          variant: "destructive",
        });
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type === "text/csv" || file.name.endsWith('.csv')) {
        setSelectedFile(file);
        // Reset previous state
        setCsvPreview([]);
        setCsvHeaders([]);
        setParseErrors([]);
        setUploadProgress(0);
        // Parse the file for preview
        parseCSVFile(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select a CSV file",
          variant: "destructive",
        });
      }
    }
  };

  // Helper function to determine risk level based on sample data using standard HPI categorization
  const determineRiskLevel = (sample: any): RiskResult["riskLevel"] => {
    // Use HPI value primarily, falling back to HEI or MI if HPI not available
    let hpi = parseFloat(sample.hpi || 0);
    
    // If HPI is not available or zero, try to estimate from HEI or MI
    if (!hpi && sample.hei) {
      // Convert HEI to approximate HPI equivalent
      hpi = parseFloat(sample.hei) * 2.5; // Rough conversion factor
    } else if (!hpi && sample.mi) {
      // Convert MI to approximate HPI equivalent  
      hpi = parseFloat(sample.mi) * 40; // Rough conversion factor
    }
    
    // Use standard HPI categorization (same as backend)
    if (hpi < 100) return "Low Risk";
    if (hpi < 180) return "Medium Risk";
    return "High Risk"; // This will map to "Critical" in the map display
  };
  
  // Helper function to determine main contaminants
  const determineMainContaminants = (sample: any): string[] => {
    const contaminants: string[] = [];
    const thresholds: Record<string, number> = {
      lead: 0.01,
      cadmium: 0.003,
      arsenic: 0.01,
      mercury: 0.001,
      chromium: 0.05,
      copper: 1.0,
      zinc: 5.0,
      nickel: 0.02
    };
    
    // Check each potential contaminant against its threshold
    Object.entries(sample).forEach(([key, value]) => {
      if (key in thresholds && typeof value === 'number' && value >= thresholds[key as keyof typeof thresholds]) {
        contaminants.push(key.charAt(0).toUpperCase() + key.slice(1));
      }
    });
    
    return contaminants;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to upload",
        variant: "destructive",
      });
      return;
    }

    if (parseErrors.length > 0) {
      toast({
        title: "CSV Validation Failed",
        description: "Please fix the issues in your CSV file before uploading",
        variant: "destructive",
      });
      return;
    }

    // Validate file size
    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploadProgress(50);
      
      toast({
        title: "Processing",
        description: "Uploading and analyzing CSV data...",
      });
      
      console.log("Starting CSV upload for file:", selectedFile.name);
      const result = await uploadMutation.mutateAsync(selectedFile);
      console.log("Upload result:", result);
      
      setUploadProgress(75);
      
      // Refetch pollution data to get the latest from database
      await refetchPollutionData();
      
      if (result && result.data && Array.isArray(result.data)) {
        console.log("Processing uploaded data:", result.data.length);
        
        // Transform the persistent data for display
        const processedResults: RiskResult[] = result.data.map((data: any, index: number) => {
          console.log("Processing pollution data:", index, data);
          return {
            id: data._id || `data-${index}`,
            location: data.location || `Location ${index + 1}`,
            coordinates: [
              parseFloat(data.latitude || 0), 
              parseFloat(data.longitude || 0)
            ],
            riskLevel: data.riskLevel || 'Low Risk',
            hpi: parseFloat(data.hpi || 0),
            hei: parseFloat(data.hei || 0),
            mi: parseFloat(data.mi || 0),
            mainContaminants: [], // Will be determined from pollution data if needed
          };
        });
        
        console.log("Processed results:", processedResults);
        setRiskResults(processedResults);
        setShowResults(true);
        setUploadProgress(90);
        
        // Update the map data through context for immediate display
        if (updateMapData) {
          console.log("Updating map with new data...");
          updateMapData(processedResults);
          setUploadProgress(100);
          
          toast({
            title: "Success",
            description: `CSV uploaded & saved: ${processedResults.length} entries to persistent database and updated map`,
          });
        } else {
          console.warn("MapContext updateMapData not available");
          setUploadProgress(100);
          
          toast({
            title: "Success",
            description: `CSV uploaded & saved: ${processedResults.length} entries to persistent database`,
          });
        }
      } else {
        console.error("Invalid response format:", result);
        toast({
          title: "Error",
          description: "Failed to process CSV data - invalid response format",
          variant: "destructive",
        });
      }
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      // Reset progress after a delay
      setTimeout(() => setUploadProgress(0), 2000);
    } catch (error) {
      console.error("Error processing CSV:", error);
      setUploadProgress(0);
      
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      
      // Reset the file input on error
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Function to export table data to PDF
  const exportToPDF = () => {
    if (riskResults.length === 0) {
      toast({
        title: "No data to export",
        description: "Please upload and process CSV data first",
        variant: "destructive",
      });
      return;
    }

    try {
      // Import jspdf and jspdf-autotable dynamically
      import('jspdf').then(jsPDFModule => {
        import('jspdf-autotable').then(autoTableModule => {
          const jsPDF = jsPDFModule.default;
          const doc = new jsPDF();
          
          // Add title
          doc.setFontSize(18);
          doc.text("Water Quality Risk Assessment Report", 14, 22);
          
          // Add timestamp
          doc.setFontSize(10);
          doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
          
          // Create table using the autoTable function
          const autoTable = autoTableModule.default;
          autoTable(doc, {
            head: [['Location', 'Risk Level', 'HPI', 'HEI', 'MI', 'Main Contaminants']],
            body: riskResults.map(result => [
              result.location,
              result.riskLevel,
              result.hpi.toFixed(2),
              result.hei.toFixed(2),
              result.mi.toFixed(2),
              result.mainContaminants.join(', ')
            ]),
            startY: 40,
            theme: 'striped',
            headStyles: { fillColor: [41, 128, 185] },
          });
          
          // Save the PDF
          doc.save('water_quality_report.pdf');
          
          toast({
            title: "Export successful",
            description: "PDF report has been downloaded",
          });
        }).catch(err => {
          console.error("Error loading jspdf-autotable:", err);
          toast({
            title: "Export failed",
            description: "Failed to load PDF generation library",
            variant: "destructive",
          });
        });
      }).catch(err => {
        console.error("Error loading jsPDF:", err);
        toast({
          title: "Export failed",
          description: "Failed to load PDF generation library",
          variant: "destructive",
        });
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Export failed",
        description: "Failed to generate PDF report",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="dashboard-card animate-dashboard-card">
        <CardHeader className="dashboard-card-header">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="dashboard-card-title">Upload CSV Data</CardTitle>
              <CardDescription>Upload water quality data for analysis and visualization</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={exportToPDF}
              disabled={riskResults.length === 0}
              className="flex items-center gap-1"
            >
              <FileDown className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent className="dashboard-card-content">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                dragActive 
                  ? "border-primary bg-primary/10" 
                  : "border-border hover:border-primary hover:bg-muted/50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              data-testid="drop-zone"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                data-testid="input-csv-file"
              />
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {selectedFile ? (
                  <div className="space-y-2">
                    <FileText className="w-12 h-12 text-primary mx-auto" />
                    <p className="text-lg font-medium">{selectedFile.name}</p>
                    <p className="text-muted-foreground">Click to change file</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
                    <div>
                      <p className="text-lg font-medium">Drop CSV file here or click to browse</p>
                      <p className="text-sm text-muted-foreground mt-1">Required: latitude, longitude + metal data (lead, cadmium, etc.) or HPI/HEI/CF values</p>
                    </div>
                  </div>
                )}              
              </motion.div>
            </div>
            
            {/* CSV Preview and Validation */}
            {selectedFile && (csvPreview.length > 0 || parseErrors.length > 0) && (
              <Card className="mt-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {parseErrors.length === 0 ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                    CSV Preview & Validation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Upload Progress */}
                  {uploadProgress > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Processing...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {/* Validation Errors */}
                  {parseErrors.length > 0 && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <div className="flex items-start gap-2">
                        <X className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-red-700">Validation Issues Found:</p>
                          <ul className="mt-1 text-sm text-red-600 list-disc list-inside">
                            {parseErrors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* CSV Headers */}
                  {csvHeaders.length > 0 && (
                    <div className="mb-4">
                      <p className="font-medium text-sm mb-2">Detected Columns ({csvHeaders.length}):</p>
                      <div className="flex flex-wrap gap-1">
                        {csvHeaders.map((header, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-muted text-xs rounded-md font-mono"
                          >
                            {header}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* CSV Preview Table */}
                  {csvPreview.length > 0 && (
                    <div>
                      <p className="font-medium text-sm mb-2">Data Preview (first 5 rows):</p>
                      <div className="border rounded-md overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead className="bg-muted">
                            <tr>
                              {csvHeaders.map((header, index) => (
                                <th key={index} className="p-2 text-left font-medium">
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {csvPreview.map((row, rowIndex) => (
                              <tr key={rowIndex} className="border-t">
                                {csvHeaders.map((header, colIndex) => (
                                  <td key={colIndex} className="p-2 max-w-[100px] truncate">
                                    {String(row[header] || '')}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                type="submit" 
                disabled={!selectedFile || uploadMutation.isPending}
                className="flex-1"
                data-testid="upload-button"
              >
                {uploadMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </div>
                ) : "Process CSV Data"}
              </Button>
              
              <Button 
                type="button" 
                variant="outline"
                onClick={() => {
                  setSelectedFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                disabled={!selectedFile}
              >
                Clear
              </Button>
            </div>
            
            <div className="bg-muted/50 rounded-md p-3 text-sm">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-muted-foreground">CSV Format Requirements</p>
                  <p className="text-muted-foreground/80 mt-1">
                    Your CSV file should include columns for location data (latitude, longitude) and metal concentrations 
                    (lead, cadmium, arsenic, mercury, chromium, copper, zinc, nickel). The system will automatically 
                    calculate HPI, HEI, and MI values for risk assessment.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {showResults && riskResults.length > 0 && (
        <RiskResultsTable results={riskResults} />
      )}
      
      {/* Persistent Pollution Data Table */}
      {pollutionData && pollutionData.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg">Persistent Pollution Data</CardTitle>
                <CardDescription>
                  Data stored permanently in database ({pollutionCount?.count || pollutionData.length} total entries)
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetchPollutionData()}
                className="flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto border rounded-md">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="p-2 text-left">Location</th>
                    <th className="p-2 text-left">Coordinates</th>
                    <th className="p-2 text-left">Value</th>
                    <th className="p-2 text-left">HPI</th>
                    <th className="p-2 text-left">Risk Level</th>
                    <th className="p-2 text-left">Uploaded</th>
                  </tr>
                </thead>
                <tbody>
                  {pollutionData.map((data, index) => {
                    const riskLevel = data.riskLevel || 'Low Risk';
                    let badgeVariant: "default" | "outline" | "secondary" | "destructive" = "secondary";
                    
                    if (riskLevel.includes("Medium")) badgeVariant = "outline";
                    else if (riskLevel.includes("High")) badgeVariant = "destructive";
                    
                    return (
                      <tr key={data._id || index} className="border-t hover:bg-muted/30">
                        <td className="p-2 font-medium">{data.location || `Location ${index + 1}`}</td>
                        <td className="p-2 font-mono text-xs">
                          {data.latitude.toFixed(4)}, {data.longitude.toFixed(4)}
                        </td>
                        <td className="p-2">{data.value?.toFixed(2) || 'N/A'}</td>
                        <td className="p-2">{data.hpi?.toFixed(1) || 'N/A'}</td>
                        <td className="p-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                            riskLevel.includes("Low") ? "bg-green-100 text-green-800" :
                            riskLevel.includes("Medium") ? "bg-yellow-100 text-yellow-800" :
                            riskLevel.includes("High") ? "bg-red-100 text-red-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {riskLevel}
                          </span>
                        </td>
                        <td className="p-2 text-xs text-muted-foreground">
                          {new Date(data.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {pollutionData.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No pollution data found in database</p>
                <p className="text-sm">Upload a CSV file to add data</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Dataset History Section */}
      <HistorySection />
    </div>
  );
}
