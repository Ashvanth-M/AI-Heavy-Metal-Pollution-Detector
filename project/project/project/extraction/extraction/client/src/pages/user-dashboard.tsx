import React, { useState, useEffect } from 'react';
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { MapView } from "@/components/map/map-view";
import { UserDashboard } from "@/components/user/user-dashboard";
import { ProjectOverview } from "@/components/overview/project-overview";
import { DataVisualization } from "@/components/user/data-visualization";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { AIAssistant } from "@/components/ai/ai-assistant";

// User-specific view of sample data (read-only) - REMOVED
// This section has been removed as per requirements

function DataAnalysis() {
  return (
    <div className="space-y-6 animate-dashboard-component">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Data Analysis</h2>
          <p className="text-muted-foreground">Analyze water quality data and HMPI results.</p>
        </div>
      </div>
      <UserDashboard />
    </div>
  );
}

function DashboardOverview() {
  return (
    <div className="space-y-6 animate-dashboard-component">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Project Overview</h2>
          <p className="text-muted-foreground">Get an overview of the water quality monitoring project.</p>
        </div>
      </div>
      <ProjectOverview />
    </div>
  );
}

export default function UserDashboardPage() {
  const { isAdmin, isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [, setLocation] = useLocation();
  
  // Redirect if admin or not authenticated (guard against redirect loops)
  useEffect(() => {
    const currentPath = window.location.pathname;
    const userRole = user?.role as 'admin' | 'user' | 'researcher' | undefined;
    
    if (!isAuthenticated) {
      if (currentPath !== "/auth") {
        setLocation("/auth");
      }
      return;
    }
    
    if (isAdmin || userRole === 'researcher') {
      const targetPath = userRole === 'researcher' ? "/researcher-dashboard" : "/admin-dashboard";
      if (currentPath !== targetPath) {
        setLocation(targetPath);
      }
    }
    // Remove setLocation from dependencies to prevent infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, isAuthenticated, user?.role]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview />;
      case "visualization":
        return (
          <div className="space-y-6 animate-dashboard-component">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Data Visualization</h2>
                <p className="text-muted-foreground">Analyze and visualize water quality data through charts and graphs.</p>
              </div>
            </div>
            {/* Combined Analysis and Visualization Content */}
            <div className="space-y-8">
              {/* Data Analysis Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground">Data Analysis</h3>
                <UserDashboard />
              </div>
              
              {/* Data Visualization Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground">Charts & Graphs</h3>
                <DataVisualization />
              </div>
            </div>
          </div>
        );
      case "map":
        return (
          <div className="space-y-6 animate-dashboard-component">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Map View</h2>
                <p className="text-muted-foreground">Visualize water quality data on an interactive map.</p>
              </div>
            </div>
            <MapView />
          </div>
        );
      case "assistant":
        return (
          <div className="space-y-6 animate-dashboard-component">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">AI Assistant</h2>
                <p className="text-muted-foreground">Get help with water quality data and HMPI analysis.</p>
              </div>
            </div>
            <AIAssistant title="User AI Assistant" description="Get help with water quality data and HMPI analysis" />
          </div>
        );
      default:
        return <div>Tab not found</div>;
    }
  };

  return (
    <DashboardLayout 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      userRole="user"
    >
      {renderTabContent()}
    </DashboardLayout>
  );
}