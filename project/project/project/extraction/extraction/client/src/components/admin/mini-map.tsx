import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockLocations } from "@/data/mock-locations";
import { getMarkerColor, createMarkerIcon, INDIA_BOUNDS } from "@/lib/map-utils";
import L from "leaflet";
import { MapPin } from "lucide-react";

// Mini map component for admin dashboard
export function MiniMap() {
  const [samples] = useState(mockLocations);
  const [hoveredSample, setHoveredSample] = useState<string | null>(null);

  // Get critical samples for quick overview
  const criticalSamples = samples.filter(s => s.category === 'Critical');
  const moderateSamples = samples.filter(s => s.category === 'Moderate');
  const safeSamples = samples.filter(s => s.category === 'Safe');

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <MapPin className="h-5 w-5" />
          <span>Pollution Hotspots</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Quick Stats */}
        <div className="px-4 pb-3">
          <div className="flex space-x-2 text-xs">
            <Badge variant="destructive" className="text-xs">
              {criticalSamples.length} Critical
            </Badge>
            <Badge variant="outline" className="text-xs">
              {moderateSamples.length} Moderate
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {safeSamples.length} Safe
            </Badge>
          </div>
        </div>

        {/* Mini Map */}
        <div className="h-48 relative">
          <MapContainer
            center={INDIA_BOUNDS.center}
            zoom={5}
            style={{ height: "100%", width: "100%" }}
            className="rounded-b-lg"
            zoomControl={false}
            attributionControl={false}
            scrollWheelZoom={false}
            doubleClickZoom={false}
            dragging={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {samples.map((sample) => {
              const iconData = createMarkerIcon(sample.category);
              const icon = new L.Icon(iconData);
              
              return (
                <Marker
                  key={sample.id}
                  position={[sample.latitude, sample.longitude]}
                  icon={icon}
                  eventHandlers={{
                    mouseover: () => setHoveredSample(sample.id),
                    mouseout: () => setHoveredSample(null)
                  }}
                >
                  <Popup>
                    <div className="text-sm">
                      <div className="font-medium">{sample.location}</div>
                      <div className="text-muted-foreground">{sample.state}</div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge 
                          variant={
                            sample.category === 'Critical' ? 'destructive' : 
                            sample.category === 'Moderate' ? 'outline' : 'secondary'
                          }
                          className="text-xs"
                        >
                          {sample.category}
                        </Badge>
                        <span className="text-xs">HPI: {sample.indices.hpi.toFixed(1)}</span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        {/* Quick Actions */}
        <div className="p-3 border-t border-border bg-muted/50">
          <div className="text-xs text-muted-foreground">
            {hoveredSample 
              ? `Viewing: ${samples.find(s => s.id === hoveredSample)?.location}`
              : "Hover over markers for details"
            }
          </div>
        </div>
      </CardContent>
    </Card>
  );
}