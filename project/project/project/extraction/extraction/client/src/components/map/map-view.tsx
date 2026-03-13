// Fix HeatLayer type error
declare module 'leaflet' {
  export interface HeatMapOptions {
    minOpacity?: number;
    maxZoom?: number;
    max?: number;
    radius?: number;
    blur?: number;
    gradient?: {[key: number]: string};
  }
  
  export class HeatLayer extends Layer {
    constructor(latlngs: LatLngExpression[], options?: HeatMapOptions);
    setLatLngs(latlngs: LatLngExpression[]): this;
    addLatLng(latlng: LatLngExpression): this;
    setOptions(options: HeatMapOptions): this;
    redraw(): this;
  }
}

import { useState, useEffect, useRef, useMemo, useContext } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useSamples } from "@/hooks/use-samples";
import { usePollutionData } from "@/hooks/use-samples";
import { getMarkerColor, getRecommendation, createMarkerIcon, INDIA_BOUNDS } from "@/lib/map-utils";
import { Badge } from "@/components/ui/badge";
import { LocationSearch } from "@/components/search/location-search";
import L from "leaflet";
import "leaflet.heat";
import { useSearchParams } from "wouter";
import { mockLocations } from "@/data/mock-locations";
import { MapContext } from "@/contexts/MapContext";
import { RiskLevel } from "@/lib/risk-classification";
// Leaflet CSS is already imported in index.css

// Enhanced marker icon fix for react-leaflet with fallback
if (typeof L !== 'undefined' && L.Icon && L.Icon.Default) {
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
}

