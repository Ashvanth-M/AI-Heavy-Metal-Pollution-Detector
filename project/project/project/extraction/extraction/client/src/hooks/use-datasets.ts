import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Types for dataset management
export interface DatasetHistoryItem {
  id: string;
  fileName: string;
  uploadedAt: string;
  uploadedBy: string;
  stats: {
    totalRows: number;
    processedEntries: number;
    errorCount: number;
  };
  calculations?: {
    riskDistribution: {
      'Low Risk': number;
      'Medium Risk': number;
      'High Risk': number;
    };
    avgHPI: number | null;
    totalLocations: number;
    locationsWithHPI: number;
  };
}

export interface Dataset {
  _id: string;
  fileName: string;
  uploadedAt: string;
  uploadedBy: string;
  data: {
    latitude: number;
    longitude: number;
    location?: string;
    value?: number;
    hpi?: number;
    hei?: number;
    mi?: number;
    riskLevel?: 'Low Risk' | 'Medium Risk' | 'High Risk';
    category?: 'Safe' | 'Moderate' | 'Critical';
    originalData?: any;
  }[];
  stats: {
    totalRows: number;
    processedEntries: number;
    errorCount: number;
  };
}

export interface DatasetResponse {
  success: boolean;
  data: Dataset;
  message?: string;
}

export interface HistoryResponse {
  success: boolean;
  data: DatasetHistoryItem[];
  message?: string;
}

// Hook to get dataset history with optional admin filtering
export function useDatasetHistory(uploadedBy?: string) {
  return useQuery<HistoryResponse>({
    queryKey: ["datasetHistory", uploadedBy],
    queryFn: async () => {
      const url = uploadedBy ? `/api/history?uploadedBy=${encodeURIComponent(uploadedBy)}` : "/api/history";
      const response = await fetch(url, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch dataset history");
      }
      
      return response.json();
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}

// Hook to get a specific dataset by ID
export function useDataset(id: string | null) {
  return useQuery<DatasetResponse>({
    queryKey: ["dataset", id],
    queryFn: async () => {
      if (!id) throw new Error("Dataset ID is required");
      
      const response = await fetch(`/api/datasets/${id}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch dataset");
      }
      
      return response.json();
    },
    enabled: !!id, // Only run query if ID is provided
    staleTime: 300000, // Consider data fresh for 5 minutes
  });
}

// Hook to delete a dataset (admin only)
export function useDeleteDataset() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/datasets/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete dataset");
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch dataset history
      queryClient.invalidateQueries({ queryKey: ["datasetHistory"] });
    },
  });
}

// Helper function to format upload date
export function formatUploadDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Helper function to get file size estimate (rough calculation)
export function getDatasetSizeEstimate(dataset: DatasetHistoryItem): string {
  const dataPoints = dataset.stats.processedEntries;
  const estimatedKB = Math.ceil(dataPoints * 0.5); // Rough estimate: 0.5KB per data point
  
  if (estimatedKB < 1024) {
    return `${estimatedKB} KB`;
  } else {
    return `${(estimatedKB / 1024).toFixed(1)} MB`;
  }
}

// Helper function to determine status color based on error count
export function getStatusColor(errorCount: number, totalRows: number): string {
  const errorRate = errorCount / totalRows;
  
  if (errorRate === 0) return "text-green-600";
  if (errorRate < 0.1) return "text-yellow-600";
  return "text-red-600";
}

// Helper function to get status text
export function getStatusText(errorCount: number, totalRows: number): string {
  const errorRate = errorCount / totalRows;
  
  if (errorRate === 0) return "Perfect";
  if (errorRate < 0.1) return "Good";
  return "Issues";
}