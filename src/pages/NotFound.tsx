
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";

export default function NotFound() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col pb-20">
      <Header />

      <div className="flex-1 flex items-center justify-center px-4 pt-16">
        <div className="text-center">
          <div className="text-9xl font-bold text-muted-foreground/20 mb-4">404</div>
          <h1 className="text-xl font-bold mb-2">Page not found</h1>
          <p className="text-muted-foreground mb-6 text-sm">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Button
            onClick={() => navigate('/')}
            className="rounded-full"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};