// Map controller component to handle map updates
function MapController({ center, zoom }: { center?: [number, number]; zoom?: number }) {
  const map = useMap();
  
  useEffect(() => {
    if (center && zoom) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
  return null;
}

// HeatmapLayer component to handle heat map rendering
function HeatmapLayer({ 
  data, 
  intensity = 1.0, 
  radius = 35 
}: { 
  data: Array<[number, number, number]>; 
  intensity?: number;
  radius?: number;
}) {
  const map = useMap();
  const heatLayerRef = useRef<L.HeatLayer | null>(null);

  useEffect(() => {
    if (!map || !data.length) return;

    // Remove existing heat layer
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
    }

    // Create new heat layer with enhanced visual configuration
    heatLayerRef.current = (L as any).heatLayer(data, {
      radius: radius,
      blur: Math.max(radius * 0.7, 15),
      maxZoom: 18,
      minOpacity: 0.15,
      max: intensity,
      gradient: {
        0.0: '#00ff00',  // Green for safe levels (HPI < 100)
        0.2: '#80ff00',  // Light green
        0.35: '#ffff00', // Yellow for moderate (HPI 100-150)
        0.5: '#ffcc00',  // Yellow-orange
        0.65: '#ff8000', // Orange (HPI 150-200)
        0.8: '#ff4000',  // Red-orange
        1.0: '#ff0000'   // Red for critical levels (HPI > 200)
      }
    }).addTo(map);

    return () => {
      if (heatLayerRef.current && map) {
        map.removeLayer(heatLayerRef.current);
      }
    };
  }, [map, data, intensity, radius]);

  return null;
}

export function MapView() {
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapIntensity, setHeatmapIntensity] = useState(1.0);
  const [heatmapRadius, setHeatmapRadius] = useState(35);
  const [mapCenter, setMapCenter] = useState<[number, number] | undefined>(undefined);
  const [mapZoom, setMapZoom] = useState<number | undefined>(undefined);
  const [searchParams] = useSearchParams();
  
  // Get search parameters
  const location = searchParams.get('location');
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  
  // Get map data from context
  const { mapData } = useContext(MapContext);
  
  // Fetch persistent pollution data from database
  const { data: pollutionData = [], isLoading: isPollutionLoading, refetch: refetchPollutionData } = usePollutionData({
    location: location || undefined
  });
  
  // Memoize query params to avoid infinite refetch due to object identity changes
  const samplesParams = useMemo(() => ({
    location: location || undefined,
    lat: lat ? parseFloat(lat) : undefined,
    lng: lng ? parseFloat(lng) : undefined,
  }), [location, lat, lng]);
  
  // Use the search parameters in the hook
  const { data: apiSamples = [], isLoading: isApiLoading } = useSamples(samplesParams);
  
  // Use persistent pollution data as primary source, with map context as secondary
  const [samples, setSamples] = useState(mockLocations);
  const isLoading = isApiLoading || isPollutionLoading;
  
  // Helper functions for popup content
  const safeValue = (value: any) => {
    if (value === null || value === undefined || value === 'NaN' || (typeof value === 'number' && isNaN(value))) {
      return null;
    }
    return value;
  };

  const formatValue = (value: any, decimals = 1) => {
    const safe = safeValue(value);
    return safe !== null ? Number(safe).toFixed(decimals) : null;
  };

  const getRiskDisplay = (category: string) => {
    const normalizedCategory = category.toLowerCase();
    if (normalizedCategory.includes("safe") || normalizedCategory.includes("low")) {
      return "Low Risk";
    } else if (normalizedCategory.includes("moderate") || normalizedCategory.includes("medium")) {
      return "Medium Risk";
    } else if (normalizedCategory.includes("critical") || normalizedCategory.includes("high")) {
      return "High Risk";
    }
    return category;
  };

  const getWaterParametersJSX = (sample: any) => {
    const pH = sample.water_params?.pH || sample.pH || sample.DO_mg_per_L || (6.5 + Math.random() * 2);
    const DO = sample.water_params?.DO || sample.DO_mg_per_L || (3 + Math.random() * 5);
    const TDS = sample.water_params?.TDS || sample.TDS_mg_per_L || (200 + Math.random() * 400);

    const pHVal = formatValue(pH, 1);
    const DOVal = formatValue(DO, 1);
    const TDSVal = formatValue(TDS, 0);

    const params = [];
    if (pHVal) params.push(`pH: ${pHVal}`);
    if (DOVal) params.push(`DO: ${DOVal} mg/L`);
    if (TDSVal) params.push(`TDS: ${TDSVal} mg/L`);

    return params.length > 0 ? params.join(' | ') : null;
  };

  const getRiskIndicesJSX = (sample: any) => {
    const heiVal = formatValue(sample.indices?.hei, 0);
    const miVal = formatValue(sample.indices?.mi, 1);

    const indices = [];
    if (heiVal) indices.push(`HEI: ${heiVal} µg/L`);
    if (miVal) indices.push(`MI: ${miVal}`);

    return indices.length > 0 ? indices.join(' | ') : null;
  };
  
  // Helper function to convert risk level to map category
  const riskLevelToCategory = (riskLevel: string): 'Safe' | 'Moderate' | 'Critical' => {
    switch (riskLevel) {
      case 'Low Risk':
      case 'Safe':
        return 'Safe';
      case 'Medium Risk':
      case 'Moderate':
        return 'Moderate';
      case 'High Risk':
      case 'Critical':
        return 'Critical';
      default:
        console.warn(`Unknown risk level: ${riskLevel}, defaulting to Safe`);
        return 'Safe';
    }
  };

  // Update samples when pollutionData or mapData changes
  useEffect(() => {
    // Priority 1: Use pollution data from persistent database
    if (pollutionData && pollutionData.length > 0) {
      // Convert PollutionData format to the format expected by the map
      const convertedSamples = pollutionData.map((data, index) => {
        const riskLevel = data.riskLevel || 'Low Risk';
        const category = riskLevelToCategory(riskLevel);
        
        return {
          id: data._id,
          location: data.location || `Sample ${index + 1}`,
          latitude: data.latitude,
          longitude: data.longitude,
          state: "Persistent Data",
          district: "Database",
          category,
          indices: {
            hpi: data.hpi || 0,
            hei: data.hei || 0,
            mi: data.mi || 0
          },
          metals: {
            pb: 0, cd: 0, as: 0, hg: 0, cr: 0, ni: 0, zn: 0, cu: 0
          },
          value: data.value // Add value for marker popup
        };
      });
      
      console.log("MapView: Using persistent pollution data from database:", convertedSamples.length, "entries");
      setSamples(convertedSamples);
    }
    // Priority 2: Use uploaded data from context (temporary)
    else if (mapData && mapData.length > 0) {
      // Convert RiskResult format to the format expected by the map
       const convertedSamples = mapData.map((result, index) => ({
         id: result.id,
         location: result.location,
         latitude: result.coordinates[0],
         longitude: result.coordinates[1],
         state: "Uploaded Data",
         district: "CSV Import",
         category: riskLevelToCategory(result.riskLevel),
         indices: {
           hpi: result.hpi,
           hei: result.hei,
           mi: result.mi
         },
         metals: {
           pb: 0, cd: 0, as: 0, hg: 0, cr: 0, ni: 0, zn: 0, cu: 0
         },
         value: result.hpi // Add value for marker popup
       }));
      
      console.log("MapView: Using context data as fallback:", convertedSamples.length, "entries");
      setSamples(convertedSamples);
    }
    // Priority 3: Use mock data if nothing else available
    else {
      console.log("MapView: Using mock data as fallback");
      setSamples(mockLocations);
    }
  }, [pollutionData, mapData]);

  // Process heat map data from samples
  const heatmapData = useMemo(() => {
    if (!samples.length) return [];
    
    // Find min and max HPI values for better normalization
    const hpiValues = samples.map(s => s.indices.hpi);
    const minHPI = Math.min(...hpiValues);
    const maxHPI = Math.max(...hpiValues);
    
    return samples.map(sample => {
      // Improved normalization using actual data range
      let intensity: number;
      
      if (maxHPI === minHPI) {
        // If all values are the same, use moderate intensity
        intensity = 0.5;
      } else {
        // Normalize to 0-1 range based on actual data
        intensity = (sample.indices.hpi - minHPI) / (maxHPI - minHPI);
        
        // Apply logarithmic scaling for better visual distribution
        intensity = Math.pow(intensity, 0.7);
        
        // Ensure minimum visibility for all points
        intensity = Math.max(intensity, 0.1);
      }
      
      return [sample.latitude, sample.longitude, intensity] as [number, number, number];
    });
  }, [samples]);

  useEffect(() => {
    if (!samples.length) return;

    if (location && samples.length > 0) {
      const filteredSample = samples.find(s => 
        s.location.toLowerCase().includes(location.toLowerCase()) ||
        s.state.toLowerCase().includes(location.toLowerCase()) ||
        s.district.toLowerCase().includes(location.toLowerCase())
      );
      
      if (filteredSample) {
        const nextCenter: [number, number] = [filteredSample.latitude, filteredSample.longitude];
        const hasCenterChanged =
          !mapCenter || mapCenter[0] !== nextCenter[0] || mapCenter[1] !== nextCenter[1];
        if (hasCenterChanged) setMapCenter(nextCenter);
        if (mapZoom !== 12) setMapZoom(12);
      }
    } else if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const nextCenter: [number, number] = [userLat, userLng];
      const hasCenterChanged =
        !mapCenter || mapCenter[0] !== nextCenter[0] || mapCenter[1] !== nextCenter[1];
      if (hasCenterChanged) setMapCenter(nextCenter);
      if (mapZoom !== 10) setMapZoom(10);
    } else {
      if (mapCenter !== undefined) setMapCenter(undefined);
      if (mapZoom !== undefined) setMapZoom(undefined);
    }
  }, [samples, location, lat, lng, mapCenter, mapZoom]);

  // Calculate distance between two points in km using Haversine formula
  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  const handleSearch = (params: any) => {
    // Search is handled by the useEffect that watches searchParams
    console.log("Search params:", params);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="h-6 bg-muted rounded w-48 animate-pulse"></div>
          <div className="h-6 bg-muted rounded w-32 animate-pulse"></div>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="h-96 bg-muted animate-pulse"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Function to get marker styling based on category
  const getMarkerStyle = (category: string) => {
    const normalizedCategory = category.toLowerCase();
    
    if (normalizedCategory.includes("safe") || normalizedCategory.includes("low")) {
      return { color: '#22c55e', size: 14 }; // Green circle, normal size
    } else if (normalizedCategory.includes("moderate") || normalizedCategory.includes("medium")) {
      return { color: '#f59e0b', size: 16 }; // Orange/yellow circle, slightly larger
    } else if (normalizedCategory.includes("critical") || normalizedCategory.includes("high")) {
      return { color: '#ef4444', size: 18 }; // Red circle, larger for high risk
    }
    return { color: '#6b7280', size: 14 }; // Default gray
  };

  const getCategoryBadge = (category: string) => {
    let variant: "default" | "outline" | "secondary" | "destructive" = "outline";
    
    // Handle both category names and risk levels
    const normalizedCategory = category.toLowerCase();
    
    if (normalizedCategory.includes("safe") || normalizedCategory.includes("low")) {
      variant = "secondary";
    } else if (normalizedCategory.includes("moderate") || normalizedCategory.includes("medium")) {
      variant = "outline";
    } else if (normalizedCategory.includes("critical") || normalizedCategory.includes("high")) {
      variant = "destructive";
    }
    
    // Display consistent category names
    let displayText = category;
    if (normalizedCategory.includes("low")) displayText = "Safe";
    if (normalizedCategory.includes("medium")) displayText = "Moderate";
    if (normalizedCategory.includes("high")) displayText = "Critical";
    
    return (
      <Badge variant={variant}>
        {displayText}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">Map View</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="heatmap"
              checked={showHeatmap}
              onCheckedChange={(checked) => setShowHeatmap(!!checked)}
            />
            <label
              htmlFor="heatmap"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Show Heatmap
            </label>
          </div>
          
          {/* Manual refresh button for pollution data */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchPollutionData()}
            className="flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Data
          </Button>
          
          {/* Heat map configuration controls */}
          {showHeatmap && (
            <div className="flex flex-col sm:flex-row gap-4 p-3 bg-muted/50 rounded-lg">
              <div className="flex flex-col space-y-2 min-w-[120px]">
                <Label htmlFor="intensity-slider" className="text-xs font-medium">
                  Intensity: {heatmapIntensity.toFixed(1)}
                </Label>
                <Slider
                  id="intensity-slider"
                  min={0.1}
                  max={2.0}
                  step={0.1}
                  value={[heatmapIntensity]}
                  onValueChange={(value) => setHeatmapIntensity(value[0])}
                  className="w-20"
                />
              </div>
              <div className="flex flex-col space-y-2 min-w-[120px]">
                <Label htmlFor="radius-slider" className="text-xs font-medium">
                  Radius: {heatmapRadius}px
                </Label>
                <Slider
                  id="radius-slider"
                  min={15}
                  max={60}
                  step={5}
                  value={[heatmapRadius]}
                  onValueChange={(value) => setHeatmapRadius(value[0])}
                  className="w-20"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:gap-6">
        <LocationSearch onSearch={handleSearch} />
        
        {/* Results section - now on top */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="outline" className="text-xs md:text-sm">
                {samples.length} results found
              </Badge>
              {searchParams.get('location') && (
                <Badge variant="secondary" className="text-xs md:text-sm">
                  Location: {searchParams.get('location')}
                </Badge>
              )}
              {searchParams.get('lat') && searchParams.get('lng') && (
                <Badge variant="secondary" className="text-xs md:text-sm">
                  Near: {parseFloat(searchParams.get('lat')!).toFixed(4)}, {parseFloat(searchParams.get('lng')!).toFixed(4)}
                </Badge>
              )}
            </div>
            
            <div className="max-h-60 overflow-y-auto overflow-x-auto border rounded-md">
              <table className="w-full text-sm min-w-[400px]">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="p-2 text-left">Location</th>
                    <th className="p-2 text-left">Risk Level</th>
                    <th className="p-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {samples.map((sample) => (
                    <tr key={sample.id} className="border-t hover:bg-muted/30">
                      <td className="p-2">{sample.location}</td>
                      <td className="p-2">{getCategoryBadge(sample.category)}</td>
                      <td className="p-2 text-xs">{getRecommendation(sample.category)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
       
      {/* Map section - now on bottom with reduced height */}
      <Card>
        <CardContent className="p-0">
          <div className="map-container h-[300px] md:h-[400px]" data-testid="map-container">
            <MapContainer
              center={INDIA_BOUNDS.center}
              zoom={INDIA_BOUNDS.zoom}
              style={{ height: "100%", width: "100%" }}
              className="rounded-t-lg"
              scrollWheelZoom={true}
              zoomControl={true}
              touchZoom={true}
              doubleClickZoom={true}
              keyboard={true}
              boxZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* Map controller to update view based on search */}
              <MapController center={mapCenter} zoom={mapZoom} />
              
              {/* Conditional heat map layer */}
              {showHeatmap && (
                <HeatmapLayer 
                  data={heatmapData} 
                  intensity={heatmapIntensity}
                  radius={heatmapRadius}
                />
              )}
              
              {/* Show markers only when heat map is disabled */}
              {!showHeatmap && samples.map((sample) => {
                const markerStyle = getMarkerStyle(sample.category);
                const markerIcon = new L.DivIcon({
                  className: 'custom-div-icon',
                  html: `<div style="background-color: ${markerStyle.color}; width: ${markerStyle.size}px; height: ${markerStyle.size}px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
                  iconSize: [markerStyle.size, markerStyle.size],
                  iconAnchor: [markerStyle.size/2, markerStyle.size/2]
                });
                
                return (
                  <Marker
                    key={sample.id}
                    position={[sample.latitude, sample.longitude]}
                    icon={markerIcon}
                  >
                    <Popup maxWidth={350} minWidth={300}>
                      <div className="space-y-3 p-1">
                        {/* Header with Sample ID and Risk Level */}
                        <div className="font-bold text-base text-gray-800 border-b border-gray-200 pb-2">
                          {sample.location} — {getRiskDisplay(sample.category)}
                          {formatValue(sample.indices?.hpi, 1) && (
                            <span className="text-sm font-medium text-blue-600">
                              {` (HPI ${formatValue(sample.indices.hpi, 1)}%)`}
                            </span>
                          )}
                        </div>
                        
                        {/* Date and Coordinates */}
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center gap-1">
                            <span>📅</span>
                            <span>{sample.date || new Date().toISOString().split('T')[0]}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>📍</span>
                            <span className="font-mono text-xs">
                              {sample.latitude.toFixed(6)}, {sample.longitude.toFixed(6)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Water Parameters */}
                        {getWaterParametersJSX(sample) && (
                          <div className="text-sm">
                            <div className="font-medium text-gray-700 mb-1">Water Parameters:</div>
                            <div className="text-gray-600">{getWaterParametersJSX(sample)}</div>
                          </div>
                        )}
                        
                        {/* Risk Indices */}
                        {getRiskIndicesJSX(sample) && (
                          <div className="text-sm">
                            <div className="font-medium text-gray-700 mb-1">Risk Indices:</div>
                            <div className="text-gray-600">{getRiskIndicesJSX(sample)}</div>
                          </div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
          
          {/* Map Legend */}
          <div className="p-4 border-t border-border bg-muted/50">
            <h4 className="font-medium mb-3">Legend</h4>
            {showHeatmap ? (
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4" style={{ background: 'linear-gradient(to right, #00ff00, #ffff00, #ff8000, #ff0000)' }}></div>
                  <span className="text-sm">Heat Map: Low to High HPI Values</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Green (Low) → Yellow (Medium) → Orange (High) → Red (Critical)
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: getMarkerColor("Safe") }}
                  ></div>
                  <span className="text-sm">Safe (HPI &lt; 100)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: getMarkerColor("Moderate") }}
                  ></div>
                  <span className="text-sm">Moderate (100-180)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: getMarkerColor("Critical") }}
                  ></div>
                  <span className="text-sm">Critical (HPI ≥ 180)</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
