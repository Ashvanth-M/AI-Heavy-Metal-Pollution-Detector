import { useState, useEffect } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { AlertBanner } from "../ui/alert-banner";
import { useAnalytics } from "@/hooks/use-samples";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, X } from "lucide-react";
import { 
  LayoutDashboard, 
  Upload, 
  Database, 
  Users, 
  MessageSquare, 
  Map, 
  FileText, 
  BarChart, 
  Info, 
  LogOut,
  Bot,
  MessagesSquare,
  Cpu
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole: 'admin' | 'user' | 'researcher';
}

const tabTitles = {
  dashboard: "Dashboard",
  upload: "Upload Data",
  samples: "Sample Management",
  users: "User Management",
  map: "Map View", 
  reports: "Reports",
  analysis: "Data Analysis",
  visualization: "Data Visualization",
  about: "About",
  assistant: "AI Assistant",
  chat: "Collaborative Chat",
  hardware: "Hardware Sensor Data"
};

export function DashboardLayout({ children, activeTab, onTabChange, userRole }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isAdmin, isApproved, loading } = useAuth();
  const { data: analytics } = useAnalytics();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation("/auth");
    }
  }, [loading, isAuthenticated, setLocation]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Show pending approval screen for non-admin users
  if (!isApproved && !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <CardTitle>Account Pending Approval</CardTitle>
            <CardDescription>
              Your account is currently pending admin approval. You will receive access once an administrator reviews your request.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-sm text-gray-600">
              <p><strong>Account:</strong> {user?.email}</p>
              <p><strong>Role:</strong> {user?.role}</p>
              <p><strong>Status:</strong> Pending Approval</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setLocation("/")}
              className="w-full"
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Top Header */}
      <Header
        title={tabTitles[activeTab as keyof typeof tabTitles] || "Dashboard"}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      
      {/* Alert Banner */}
      <AlertBanner
        criticalCount={analytics?.categoryCounts?.Critical || 0}
        isVisible={analytics?.hasCriticalSamples || false}
      />
      
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile overlay backdrop - closes sidebar when tapping outside */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Collapsible Sidebar - Hidden by default on mobile, shown as overlay */}
        <motion.aside
          initial={false}
          animate={{ 
            width: sidebarOpen ? "256px" : "0px",
            opacity: sidebarOpen ? 1 : 0
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={`
            bg-sidebar border-r border-sidebar-border flex-shrink-0
            fixed lg:relative z-50 h-full top-0 left-0
            ${sidebarOpen ? 'block' : 'hidden lg:block'}
          `}
        >
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-sidebar-border">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-sidebar-foreground">AquaMetriX</h1>
                  <p className="text-sm text-sidebar-foreground/70">Water Quality</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="lg:hidden"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-3 text-xs text-sidebar-foreground/60">
                <p>{user?.name} ({user?.role})</p>
              </div>
            </div>
            
            {/* Navigation */}
            <Sidebar
              activeTab={activeTab}
              onTabChange={onTabChange}
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              userRole={userRole}
            />
          </div>
        </motion.aside>
        
        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Tab Navigation - Top Bar */}
          <div className="border-b border-border bg-background">
            <div className="flex overflow-x-auto py-3 px-4 hide-scrollbar">
              {getTabsForRole(userRole).map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <Button
                    key={tab.id}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={`
                      top-tab
                      ${isActive 
                        ? "top-tab-active" 
                        : "top-tab-inactive"
                      }
                    `}
                    onClick={() => onTabChange(tab.id)}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
          
          {/* Content Area with Enhanced Water Metal Pollution Theme */}
          <div className="flex-1 overflow-auto p-2 md:p-6 bg-gradient-to-br from-background to-muted/30 pb-20 md:pb-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full animate-dashboard-component"
              >
                {/* Water metal pollution themed container */}
                <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm p-3 md:p-6 min-h-full">
                  {children}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-border flex md:hidden">
        {getTabsForRole(userRole).slice(0, 5).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs transition-colors ${
                isActive
                  ? 'text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="truncate max-w-[56px] leading-tight">{tab.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

// Helper function to get tabs based on user role
function getTabsForRole(role: 'admin' | 'user' | 'researcher') {
  const adminTabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "upload", label: "Upload Data", icon: Upload },
    { id: "hardware", label: "Hardware Sensor Data", icon: Cpu },
    { id: "samples", label: "Sample Management", icon: Database },
    { id: "users", label: "User Management", icon: Users },
    { id: "map", label: "Map View", icon: Map },
    { id: "assistant", label: "AI Assistant", icon: Bot },
    { id: "chat", label: "Collaborative Chat", icon: MessagesSquare },
  ];

  const userTabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "visualization", label: "Data Visualization", icon: BarChart },
    { id: "map", label: "Map View", icon: Map },
    { id: "assistant", label: "AI Assistant", icon: Bot },
  ];

  const researcherTabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "samples", label: "Sample Management", icon: Database },
    { id: "visualization", label: "Data Visualization", icon: BarChart },
    { id: "map", label: "Map View", icon: Map },
    { id: "assistant", label: "AI Assistant", icon: Bot },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "about", label: "About", icon: Info },
  ];

  switch (role) {
    case 'admin':
      return adminTabs;
    case 'researcher':
      return researcherTabs;
    case 'user':
    default:
      return userTabs;
  }
}