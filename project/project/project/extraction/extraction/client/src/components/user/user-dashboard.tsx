import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockLocations } from '@/data/mock-locations';
import { mockSampleSDGAssignments, mockSdgBadges } from '@/data/sdg-badges';
import { SDGBadge } from '@/components/ui/sdg-badge';
import { 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  TrendingUp,
  Users,
  Shield,
  Activity,
  BarChart3,
  Clock,
  MapPin,
  Award
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalSamples: number;
  criticalSamples: number;
  moderateSamples: number;
  safeSamples: number;
  systemHealth: 'good' | 'warning' | 'critical';
}

export function UserDashboard() {
  const samples = mockLocations;
  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalUsers: 0,
    totalSamples: 0,
    criticalSamples: 0,
    moderateSamples: 0,
    safeSamples: 0,
    systemHealth: 'good'
  });
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    // Calculate statistics from admin data
    const criticalCount = samples.filter(s => s.category === 'Critical').length;
    const moderateCount = samples.filter(s => s.category === 'Moderate').length;
    const safeCount = samples.filter(s => s.category === 'Safe').length;

    setAdminStats({
      totalUsers: 156, // Mock admin data
      totalSamples: samples.length,
      criticalSamples: criticalCount,
      moderateSamples: moderateCount,
      safeSamples: safeCount,
      systemHealth: criticalCount > 10 ? 'critical' : criticalCount > 5 ? 'warning' : 'good'
    });

    setLastUpdated(new Date().toLocaleString());
  }, [samples]);

  const refreshData = () => {
    setLastUpdated(new Date().toLocaleString());
  };

  const getHealthColor = (health: AdminStats['systemHealth']) => {
    switch (health) {
      case 'critical': return 'destructive';
      case 'warning': return 'default';
      case 'good': return 'secondary';
      default: return 'secondary';
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

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Dashboard</h1>
            <p className="text-gray-600">View updated data and analytics from admin</p>
          </div>
          <Button onClick={refreshData} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Admin Data Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column - System Status */}
        <div className="lg:col-span-4 space-y-6">
          {/* System Health Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {getHealthIcon(adminStats.systemHealth)}
                <span>System Health</span>
              </CardTitle>
              <CardDescription>
                Overall system status from admin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Overall Status</span>
                  <Badge variant={getHealthColor(adminStats.systemHealth)}>
                    {adminStats.systemHealth.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">
                  {adminStats.systemHealth === 'good' && 'All systems operating normally'}
                  {adminStats.systemHealth === 'warning' && 'Some issues detected, monitoring required'}
                  {adminStats.systemHealth === 'critical' && 'Critical issues require attention'}
                </div>
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-800">Last Updated: {lastUpdated}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Data Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Locations</span>
                  <span className="font-bold">{adminStats.totalSamples}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Critical Areas</span>
                  <span className="font-bold text-red-600">{adminStats.criticalSamples}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Moderate Risk</span>
                  <span className="font-bold text-yellow-600">{adminStats.moderateSamples}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Safe Areas</span>
                  <span className="font-bold text-green-600">{adminStats.safeSamples}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Column - User Data Visualization */}
        <div className="lg:col-span-5 space-y-6">
          {/* Water Quality Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Water Quality Overview</CardTitle>
              <CardDescription>Current status of monitored water sources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{adminStats.safeSamples}</p>
                  <p className="text-sm text-green-700">Safe Areas</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{adminStats.moderateSamples}</p>
                  <p className="text-sm text-yellow-700">Moderate Risk</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{adminStats.criticalSamples}</p>
                  <p className="text-sm text-red-700">Critical Areas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Critical Areas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Critical Areas Analysis</CardTitle>
              <CardDescription>Locations requiring immediate attention with SDG impact</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {samples.filter(s => s.category === 'Critical').slice(0, 4).map((sample) => {
                  const sampleAssignments = mockSampleSDGAssignments.filter(a => a.sampleId === sample.id);
                  return (
                    <div key={sample.id} className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <div>
                            <p className="text-sm font-medium">{sample.location}</p>
                            <p className="text-xs text-gray-600">{sample.state} • HPI: {sample.indices.hpi}</p>
                          </div>
                        </div>
                        <Badge variant="destructive" className="text-xs">
                          Critical
                        </Badge>
                      </div>
                      {sampleAssignments.length > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <Award className="h-3 w-3 text-blue-600" />
                          <span className="text-xs text-blue-600 mr-2">SDG Impact:</span>
                          <div className="flex gap-1">
                            {sampleAssignments.slice(0, 3).map((assignment) => {
                              const badge = mockSdgBadges.find(b => b.id === assignment.badgeId);
                              if (!badge) return null;
                              return (
                                <SDGBadge 
                                  key={assignment.id} 
                                  badge={badge} 
                                />
                              );
                            })}
                            {sampleAssignments.length > 3 && (
                              <span className="text-xs text-blue-600">+{sampleAssignments.length - 3}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Monitoring & Analytics */}
        <div className="lg:col-span-3 space-y-6">
          {/* Pollution Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Distribution</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Safe</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-green-500 rounded-full" 
                        style={{ width: `${(adminStats.safeSamples / adminStats.totalSamples) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-green-600">{adminStats.safeSamples}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Moderate</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-yellow-500 rounded-full" 
                        style={{ width: `${(adminStats.moderateSamples / adminStats.totalSamples) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-yellow-600">{adminStats.moderateSamples}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Critical</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-red-500 rounded-full" 
                        style={{ width: `${(adminStats.criticalSamples / adminStats.totalSamples) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-red-600">{adminStats.criticalSamples}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Data Coverage</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600">Complete</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">System Status</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Data Sync</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-xs text-blue-600">Active</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Full Width Data Analysis Section */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Admin Data Analysis</span>
            </CardTitle>
            <CardDescription>
              Comprehensive view of water quality monitoring data from admin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <h4 className="font-medium mb-2">Regional Distribution</h4>
                <div className="h-32 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{adminStats.totalSamples}</p>
                    <p className="text-sm text-gray-600">Total Locations</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <h4 className="font-medium mb-2">Risk Assessment</h4>
                <div className="h-32 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{((adminStats.criticalSamples / adminStats.totalSamples) * 100).toFixed(1)}%</p>
                    <p className="text-sm text-gray-600">Critical Areas</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <h4 className="font-medium mb-2">System Health</h4>
                <div className="h-32 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{adminStats.systemHealth === 'good' ? '100%' : adminStats.systemHealth === 'warning' ? '75%' : '50%'}</p>
                    <p className="text-sm text-gray-600">Operational</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      

      
      {/* Water Quality Metrics Chart */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Water Quality Metrics</span>
            </CardTitle>
            <CardDescription>
              Key parameters affecting water quality index
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>pH Level</span>
                    <span>7.8</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Dissolved Oxygen</span>
                    <span>6.2 mg/L</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '62%' }}></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Turbidity</span>
                    <span>12 NTU</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Dissolved Solids</span>
                    <span>320 mg/L</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>E. coli</span>
                    <span>126 CFU/100mL</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-red-500 h-2.5 rounded-full" style={{ width: '35%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}