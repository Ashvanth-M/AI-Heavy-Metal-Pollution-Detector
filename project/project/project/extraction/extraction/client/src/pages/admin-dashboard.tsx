import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { UploadForm } from "@/components/upload/upload-form";
import { DataTable } from "@/components/upload/data-table";
import { MapView } from "@/components/map/map-view";
import { UserManagement } from "@/components/user/user-management";
import { AdminDashboard as AdminDashboardComponent } from "@/components/admin/admin-dashboard";
import { AIAssistant } from "@/components/ai/ai-assistant";
import { AdminChat } from "@/components/admin/admin-chat";
import { CollaborativeRooms } from "@/components/admin/collaborative-rooms";
import { HardwareSensorData } from "@/components/hardware/hardware-sensor-data";

import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";

// Import sample data for the sample management section
import { sampleManagementData } from "@/data/sample-management-data";

// Sample management component with sample data
function SampleManagement() {
  return (
    <div className="space-y-6 animate-dashboard-component">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Sample Management</h2>
          <p className="text-muted-foreground">Manage and analyze water samples with different risk levels.</p>
        </div>
      </div>
      <DataTable initialData={sampleManagementData} />
    </div>
  );
}

export default function AdminDashboard() {
  const { isAdmin, isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [, setLocation] = useLocation();
  
  // Redirect if not admin (guard against redirect loops)
  useEffect(() => {
    const currentPath = window.location.pathname;
    
    if (!isAuthenticated) {
      if (currentPath !== "/auth") {
        setLocation("/auth");
      }
      return;
    }
    
    // Use the user from auth context instead of localStorage
    const userRole = user?.role;
    if (userRole && userRole !== 'admin') {
      if (currentPath !== "/user-dashboard") {
        setLocation("/user-dashboard");
      }
    }
    // Remove setLocation from dependencies to prevent infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.role]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <AdminDashboardComponent />;
      case "upload":
        return (
          <div className="space-y-6 animate-dashboard-component">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Upload Data</h2>
                <p className="text-muted-foreground">Upload CSV files containing water quality data for analysis.</p>
              </div>
            </div>
            <UploadForm />
          </div>
        );
      case "samples":
        return <SampleManagement />;
      case "users":
        return (
          <div className="space-y-6 animate-dashboard-component">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">User Management</h2>
                <p className="text-muted-foreground">Manage user accounts and permissions.</p>
              </div>
            </div>
            <UserManagement />
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
      case "hardware":
        return (
          <div className="space-y-6 animate-dashboard-component">
            <HardwareSensorData />
          </div>
        );
      case "assistant":
        return (
          <div className="space-y-6 animate-dashboard-component">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">AI Assistant</h2>
                <p className="text-muted-foreground">Get insights and analysis on water quality data.</p>
              </div>
            </div>
            <AIAssistant title="Admin AI Assistant" description="Get insights and analysis on water quality data" />
          </div>
        );
      case "chat":
        return (
          <div className="space-y-6 animate-dashboard-component">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Collaborative Chat</h2>
                <p className="text-muted-foreground">Communicate with your team about water quality data.</p>
              </div>
            </div>
            <AdminChat />
          </div>
        );
      case "collaborative":
        return (
          <div className="space-y-6 animate-dashboard-component">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Collaborative Rooms</h2>
                <p className="text-muted-foreground">Create and manage collaborative workspaces.</p>
              </div>
            </div>
            <CollaborativeRooms />
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
      userRole="admin"
    >
      {renderTabContent()}
    </DashboardLayout>
  );
}