import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Droplets, 
  MapPin, 
  BarChart3, 
  Shield, 
  Users, 
  Database,
  AlertTriangle,
  TrendingUp,
  FileText,
  MessageSquare,
  Globe,
  Zap
} from 'lucide-react';

export function ProjectOverview() {
  const features = [
    {
      icon: Droplets,
      title: "Water Quality Monitoring",
      description: "Real-time monitoring of heavy metal contamination in groundwater sources",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: MapPin,
      title: "Interactive Mapping",
      description: "Geospatial visualization of pollution data with location-based insights",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: BarChart3,
      title: "Data Analytics",
      description: "Comprehensive analysis tools for pollution trends and patterns",
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: AlertTriangle,
      title: "Alert System",
      description: "Automated notifications for critical pollution levels and health risks",
      color: "bg-red-100 text-red-600"
    },
    {
      icon: FileText,
      title: "Report Generation",
      description: "Detailed reports for regulatory compliance and research purposes",
      color: "bg-orange-100 text-orange-600"
    },
    {
      icon: MessageSquare,
      title: "Community Feedback",
      description: "Citizen reporting system for environmental concerns and observations",
      color: "bg-teal-100 text-teal-600"
    }
  ];

  const userRoles = [
    {
      icon: Shield,
      title: "Administrators",
      description: "Full system access, user management, and data upload capabilities",
      badge: "Admin"
    },
    {
      icon: Users,
      title: "Researchers",
      description: "Advanced analytics, sample management, and research tools",
      badge: "Researcher"
    },
    {
      icon: Globe,
      title: "Public Users",
      description: "Access to pollution data, maps, and community reporting features",
      badge: "User"
    }
  ];

  const systemStats = [
    { label: "Monitoring Locations", value: "150+", icon: MapPin },
    { label: "Data Points Collected", value: "50K+", icon: Database },
    { label: "Active Users", value: "500+", icon: Users },
    { label: "Reports Generated", value: "1.2K+", icon: FileText }
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full mb-4">
          <Droplets className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900">AquaMetriX</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          A comprehensive water quality research platform for monitoring heavy metal contamination 
          in groundwater sources, providing real-time data analysis and community-driven insights.
        </p>
      </div>

      {/* System Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-4">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Key Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-6 w-6" />
            <span>Key Features</span>
          </CardTitle>
          <CardDescription>
            Comprehensive tools for water quality monitoring and environmental research
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex items-start space-x-4 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${feature.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* User Roles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-6 w-6" />
            <span>User Access Levels</span>
          </CardTitle>
          <CardDescription>
            Different access levels tailored for various stakeholder needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {userRoles.map((role, index) => {
              const Icon = role.icon;
              return (
                <div key={index} className="text-center p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4">
                    <Icon className="w-8 h-8 text-gray-600" />
                  </div>
                  <div className="mb-2">
                    <Badge variant="outline">{role.badge}</Badge>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{role.title}</h3>
                  <p className="text-sm text-gray-600">{role.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Project Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-6 w-6" />
            <span>Project Objectives</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Environmental Impact</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Monitor heavy metal contamination in real-time</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Identify pollution sources and contamination patterns</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Support environmental protection initiatives</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Community Health</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Provide early warning systems for health risks</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Enable community participation in monitoring</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Support public health decision-making</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>


    </div>
  );
}