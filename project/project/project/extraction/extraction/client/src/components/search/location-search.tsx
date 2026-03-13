import { useState, useEffect } from "react";
import { Search, MapPin, Droplet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "wouter";
import axios from "axios";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface WaterCondition {
  hpi: number;
  category: "Safe" | "Moderate" | "Critical";
  message: string;
  recommendations: string[];
}

export function LocationSearch({ onSearch }: { onSearch: (params: any) => void }) {
  const [location, setLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [waterCondition, setWaterCondition] = useState<WaterCondition | null>(null);
  const [searchingCondition, setSearchingCondition] = useState(false);
  const { toast } = useToast();
  const [, setSearchParams] = useSearchParams();

  const handleLocationSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) {
      toast({
        title: "Location required",
        description: "Please enter a location to search",
        variant: "destructive",
      });
      return;
    }

    setSearchParams({ location });
    onSearch({ location });
    
    // Fetch water condition for this location
    await fetchWaterCondition({ location });
  };

  // Default fallback coordinates for major Indian cities
  const fallbackLocations = [
    { name: "Chennai", lat: 13.0827, lng: 80.2707 },
    { name: "Mumbai", lat: 19.0760, lng: 72.8777 },
    { name: "Delhi", lat: 28.7041, lng: 77.1025 },
    { name: "Bangalore", lat: 12.9716, lng: 77.5946 },
    { name: "Kolkata", lat: 22.5726, lng: 88.3639 }
  ];

  const handleGeolocationSearch = async () => {
    if (!navigator.geolocation) {
      // Use fallback location if geolocation is not supported
      const fallback = fallbackLocations[0]; // Default to Chennai
      
      toast({
        title: "Geolocation not supported",
        description: `Using default location (${fallback.name}) instead`,
        variant: "warning",
      });
      
      setSearchParams({ lat: fallback.lat.toString(), lng: fallback.lng.toString() });
      onSearch({ lat: fallback.lat, lng: fallback.lng });
      
      // Fetch water condition for fallback coordinates
      await fetchWaterCondition({ lat: fallback.lat, lng: fallback.lng });
      return;
    }

    setIsLoading(true);
    
    try {
      // Use the GeolocationService instead of direct navigator.geolocation
      const { GeolocationService } = await import('@/services/geolocation');
      const geolocationService = GeolocationService.getInstance();
      
      try {
        const position = await geolocationService.getCurrentPosition();
        
        // Coordinates are already validated in the service
        const { latitude, longitude } = position;
        
        setSearchParams({ lat: latitude.toString(), lng: longitude.toString() });
        onSearch({ lat: latitude, lng: longitude });
        
        toast({
          title: "Location found",
          description: `Searching near ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        });
        
        // Fetch water condition for these coordinates
        await fetchWaterCondition({ lat: latitude, lng: longitude });
      } catch (geoError: any) {
        // Use fallback location if geolocation fails
        const randomIndex = Math.floor(Math.random() * fallbackLocations.length);
        const fallback = fallbackLocations[randomIndex];
        
        console.error("Geolocation service error:", geoError);
        toast({
          title: "Geolocation error",
          description: `${geoError.message || "Failed to get your location"}. Using ${fallback.name} as fallback.`,
          variant: "warning",
        });
        
        setSearchParams({ lat: fallback.lat.toString(), lng: fallback.lng.toString() });
        onSearch({ lat: fallback.lat, lng: fallback.lng });
        
        // Fetch water condition for fallback coordinates
        await fetchWaterCondition({ lat: fallback.lat, lng: fallback.lng });
      }
    } catch (error) {
      // This would be an error importing the service or other unexpected error
      console.error("Unexpected error in geolocation handling:", error);
      
      // Use fallback location if there's an unexpected error
      const fallback = fallbackLocations[0]; // Default to Chennai
      
      toast({
        title: "Geolocation error",
        description: `${error instanceof Error ? error.message : "An unexpected error occurred"}. Using ${fallback.name} as fallback.`,
        variant: "warning",
      });
      
      setSearchParams({ lat: fallback.lat.toString(), lng: fallback.lng.toString() });
      onSearch({ lat: fallback.lat, lng: fallback.lng });
      
      // Fetch water condition for fallback coordinates
      await fetchWaterCondition({ lat: fallback.lat, lng: fallback.lng });
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchWaterCondition = async (params: any) => {
    setSearchingCondition(true);
    try {
      // Call the API to get water condition data
      const response = await axios.get('/api/samples/nearby', { params });
      
      if (response.data && response.data.samples && response.data.samples.length > 0) {
        // Calculate average HPI from nearby samples
        const samples = response.data.samples;
        const totalHPI = samples.reduce((sum: number, sample: any) => sum + sample.hpi, 0);
        const avgHPI = totalHPI / samples.length;
        
        // Determine category based on HPI
        let category: "Safe" | "Moderate" | "Critical" = "Safe";
        if (avgHPI >= 180) {
          category = "Critical";
        } else if (avgHPI >= 100) {
          category = "Moderate";
        }
        
        // Generate recommendations based on category
        const recommendations = [];
        if (category === "Safe") {
          recommendations.push("Water is generally safe for consumption");
          recommendations.push("Continue regular monitoring");
        } else if (category === "Moderate") {
          recommendations.push("Consider filtering water before consumption");
          recommendations.push("Monitor water quality regularly");
          recommendations.push("Check with local authorities for updates");
        } else {
          recommendations.push("Avoid using water for drinking purposes");
          recommendations.push("Use alternative water sources");
          recommendations.push("Contact local environmental authorities immediately");
          recommendations.push("Consider water testing for specific contaminants");
        }
        
        // Set water condition state
        setWaterCondition({
          hpi: avgHPI,
          category,
          message: `Water quality in this area is classified as ${category} based on ${samples.length} nearby samples.`,
          recommendations
        });
      } else {
        // No data available
        setWaterCondition({
          hpi: 0,
          category: "Safe",
          message: "No water quality data available for this location.",
          recommendations: ["Consider water testing to establish baseline data", "Check with local authorities for information"]
        });
      }
    } catch (error) {
      console.error("Error fetching water condition:", error);
      toast({
        title: "Error",
        description: "Failed to fetch water condition data",
        variant: "destructive",
      });
    } finally {
      setSearchingCondition(false);
    }
  };

  return (
    <>
      <Card className="mb-6">
        <CardContent className="pt-6">
          <form onSubmit={handleLocationSearch} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by location name..."
                className="pl-8"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={isLoading || searchingCondition}>Search</Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleGeolocationSearch}
              disabled={isLoading || searchingCondition}
            >
              <MapPin className="mr-2 h-4 w-4" />
              {isLoading ? "Locating..." : "Near Me"}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {searchingCondition && (
        <Card className="mb-6">
          <CardContent className="py-4 flex items-center justify-center">
            <div className="animate-pulse flex items-center">
              <Droplet className="h-5 w-5 mr-2 text-blue-500" />
              <span>Analyzing water conditions...</span>
            </div>
          </CardContent>
        </Card>
      )}
      
      {waterCondition && !searchingCondition && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Water Condition Results</CardTitle>
              <Badge 
                variant={
                  waterCondition.category === "Safe" ? "outline" : 
                  waterCondition.category === "Moderate" ? "secondary" : 
                  "destructive"
                }
              >
                {waterCondition.category}
              </Badge>
            </div>
            <CardDescription>{waterCondition.message}</CardDescription>
          </CardHeader>
          <CardContent>
            {waterCondition.hpi > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium mb-1">Heavy Metal Pollution Index (HPI)</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      waterCondition.category === "Safe" ? "bg-green-500" : 
                      waterCondition.category === "Moderate" ? "bg-yellow-500" : 
                      "bg-red-500"
                    }`} 
                    style={{ width: `${Math.min(100, (waterCondition.hpi / 200) * 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span>0</span>
                  <span>100</span>
                  <span>200+</span>
                </div>
              </div>
            )}
            
            <div>
              <p className="text-sm font-medium mb-2">Recommendations:</p>
              <ul className="list-disc pl-5 space-y-1">
                {waterCondition.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm">{rec}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}