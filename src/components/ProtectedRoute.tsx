import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  
  // Check for dev bypass in localStorage
  const devBypass = localStorage.getItem('dev_bypass') === 'true';
  
  // Auto-bypass auth on GitHub Pages (for demo purposes)
  const isGitHubPages = typeof window !== 'undefined' && window.location.hostname.includes('github.io');
  
  // If on GitHub Pages, auto-enable dev bypass for seamless demo experience
  React.useEffect(() => {
    if (isGitHubPages && !devBypass) {
      localStorage.setItem('dev_bypass', 'true');
    }
  }, [isGitHubPages, devBypass]);

  // Show loading spinner while checking auth (max 3 seconds then bypass)
  const [timedOut, setTimedOut] = React.useState(false);
  
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('Auth loading timed out, enabling bypass');
        setTimedOut(true);
      }
    }, 3000);
    return () => clearTimeout(timeout);
  }, [loading]);

  if (loading && !timedOut && !isGitHubPages) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Allow access if: authenticated OR dev bypass OR timed out OR GitHub Pages
  const hasAccess = user || devBypass || timedOut || isGitHubPages;

  if (!hasAccess) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
