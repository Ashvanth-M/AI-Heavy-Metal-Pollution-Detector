import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, FileSpreadsheet } from "lucide-react";
import { useSamples } from "@/hooks/use-samples";
import { type Sample } from "@shared/schema";
import { exportToExcel, exportToPDF } from "@/lib/export-utils";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { 
  calculateHEI, 
  calculateOverallCF, 
  calculatePLI,
  getHEIInterpretation, 
  getCFInterpretation,
  getPLIInterpretation
} from "@/lib/pollution-calculations";

interface DataTableProps {
  initialData?: Sample[];
}

export function DataTable({ initialData }: DataTableProps = {}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { data: apiSamples = [], isLoading: apiLoading } = useSamples();
  const { toast } = useToast();
  
  // Use initialData if provided, otherwise use API data
  const samples = initialData || apiSamples;
  const isLoading = initialData ? false : apiLoading;

  // Memoize filtered samples to prevent unnecessary re-renders
  const filteredSamples = useMemo(() => {
    return samples.filter(sample => {
      const matchesSearch = sample.sampleId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "all" || sample.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [samples, searchTerm, categoryFilter]);

  const handleExportExcel = () => {
    exportToExcel(filteredSamples);
    toast({
      title: "Export successful",
      description: "Excel file has been downloaded",
    });
  };

  const handleExportPDF = () => {
    exportToPDF(filteredSamples);
    toast({
      title: "Export successful", 
      description: "PDF report has been downloaded",
    });
  };

  const getCategoryBadge = (category: string) => {
    const variants = {
      Safe: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      Moderate: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300", 
      Critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };
    
    return (
      <Badge className={variants[category as keyof typeof variants]} data-testid={`badge-category-${category.toLowerCase()}`}>
        {category}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="p-6 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <h3 className="text-lg font-semibold">Sample Data</h3>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Input
                  placeholder="Search samples..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                  data-testid="input-search-samples"
                />
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48" data-testid="select-category-filter">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Safe">Safe</SelectItem>
                  <SelectItem value="Moderate">Moderate</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sample ID</TableHead>
                <TableHead>Latitude</TableHead>
                <TableHead>Longitude</TableHead>
                <TableHead>HPI</TableHead>
                <TableHead>HEI</TableHead>
                <TableHead>CF</TableHead>
                <TableHead>PLI</TableHead>
                <TableHead>Category</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSamples.map((sample, index) => {
                const heiValue = calculateHEI(sample);
                const cfValue = calculateOverallCF(sample);
                const pliValue = calculatePLI(sample);
                const heiInterpretation = getHEIInterpretation(heiValue);
                const cfInterpretation = getCFInterpretation(cfValue);
                const pliInterpretation = getPLIInterpretation(pliValue);
                
                return (
                  <motion.tr
                    key={sample.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="border-b border-border"
                    data-testid={`row-sample-${sample.id}`}
                  >
                    <TableCell className="font-medium" data-testid={`text-sample-id-${sample.id}`}>
                      {sample.sampleId}
                    </TableCell>
                    <TableCell data-testid={`text-latitude-${sample.id}`}>
                      {sample.latitude.toFixed(4)}
                    </TableCell>
                    <TableCell data-testid={`text-longitude-${sample.id}`}>
                      {sample.longitude.toFixed(4)}
                    </TableCell>
                    <TableCell className="font-medium" data-testid={`text-hpi-${sample.id}`}>
                      {sample.hpi.toFixed(1)}
                    </TableCell>
                    <TableCell className="font-medium" data-testid={`text-hei-${sample.id}`}>
                      <div className="flex flex-col">
                        <span className={heiInterpretation.color}>
                          {heiValue.toFixed(2)}
                        </span>
                        <span className={`text-xs ${heiInterpretation.color}`}>
                          {heiInterpretation.level}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium" data-testid={`text-cf-${sample.id}`}>
                      <div className="flex flex-col">
                        <span className={cfInterpretation.color}>
                          {cfValue.toFixed(2)}
                        </span>
                        <span className={`text-xs ${cfInterpretation.color}`}>
                          {cfInterpretation.level}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium" data-testid={`text-pli-${sample.id}`}>
                      <div className="flex flex-col">
                        <span className={pliInterpretation.color}>
                          {pliValue.toFixed(2)}
                        </span>
                        <span className={`text-xs ${pliInterpretation.color}`}>
                          {pliInterpretation.level}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getCategoryBadge(sample.category)}
                    </TableCell>
                  </motion.tr>
                );
              })}
            </TableBody>
          </Table>
          
          {filteredSamples.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {samples.length === 0 
                ? "No samples uploaded yet. Upload a CSV file to get started."
                : "No samples match your search criteria."
              }
            </div>
          )}
        </div>
        
        <div className="px-6 py-4 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <p className="text-sm text-muted-foreground" data-testid="text-sample-count">
            Showing {filteredSamples.length} of {samples.length} samples
          </p>
          <div className="flex space-x-2">
            <Button
              onClick={handleExportPDF}
              className="text-sm"
              disabled={filteredSamples.length === 0}
              data-testid="button-export-pdf"
            >
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button
              variant="outline"
              onClick={handleExportExcel}
              className="text-sm"
              disabled={filteredSamples.length === 0}
              data-testid="button-export-excel"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
