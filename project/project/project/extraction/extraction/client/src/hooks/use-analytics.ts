import { useState, useEffect } from 'react';

// Mock analytics data
const mockAnalyticsData = {
  totalSamples: 245,
  processedSamples: 198,
  pendingSamples: 47,
  riskDistribution: {
    high: 42,
    medium: 87,
    low: 69
  },
  recentActivity: [
    { id: 1, action: 'Sample uploaded', user: 'admin', timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: 2, action: 'Report generated', user: 'analyst', timestamp: new Date(Date.now() - 7200000).toISOString() },
    { id: 3, action: 'Data analyzed', user: 'scientist', timestamp: new Date(Date.now() - 10800000).toISOString() }
  ]
};

export function useAnalytics() {
  const [analyticsData, setAnalyticsData] = useState(mockAnalyticsData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // In a real application, this would fetch data from an API
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setAnalyticsData(mockAnalyticsData);
      setIsLoading(false);
    }, 500);
  }, []);

  return {
    data: analyticsData,
    isLoading,
    error
  };
}