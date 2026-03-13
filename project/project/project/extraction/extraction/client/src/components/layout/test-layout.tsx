import { useState } from "react";
import { DashboardLayout } from "./dashboard-layout";

export function TestLayout() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <DashboardLayout 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      userRole="admin"
    >
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Test Layout</h1>
        <p>This is a test page to verify the new water metal pollution theme and top-down layout.</p>
      </div>
    </DashboardLayout>
  );
}