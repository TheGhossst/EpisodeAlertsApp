import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ArrowLeft, BellIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export const Header: React.FC = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';
  const isDetailPage = location.pathname.includes('/show/');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300 py-3 px-4",
        scrolled 
          ? "bg-background/90 backdrop-blur-lg shadow-sm border-b border-border/30" 
          : "bg-transparent",
        isHomePage && !scrolled ? "text-white" : "text-foreground"
      )}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {!isHomePage ? (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-10 w-10 mr-2 hover:bg-background/20"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        ) : (
          <div className="w-10"></div>
        )}

        <motion.div 
          className={cn(
            "text-lg font-bold transition-all flex-1 text-center",
            isHomePage && !scrolled ? "text-white" : "text-foreground"
          )}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {isHomePage ? (
            <span className="flex items-center justify-center gap-1.5">
              <span className="text-gradient">Episode</span>
              <span className="text-primary font-extrabold">Alerts</span>
            </span>
          ) : isDetailPage ? (
            <span className="truncate">Show Details</span>
          ) : location.pathname === '/search' ? (
            <span>Search</span>
          ) : location.pathname === '/watchlist' ? (
            <span>My Watchlist</span>
          ) : (
            <span className="flex items-center justify-center gap-1.5">
              <span className="text-gradient">Episode</span>
              <span className="text-primary font-extrabold">Alerts</span>
            </span>
          )}
        </motion.div>

        {isHomePage ? (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-10 w-10 hover:bg-background/20"
          >
            <BellIcon className="h-5 w-5" />
          </Button>
        ) : (
          <div className="w-10"></div>
        )}
      </div>
    </header>
  );
};
