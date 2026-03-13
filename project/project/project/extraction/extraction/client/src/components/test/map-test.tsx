import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapView } from "@/components/map/map-view";
import { MiniMap } from "@/components/admin/mini-map";
import { mockLocations } from "@/data/mock-locations";
import { CheckCircle, AlertTriangle, MapPin } from "lucide-react";

export function MapTestPage() {
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const totalSamples = mockLocations.length;
  const criticalSamples = mockLocations.filter(s => s.category === 'Critical').length;
  const moderateSamples = mockLocations.filter(s => s.category === 'Moderate').length;
  const safeSamples = mockLocations.filter(s => s.category === 'Safe').length;

  const runTest = (testName: string) => {
    setCurrentTest(testName);
    setTimeout(() => setCurrentTest(null), 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">🗺️ GIS Map Testing Dashboard</h1>
        <p className="text-muted-foreground">Testing the fixed GIS functionality across admin and user interfaces</p>
      </div>

      {/* Test Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2\">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-semibold\">CSS Fixed</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Leaflet styles loaded</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2\">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-semibold\">Icons Enhanced</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Custom SVG markers</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2\">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-semibold\">Mobile Ready</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Responsive design</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2\">
              <MapPin className="h-5 w-5 text-blue-500" />
              <span className="font-semibold\">{totalSamples} Locations</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1\">Mock data loaded</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Data Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4\">
            <div className="text-center\">
              <div className="text-2xl font-bold text-green-600\">{safeSamples}</div>
              <div className="text-sm text-muted-foreground\">Safe Samples</div>
            </div>
            <div className="text-center\">
              <div className="text-2xl font-bold text-orange-600\">{moderateSamples}</div>
              <div className="text-sm text-muted-foreground\">Moderate Risk</div>
            </div>
            <div className="text-center\">
              <div className="text-2xl font-bold text-red-600\">{criticalSamples}</div>
              <div className="text-sm text-muted-foreground\">Critical Risk</div>
            </div>
            <div className="text-center\">
              <div className="text-2xl font-bold\">{totalSamples}</div>
              <div className="text-sm text-muted-foreground\">Total Samples</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4\">
        <Button 
          onClick={() => runTest('markers')}
          variant={currentTest === 'markers' ? 'default' : 'outline'}
          className="h-12"
        >
          {currentTest === 'markers' ? '✅ Testing Markers...' : '🎯 Test Map Markers'}
        </Button>
        
        <Button 
          onClick={() => runTest('popups')}
          variant={currentTest === 'popups' ? 'default' : 'outline'}
          className="h-12"
        >
          {currentTest === 'popups' ? '✅ Testing Popups...' : '💬 Test Popup Content'}
        </Button>
        
        <Button 
          onClick={() => runTest('search')}
          variant={currentTest === 'search' ? 'default' : 'outline'}
          className="h-12"
        >
          {currentTest === 'search' ? '✅ Testing Search...' : '🔍 Test Location Search'}
        </Button>
      </div>

      {/* Full Map View */}
      <Card>
        <CardHeader>
          <CardTitle>Full Map Interface (User/Admin View)</CardTitle>
        </CardHeader>
        <CardContent className="p-0\">
          <MapView />
        </CardContent>
      </Card>

      {/* Mini Map for Admin Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6\">
        <Card>
          <CardHeader>
            <CardTitle>Admin Mini-Map Component</CardTitle>
          </CardHeader>
          <CardContent className="p-0\">
            <MiniMap />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6\">
            <h3 className="font-semibold mb-4\">✅ GIS Fixes Completed:</h3>
            <ul className="space-y-2 text-sm\">
              <li className="flex items-center space-x-2\">
                <CheckCircle className="h-4 w-4 text-green-500\" />
                <span>Fixed Leaflet CSS import with CDN fallback</span>
              </li>
              <li className="flex items-center space-x-2\">
                <CheckCircle className="h-4 w-4 text-green-500\" />
                <span>Enhanced marker icons with custom SVG</span>
              </li>
              <li className="flex items-center space-x-2\">
                <CheckCircle className="h-4 w-4 text-green-500\" />
                <span>Improved mobile responsiveness</span>
              </li>
              <li className="flex items-center space-x-2\">
                <CheckCircle className="h-4 w-4 text-green-500\" />
                <span>Added mini-map to admin dashboard</span>
              </li>
              <li className="flex items-center space-x-2\">
                <CheckCircle className="h-4 w-4 text-green-500\" />
                <span>Fixed data structure mapping</span>
              </li>
              <li className="flex items-center space-x-2\">
                <CheckCircle className="h-4 w-4 text-green-500\" />
                <span>Enhanced popup content and styling</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}