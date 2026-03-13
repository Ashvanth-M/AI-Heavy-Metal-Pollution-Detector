import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme";
import { Menu, Sun, Moon, LogOut, Droplets } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { LanguageSelector } from "@/components/ui/language-selector";

interface HeaderProps {
  title: string;
  onToggleSidebar: () => void;
}

export function Header({ title, onToggleSidebar }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { logout, user } = useAuth();
  const [, setLocation] = useLocation();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = async () => {
    await logout();
    setLocation('/auth');
  };

  return (
    <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="rounded-md hover:bg-muted"
          data-testid="button-toggle-sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-md bg-primary/10">
            <Droplets className="h-5 w-5 text-primary" />
          </div>
          <motion.h2 
            key={title}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="text-lg font-bold text-foreground animate-dashboard-header"
          >
            {title}
          </motion.h2>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="hidden md:flex items-center space-x-2 mr-2 px-3 py-1.5 rounded-md bg-muted/50">
          <span className="text-xs font-medium text-muted-foreground">Welcome,</span>
          <span className="text-xs font-semibold text-foreground truncate max-w-[120px]">{user?.name}</span>
        </div>
        <LanguageSelector />
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-md hover:bg-muted transition-colors"
          data-testid="button-toggle-theme"
        >
          <Sun className="h-5 w-5 dark:hidden" />
          <Moon className="h-5 w-5 hidden dark:block" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="rounded-md hover:bg-muted transition-colors"
          data-testid="button-logout"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}