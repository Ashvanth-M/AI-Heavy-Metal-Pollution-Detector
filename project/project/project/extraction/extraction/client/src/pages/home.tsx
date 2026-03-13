import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Droplets, 
  Shield, 
  Users, 
  FileText, 
  MapPin, 
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  CheckCircle2,
  LogOut
} from 'lucide-react';

export default function HomePage() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      // Redirect based on user role
      if (user?.role === 'admin') {
        setLocation('/admin-dashboard');
      } else if (user?.role === 'user') {
        setLocation('/user-dashboard');
      } else if (user?.role === 'researcher') {
        setLocation('/researcher-dashboard');
      } else {
        setLocation('/dashboard');
      }
    } else {
      setLocation('/auth');
    }
  };

  const handleLogout = async () => {
    await logout();
    setLocation('/');
  };

  const features = [
    {
      icon: <Droplets className="h-8 w-8 text-blue-600" />,
      title: "Water Quality Monitoring",
      description: "Comprehensive analysis of heavy metal pollution in water samples with real-time data tracking."
    },
    {
      icon: <Shield className="h-8 w-8 text-green-600" />,
      title: "WHO Standards Compliance",
      description: "Automatic comparison with World Health Organization safety limits and threshold alerts."
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-purple-600" />,
      title: "Data Visualization",
      description: "Interactive charts and graphs showing pollution trends, patterns, and analysis over time."
    },
    {
      icon: <MapPin className="h-8 w-8 text-red-600" />,
      title: "Geographic Mapping",
      description: "Location-based pollution data visualization with interactive maps and spatial analysis."
    },
    {
      icon: <FileText className="h-8 w-8 text-orange-600" />,
      title: "Report Generation",
      description: "Comprehensive PDF reports with detailed analysis, charts, and recommendations."
    },
    {
      icon: <Users className="h-8 w-8 text-indigo-600" />,
      title: "Community Feedback",
      description: "Platform for community reporting of suspected pollution sources and collaborative monitoring."
    }
  ];

  const pollutants = [
    "Lead (Pb)",
    "Cadmium (Cd)",
    "Arsenic (As)",
    "Mercury (Hg)",
    "Chromium (Cr)",
    "Nickel (Ni)",
    "Zinc (Zn)",
    "Copper (Cu)"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Droplets className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AquaMetriX</h1>
                <p className="text-sm text-gray-600">Water Quality Research Project</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
                  <Button variant="outline" onClick={() => {
                    // Redirect based on user role
                    if (user?.role === 'admin') {
                      setLocation('/admin-dashboard');
                    } else if (user?.role === 'user') {
                      setLocation('/user-dashboard');
                    } else if (user?.role === 'researcher') {
                      setLocation('/researcher-dashboard');
                    } else {
                      setLocation('/dashboard');
                    }
                  }}>
                    Go to Dashboard
                  </Button>
                  <Button variant="outline" onClick={handleLogout} className="flex items-center space-x-2">
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="outline" onClick={() => setLocation('/user-login')}>
                    User Login
                  </Button>
                  <Button variant="outline" onClick={() => setLocation('/admin-login')}>
                    Admin Login
                  </Button>
                  <Button onClick={() => setLocation('/auth')}>
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Monitor Heavy Metal
              <span className="text-blue-600"> Pollution</span> in Water
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              A comprehensive research platform for analyzing heavy metal contamination in water sources,
              providing real-time monitoring, WHO compliance checking, and community engagement tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleGetStarted} className="text-lg px-8 py-3">
                {isAuthenticated ? 'View Dashboard' : 'Get Started'}
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Water Quality Analysis
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform provides end-to-end solutions for monitoring and analyzing heavy metal pollution
              in water sources with advanced tools and visualization capabilities.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Monitored Pollutants Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Monitored Heavy Metals
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We track the most critical heavy metal pollutants that pose significant health risks
              when present in drinking water above WHO safety limits.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {pollutants.map((pollutant, index) => (
              <div key={index} className="bg-white rounded-lg p-6 text-center shadow-sm border">
                <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900">{pollutant}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHO Standards Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                WHO Standards Compliance
              </h2>
              <p className="text-xl mb-8 text-blue-100">
                Our platform automatically compares all water sample data against World Health Organization
                safety standards, providing instant alerts when pollution levels exceed safe limits.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-6 w-6 text-yellow-300" />
                  <span>Real-time threshold monitoring</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="h-6 w-6 text-green-300" />
                  <span>Automated safety assessments</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FileText className="h-6 w-6 text-blue-300" />
                  <span>Compliance reporting</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6">Sample WHO Limits (mg/L)</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Lead (Pb)</span>
                  <span className="font-mono">0.01</span>
                </div>
                <div className="flex justify-between">
                  <span>Cadmium (Cd)</span>
                  <span className="font-mono">0.003</span>
                </div>
                <div className="flex justify-between">
                  <span>Arsenic (As)</span>
                  <span className="font-mono">0.01</span>
                </div>
                <div className="flex justify-between">
                  <span>Mercury (Hg)</span>
                  <span className="font-mono">0.006</span>
                </div>
                <div className="flex justify-between">
                  <span>Chromium (Cr)</span>
                  <span className="font-mono">0.05</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Monitoring?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join our research platform to access comprehensive water quality analysis tools,
            contribute to community monitoring efforts, and help protect public health.
          </p>
          <Button size="lg" onClick={handleGetStarted} className="text-lg px-8 py-3">
            {isAuthenticated ? 'Access Dashboard' : 'Create Account'}
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Droplets className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900">AquaMetriX</span>
            </div>
            <p className="text-gray-600 mb-4">
              A research project dedicated to monitoring heavy metal pollution in water sources
            </p>
            <p className="text-sm text-gray-500">
              © 2024 Heavy Metal Pollution Research Project. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}