import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { UploadForm } from "@/components/upload/upload-form";
import { DataTable } from "@/components/upload/data-table";
import { MapView } from "@/components/map/map-view";
import { ReportsDashboard } from "@/components/reports/reports-dashboard";
import { AboutPage } from "@/components/about/about-page";
import { UserDashboard } from "@/components/user/user-dashboard";
import { ProjectOverview } from "@/components/overview/project-overview";
import { PollutionCharts } from "@/components/visualization/pollution-charts";
import { useAuth } from "@/contexts/AuthContext";

// Placeholder components for new tabs
function SampleManagement() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Sample Management</h2>
      <DataTable />
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Data Visualization</h3>
        <PollutionCharts />
      </div>
    </div>
  );
}

function UserManagement() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">User Management</h2>
      <p className="text-gray-600">Manage user accounts and permissions.</p>
      {/* TODO: Implement user management component */}
    </div>
  );
}

function DataAnalysis() {
  return <UserDashboard />;
}

function DashboardOverview() {
  return <ProjectOverview />;
}

export default function Dashboard() {
  const { isAdmin, user } = useAuth();
  const [activeTab, setActiveTab] = useState("");
  
  // Set default tab based on user role
  useEffect(() => {
    if (isAdmin) {
      setActiveTab("upload");
    } else {
      setActiveTab("dashboard");
    }
  }, [isAdmin]);

  const renderTabContent = () => {
    switch (activeTab) {
      // Admin tabs
      case "upload":
        return (
          <div className="space-y-6">
            <UploadForm />
            <DataTable />
          </div>
        );
      case "samples":
        return <SampleManagement />;
      case "users":
        return <UserManagement />;
      
      // User tabs
      case "dashboard":
        return <DashboardOverview />;
      case "analysis":
        return <DataAnalysis />;
      
      // Shared tabs
      case "map":
        return <MapView />;
      case "reports":
        return <ReportsDashboard />;
      case "about":
        return <AboutPage />;
      default:
        return <div>Tab not found</div>;
    }
  };

  return (
    <DashboardLayout 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      userRole={user?.role as 'admin' | 'user' | 'researcher'}
    >
      {renderTabContent()}
    </DashboardLayout>
  );
}
