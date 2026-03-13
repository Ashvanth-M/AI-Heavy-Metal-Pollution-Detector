import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { MapProvider } from "@/contexts/MapContext";
import HomePage from "@/pages/home";
import AuthPage from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import UserDashboardPage from "@/pages/user-dashboard";
import ResearcherDashboard from "@/pages/researcher-dashboard";
import AdminLogin from "@/pages/admin-login";
import UserLogin from "@/pages/user-login";
import NotFound from "@/pages/not-found";

// Protected route component
function ProtectedRoute({ component: Component, adminOnly = false, userOnly = false, researcherOnly = false, ...rest }: any) {
  const { isAuthenticated, isAdmin, loading, user } = useAuth();
  const userRole = user?.role as 'admin' | 'user' | 'researcher' | undefined;
  
  if (loading) {
    return <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>;
  }
  
  if (!isAuthenticated) {
    return <Redirect to="/" />;
  }
  
  // Role-based access control
  if (adminOnly && userRole !== 'admin') {
    return <Redirect to="/" />;
  }
  
  if (userOnly && userRole !== 'user') {
    return <Redirect to="/" />;
  }
  
  if (researcherOnly && userRole !== 'researcher') {
    return <Redirect to="/" />;
  }
  
  return <Component {...rest} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/user-login" component={UserLogin} />
      <Route path="/dashboard">
        {() => {
          const { user } = useAuth();
          const userRole = user?.role;
          if (userRole === 'admin') {
            return <Redirect to="/admin-dashboard" />;
          } else if (userRole === 'user') {
            return <Redirect to="/user-dashboard" />;
          } else if (userRole === 'researcher') {
            return <Redirect to="/researcher-dashboard" />;
          }
          return <Redirect to="/" />;
        }}
      </Route>
      <Route path="/admin-dashboard">
        {(params) => <ProtectedRoute component={AdminDashboard} adminOnly={true} params={params} />}
      </Route>
      <Route path="/user-dashboard">
        {(params) => <ProtectedRoute component={UserDashboardPage} userOnly={true} params={params} />}
      </Route>
      <Route path="/researcher-dashboard">
        {(params) => <ProtectedRoute component={ResearcherDashboard} researcherOnly={true} params={params} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="groundwater-theme">
        <AuthProvider>
          <MapProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </MapProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
