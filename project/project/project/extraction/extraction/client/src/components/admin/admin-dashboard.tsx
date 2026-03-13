import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { MiniMap } from '@/components/admin/mini-map';
import { SDGBadgeSelector } from '@/components/admin/sdg-badge-selector';
import { mockLocations } from '@/data/mock-locations';
import { mockSdgBadges, mockSampleSDGAssignments } from '@/data/sdg-badges';
import { 
  Users, 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Upload,
  Settings,
  BarChart3,
  Shield,
  Clock,
  Activity,
  FileText,
  MapPin,
  Bell,
  Award
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalSamples: number;
  criticalSamples: number;
  pendingApprovals: number;
  recentUploads: number;
  systemHealth: 'good' | 'warning' | 'critical';
}

export function AdminDashboard() {
  const { user } = useAuth();
  const samples = mockLocations; // Use mock data for now
  const [selectedSample, setSelectedSample] = useState<string | null>(null);
  const [selectedSDGBadges, setSelectedSDGBadges] = useState<string[]>([]);
  const [showSDGSelector, setShowSDGSelector] = useState(false);
  const [selectedFilterBadge, setSelectedFilterBadge] = useState<string | null>(null);
  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalUsers: 0,
    totalSamples: 0,
    criticalSamples: 0,
    pendingApprovals: 0,
    recentUploads: 0,
    systemHealth: 'good'
  });

  useEffect(() => {
    // Calculate admin statistics from mock data
    const criticalCount = samples.filter(s => s.indices.hpi > 180).length;
    const recentCount = samples.length; // All samples are considered recent for demo

    setAdminStats({
      totalUsers: 156, // Mock data
      totalSamples: samples.length,
      criticalSamples: criticalCount,
      pendingApprovals: 8, // Mock data
      recentUploads: recentCount,
      systemHealth: criticalCount > 10 ? 'critical' : criticalCount > 5 ? 'warning' : 'good'
    });
  }, [samples]);

  // Filter samples based on selected SDG badge
  const filteredSamples = selectedFilterBadge 
    ? samples.filter(sample => 
        mockSampleSDGAssignments.some(a => a.sampleId === sample.id && a.badgeId === selectedFilterBadge)
      )
    : samples;

  const getHealthColor = (health: AdminStats['systemHealth']) => {
    switch (health) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'good': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthIcon = (health: AdminStats['systemHealth']) => {
    switch (health) {
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'good': return <CheckCircle className="h-5 w-5 text-green-500" />;
      default: return <Shield className="h-5 w-5" />;
    }
  };

  const handleAssignSDGBadges = async () => {
    if (!selectedSample || selectedSDGBadges.length === 0) return;
    
    try {
      // For development mode, just add to mock data
      const newAssignments = selectedSDGBadges.map((badgeId, index) => ({
        id: `assignment-${Date.now()}-${index}`,
        sampleId: selectedSample,
        badgeId,
        assignedBy: user?.id || 'admin-mock-id',
        assignedAt: new Date(),
        notes: 'Assigned via admin dashboard',
      }));
      
      // Remove existing assignments for this sample
      const filteredAssignments = mockSampleSDGAssignments.filter(a => a.sampleId !== selectedSample);
      mockSampleSDGAssignments.length = 0;
      mockSampleSDGAssignments.push(...filteredAssignments, ...newAssignments);
      
      // Reset state
      setSelectedSample(null);
      setSelectedSDGBadges([]);
      setShowSDGSelector(false);
      
      alert(`Successfully assigned ${selectedSDGBadges.length} SDG badges!`);
    } catch (error) {
      console.error('Error assigning SDG badges:', error);
      alert('Failed to assign SDG badges');
    }
  };

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, Admin</h1>
            <p className="text-gray-600">Monitor and manage the water pollution monitoring system</p>
          </div>
        </div>
      </div>

      {/* SDG Badge Filter Section */}
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Filter by SDG Badges</span>
            </CardTitle>
            <CardDescription>
              Filter samples and results by assigned SDG badges
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              <Button 
                variant={selectedFilterBadge === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilterBadge(null)}
              >
                All Samples ({samples.length})
              </Button>
              {mockSdgBadges.filter(badge => badge.relevantToWaterPollution).map((badge) => {
                const sampleCount = mockSampleSDGAssignments.filter(a => a.badgeId === badge.id).length;
                return (
                  <Button 
                    key={badge.id}
                    variant={selectedFilterBadge === badge.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedFilterBadge(badge.id)}
                    className="flex items-center gap-2"
                  >
                    <div 
                      className="w-4 h-4 rounded text-white text-xs flex items-center justify-center font-bold"
                      style={{ backgroundColor: badge.color }}
                    >
                      {badge.badgeNumber}
                    </div>
                    SDG {badge.badgeNumber} ({sampleCount})
                  </Button>
                );
              })}
            </div>
            {selectedFilterBadge && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded text-white text-sm flex items-center justify-center font-bold"
                    style={{ backgroundColor: mockSdgBadges.find(b => b.id === selectedFilterBadge)?.color }}
                  >
                    {mockSdgBadges.find(b => b.id === selectedFilterBadge)?.badgeNumber}
                  </div>
                  <div>
                    <span className="font-semibold text-blue-800">
                      {mockSdgBadges.find(b => b.id === selectedFilterBadge)?.name}
                    </span>
                    <p className="text-sm text-blue-600">
                      {mockSdgBadges.find(b => b.id === selectedFilterBadge)?.description}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Grid - 3 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column - System Overview & Quick Actions */}
        <div className="lg:col-span-4 space-y-6">
          {/* System Health Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {getHealthIcon(adminStats.systemHealth)}
                <span>System Health</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Overall Status</span>
                  <Badge className={getHealthColor(adminStats.systemHealth)}>
                    {adminStats.systemHealth.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">
                  {adminStats.systemHealth === 'good' && 'All systems operating normally'}
                  {adminStats.systemHealth === 'warning' && 'Some issues detected, monitoring required'}
                  {adminStats.systemHealth === 'critical' && 'Critical issues require immediate attention'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Approvals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Pending Approvals</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">User Registrations</span>
                  <Badge variant="secondary">{adminStats.pendingApprovals}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Data Submissions</span>
                  <Badge variant="secondary">3</Badge>
                </div>
                <Button size="sm" className="w-full mt-3">
                  Review All
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Column - Statistics & Analytics */}
        <div className="lg:col-span-5 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Total Users</p>
                    <p className="text-xl font-bold">{adminStats.totalUsers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Database className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Total Samples</p>
                    <p className="text-xl font-bold">{adminStats.totalSamples}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Critical Samples</p>
                    <p className="text-xl font-bold">{adminStats.criticalSamples}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Upload className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Recent Uploads</p>
                    <p className="text-xl font-bold">{adminStats.recentUploads}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <CardDescription>Latest system activities and user actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <div>
                      <p className="text-sm font-medium">New user registered</p>
                      <p className="text-xs text-gray-600">john.doe@example.com</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">2 min ago</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <div>
                      <p className="text-sm font-medium">Data uploaded</p>
                      <p className="text-xs text-gray-600">15 new water samples</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">5 min ago</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div>
                      <p className="text-sm font-medium">Critical sample detected</p>
                      <p className="text-xs text-gray-600">HPI: 150 in Region A</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">10 min ago</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div>
                      <p className="text-sm font-medium">User approval pending</p>
                      <p className="text-xs text-gray-600">researcher@university.edu</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">15 min ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Monitoring & Alerts */}
        <div className="lg:col-span-3 space-y-6">
          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Server Load</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full">
                      <div className="w-1/3 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-xs text-green-600">32%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Database</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full">
                      <div className="w-1/2 h-2 bg-yellow-500 rounded-full"></div>
                    </div>
                    <span className="text-xs text-yellow-600">48%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">API Response</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full">
                      <div className="w-1/4 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-xs text-green-600">120ms</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Active Alerts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium text-red-800">Critical Pollution</span>
                  </div>
                  <p className="text-xs text-red-600 mt-1">3 samples exceed WHO limits</p>
                </div>
                
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium text-yellow-800">Pending Reviews</span>
                  </div>
                  <p className="text-xs text-yellow-600 mt-1">8 user approvals needed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Server</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600">Connected</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">File Storage</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600">Available</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Backup</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-xs text-blue-600">Scheduled</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>



      {/* SDG Badge Management Modal/Section */}
      {showSDGSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">SDG Badge Management</h2>
              <Button variant="outline" onClick={() => setShowSDGSelector(false)}>
                Close
              </Button>
            </div>
            
            {/* Sample Selection */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Select Sample to Assign SDG Badges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSamples.map((sample) => {
                    const currentAssignments = mockSampleSDGAssignments.filter(a => a.sampleId === sample.id);
                    return (
                      <Card 
                        key={sample.id}
                        className={`cursor-pointer transition-all ${
                          selectedSample === sample.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                        }`}
                        onClick={() => setSelectedSample(sample.id)}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="font-semibold">{sample.id}</div>
                            <div className="text-sm text-gray-600">{sample.location}</div>
                            <div className="flex items-center gap-2">
                              <Badge variant={sample.category === 'Critical' ? 'destructive' : 
                                           sample.category === 'Moderate' ? 'default' : 'secondary'}>
                                {sample.category}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                HPI: {sample.indices?.hpi?.toFixed(1) || 'N/A'}
                              </span>
                            </div>
                            {currentAssignments.length > 0 && (
                              <div className="text-xs text-blue-600">
                                {currentAssignments.length} SDG{currentAssignments.length !== 1 ? 's' : ''} assigned
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            
            {/* SDG Badge Selector */}
            {selectedSample && (
              <SDGBadgeSelector
                selectedBadges={selectedSDGBadges}
                onSelectionChange={setSelectedSDGBadges}
                onAssign={handleAssignSDGBadges}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}