import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Upload, 
  Map, 
  BarChart3, 
  Info, 
  Users, 
  FileText, 
  MessageSquare, 
  TrendingUp,
  Database,
  LogOut,
  LayoutDashboard,
  Bot,
  MessagesSquare,
  PieChart
} from "lucide-react";
import { useLocation } from "wouter";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  userRole?: 'admin' | 'user' | 'researcher';
}

const adminTabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin"] },
  { id: "upload", label: "Upload Data", icon: Upload, roles: ["admin"] },
  { id: "samples", label: "Sample Management", icon: Database, roles: ["admin", "researcher"] },
  { id: "users", label: "User Management", icon: Users, roles: ["admin"] },
  { id: "map", label: "Map View", icon: Map, roles: ["admin", "researcher", "user"] },
  { id: "assistant", label: "AI Assistant", icon: Bot, roles: ["admin"] },
  { id: "chat", label: "Collaborative Chat", icon: MessagesSquare, roles: ["admin"] },
];

const userTabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["user", "researcher"] },
  { id: "analysis", label: "Data Analysis", icon: TrendingUp, roles: ["user", "researcher"] },
  { id: "visualization", label: "Data Visualization", icon: PieChart, roles: ["user", "researcher"] },
  { id: "map", label: "Map View", icon: Map, roles: ["user", "researcher"] },
  { id: "assistant", label: "AI Assistant", icon: Bot, roles: ["user", "researcher"] },
];

const researcherTabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["researcher"] },
  { id: "samples", label: "Sample Management", icon: Database, roles: ["researcher"] },
  { id: "analysis", label: "Data Analysis", icon: TrendingUp, roles: ["researcher"] },
  { id: "visualization", label: "Data Visualization", icon: PieChart, roles: ["researcher"] },
  { id: "map", label: "Map View", icon: Map, roles: ["researcher"] },
  { id: "assistant", label: "AI Assistant", icon: Bot, roles: ["researcher"] },
];

export function Sidebar({ activeTab, onTabChange, isOpen, onClose, userRole }: SidebarProps) {
  const { user, logout, isAdmin } = useAuth();
  const [, setLocation] = useLocation();
  
  // Use the passed userRole prop if available, otherwise fall back to checking isAdmin
  const role = userRole || (isAdmin ? 'admin' : 'user');
  
  // Select tabs based on user role
  let baseTabs;
  switch (role) {
    case 'admin':
      baseTabs = adminTabs;
      break;
    case 'researcher':
      baseTabs = researcherTabs;
      break;
    case 'user':
    default:
      baseTabs = userTabs;
      break;
  }
  
  // Filter tabs based on user role
  const tabs = baseTabs.filter(tab => tab.roles.includes(role));
  
  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };
  
  return (
    <div className="flex flex-col h-full bg-sidebar">
      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <Button
              key={tab.id}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start space-x-3 h-10 rounded-md transition-all duration-200",
                isActive 
                  ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 shadow-sm" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
              onClick={() => {
                onTabChange(tab.id);
                if (window.innerWidth < 1024) {
                  onClose();
                }
              }}
              data-testid={`button-tab-${tab.id}`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </Button>
          );
        })}
      </nav>
      
      {/* User Info and Logout Section */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="mb-3 p-3 rounded-md bg-sidebar-accent/50">
          <p className="text-xs text-sidebar-foreground/70 truncate">{user?.email}</p>
          <p className="text-xs font-medium text-sidebar-foreground">{user?.name}</p>
          <p className="text-xs text-sidebar-foreground/80 capitalize">{user?.role}</p>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start space-x-3 h-10 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );
}
