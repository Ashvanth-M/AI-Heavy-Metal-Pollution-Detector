import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DataTable } from "@/components/upload/data-table";
import { MapView } from "@/components/map/map-view";
import { ReportsDashboard } from "@/components/reports/reports-dashboard";
import { AboutPage } from "@/components/about/about-page";
import { PollutionCharts } from "@/components/visualization/pollution-charts";
import { ProjectOverview } from "@/components/overview/project-overview";
import { UserDashboard } from "@/components/user/user-dashboard";
import { DataVisualization } from "@/components/user/data-visualization";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";

// Researcher-specific components
function SampleManagement() {
  return (
    <div className="space-y-6 animate-dashboard-component">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Sample Management</h2>
          <p className="text-muted-foreground">Manage and analyze water samples with different risk levels.</p>
        </div>
      </div>
      <DataTable />
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4 text-foreground">Data Visualization</h3>
        <PollutionCharts />
      </div>
    </div>
  );
}

export default function ResearcherDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [, setLocation] = useLocation();
  
  // Redirect if not researcher or not authenticated
  useEffect(() => {
    const currentPath = window.location.pathname;
    
    if (!isAuthenticated) {
      if (currentPath !== "/auth") {
        setLocation("/auth");
      }
      return;
    }
    
    const userRole = user?.role as 'admin' | 'user' | 'researcher' | undefined;
    if (userRole && userRole !== "researcher") {
      const targetPath = userRole === "admin" ? "/admin-dashboard" : "/user-dashboard";
      if (currentPath !== targetPath) {
        setLocation(targetPath);
      }
    }
    // Remove setLocation from dependencies to prevent infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role, isAuthenticated]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
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
      case "samples":
        return <SampleManagement />;
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
              
              {/* Sample Management Visualization */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground">Sample Data Visualization</h3>
                <PollutionCharts />
              </div>
              
              {/* Advanced Visualization Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground">Advanced Charts & Graphs</h3>
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
      case "reports":
        return (
          <div className="space-y-6 animate-dashboard-component">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Reports Dashboard</h2>
                <p className="text-muted-foreground">Generate and view detailed water quality reports.</p>
              </div>
            </div>
            <ReportsDashboard />
          </div>
        );
      case "about":
        return (
          <div className="space-y-6 animate-dashboard-component">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">About</h2>
                <p className="text-muted-foreground">Learn more about the AquaMetriX water quality monitoring system.</p>
              </div>
            </div>
            <AboutPage />
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
      userRole="researcher"
    >
      {renderTabContent()}
    </DashboardLayout>
  );
}