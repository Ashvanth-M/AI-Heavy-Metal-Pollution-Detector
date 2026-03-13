import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { type Sample, type Analytics } from "@shared/schema";

// Interface for pollution data from the persistent collection
export interface PollutionData {
  _id: string;
  latitude: number;
  longitude: number;
  value: number;
  location?: string;
  hpi?: number;
  hei?: number;
  mi?: number;
  riskLevel?: 'Low Risk' | 'Medium Risk' | 'High Risk';
  category?: 'Safe' | 'Moderate' | 'Critical';
  uploadedBy?: string;
  source?: string;
  createdAt: Date;
  updatedAt: Date;
}

export function useSamples(params?: { location?: string; lat?: number; lng?: number }) {
  return useQuery<Sample[]>({
    queryKey: ["/api/samples", params],
    queryFn: async ({ queryKey }) => {
      const [_, searchParams] = queryKey;
      let url = "/api/samples";
      
      if (searchParams) {
        const urlParams = new URLSearchParams();
        if ((searchParams as any).location) {
          urlParams.append("location", (searchParams as any).location);
        }
        if ((searchParams as any).lat && (searchParams as any).lng) {
          urlParams.append("lat", (searchParams as any).lat.toString());
          urlParams.append("lng", (searchParams as any).lng.toString());
        }
        
        const queryString = urlParams.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
      }
      
      const response = await fetch(url, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch samples");
      }
      
      return response.json();
    },
  });
}

export function useAnalytics() {
  return useQuery<Analytics>({
    queryKey: ["/api/analytics"],
  });
}

export function useUploadCSV() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (file: File) => {
      console.log("Uploading file:", file.name, "Size:", file.size);
      const formData = new FormData();
      formData.append("file", file);
      
      try {
        const response = await fetch("/api/samples/upload", {
          method: "POST",
          body: formData,
          credentials: 'include',
        });
        
        console.log("Upload response status:", response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Upload error:", errorData);
          throw new Error(errorData.message || "Upload failed");
        }
        
        const result = await response.json();
        console.log("Upload success:", result);
        return result;
      } catch (error) {
        console.error("Upload exception:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate both old samples and new pollution data queries
      queryClient.invalidateQueries({ queryKey: ["/api/samples"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pollution-data"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pollution-data/count"] });
    },
  });
}

export function useGenerateReport() {
  return useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/generate-report");
      return response.json();
    },
  });
}

// Hook to fetch pollution data from persistent MongoDB collection
export function usePollutionData(params?: { location?: string }) {
  return useQuery<PollutionData[]>({
    queryKey: ["/api/pollution-data", params],
    queryFn: async ({ queryKey }) => {
      const [_, searchParams] = queryKey;
      let url = "/api/pollution-data";
      
      if (searchParams && (searchParams as any).location) {
        const urlParams = new URLSearchParams();
        urlParams.append("location", (searchParams as any).location);
        url += `?${urlParams.toString()}`;
      }
      
      const response = await fetch(url, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch pollution data");
      }
      
      return response.json();
    },
    // Enable auto-refresh every 30 seconds for real-time updates
    refetchInterval: 30000,
    refetchIntervalInBackground: true,
  });
}

// Hook to get pollution data count
export function usePollutionDataCount() {
  return useQuery<{ count: number }>({
    queryKey: ["/api/pollution-data/count"],
    queryFn: async () => {
      const response = await fetch("/api/pollution-data/count", {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch pollution data count");
      }
      
      return response.json();
    },
    refetchInterval: 30000,
  });
}
