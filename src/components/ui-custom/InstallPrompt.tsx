import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { canInstallPWA, showInstallPrompt, initInstallPrompt } from '@/serviceWorkerRegistration';
import { motion, AnimatePresence } from 'framer-motion';
import { DownloadIcon, XIcon } from 'lucide-react';

export const InstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [installError, setInstallError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize the install prompt event listener
    initInstallPrompt();

    // Check if the app can be installed
    const canInstall = canInstallPWA();
    console.log('Can install PWA:', canInstall);
    
    // Check if it's iOS
    const iOS = /(iPhone|iPod|iPad)/i.test(navigator.userAgent);
    setIsIOS(iOS);
    console.log('Is iOS device:', iOS);

    // Only show the prompt if the app can be installed and hasn't been dismissed before
    const hasPromptBeenDismissed = localStorage.getItem('pwaPromptDismissed');
    
    if (canInstall && !hasPromptBeenDismissed) {
      // Wait a bit before showing the prompt to not interrupt the initial user experience
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleInstall = async () => {
    try {
      setInstallError(null);
      console.log('Install button clicked');
      const installed = await showInstallPrompt();
      console.log('Install prompt result:', installed);
      
      if (installed) {
        setShowPrompt(false);
      } else {
        // If installation failed but not on iOS, show an error
        if (!isIOS) {
          setInstallError('Installation failed. Your browser may not support PWA installation or the app is already installed.');
          
          // Clear the error after 5 seconds
          setTimeout(() => {
            setInstallError(null);
          }, 5000);
        }
      }
    } catch (error) {
      console.error('Error during installation:', error);
      setInstallError('An error occurred during installation. Please try again later.');
      
      // Clear the error after 5 seconds
      setTimeout(() => {
        setInstallError(null);
      }, 5000);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember that the user dismissed the prompt
    localStorage.setItem('pwaPromptDismissed', 'true');
  };

  // Reset the dismissed state (for testing)
  const resetDismissed = () => {
    localStorage.removeItem('pwaPromptDismissed');
    window.location.reload();
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-20 left-4 right-4 z-50 p-4 bg-card rounded-xl shadow-lg border border-border mx-auto max-w-md"
        >
          <div className="flex items-start">
            <div className="flex-1">
              <h3 className="text-base font-semibold mb-1">Install Episode Alert</h3>
              <p className="text-sm text-muted-foreground mb-3">
                {isIOS 
                  ? 'Add this app to your home screen for a better experience. Tap the share button and then "Add to Home Screen".' 
                  : 'Install this app on your device for a better experience and offline access.'}
              </p>
              
              {isIOS ? (
                <div className="flex items-center text-xs text-muted-foreground">
                  <span>1. Tap</span>
                  <svg className="w-5 h-5 mx-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z" fill="currentColor" />
                  </svg>
                  <span>then "Add to Home Screen"</span>
                </div>
              ) : (
                <>
                  <Button 
                    onClick={handleInstall} 
                    className="w-full rounded-lg"
                    size="sm"
                  >
                    <DownloadIcon className="w-4 h-4 mr-2" />
                    Install App
                  </Button>
                  
                  {installError && (
                    <p className="text-xs text-red-500 mt-2">{installError}</p>
                  )}
                </>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={handleDismiss}
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 