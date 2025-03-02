import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { canInstallPWA, showInstallPrompt, initInstallPrompt } from '@/serviceWorkerRegistration';
import { motion, AnimatePresence } from 'framer-motion';
import { DownloadIcon, XIcon, InfoIcon, SmartphoneIcon } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export const InstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installError, setInstallError] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // Initialize the install prompt event listener
    initInstallPrompt();

    // Check if the app is already in standalone mode (installed)
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as Navigator & { standalone?: boolean }).standalone 
      || document.referrer.includes('android-app://');

    setIsStandalone(isInStandaloneMode);
    
    if (isInStandaloneMode) {
      console.log('App is already installed in standalone mode');
      return; // Don't show install prompt if already installed
    }

    // Check if the app can be installed
    const canInstall = canInstallPWA();
    console.log('Can install PWA:', canInstall);
    
    // Check if it's iOS
    const iOS = /(iPhone|iPod|iPad)/i.test(navigator.userAgent);
    setIsIOS(iOS);
    console.log('Is iOS device:', iOS);

    // Only show the prompt if the app can be installed and hasn't been dismissed before
    const hasPromptBeenDismissed = localStorage.getItem('pwaPromptDismissed');
    
    if ((canInstall || iOS) && !hasPromptBeenDismissed) {
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
      
      if (isIOS) {
        // For iOS, just show instructions
        setShowInstructions(true);
        return;
      }
      
      const installed = await showInstallPrompt();
      console.log('Install prompt result:', installed);
      
      if (installed) {
        setShowPrompt(false);
        toast({
          title: "Installation started",
          description: "The app is being installed on your device.",
        });
      } else {
        setInstallError('Your browser doesn\'t support automatic installation or the app is already installed. Try using the "Add to Home Screen" option in your browser menu.');
        
        // Clear the error after 7 seconds
        setTimeout(() => {
          setInstallError(null);
        }, 7000);
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
    setShowInstructions(false);
    // Remember that the user dismissed the prompt
    localStorage.setItem('pwaPromptDismissed', 'true');
  };

  // Reset the dismissed state (for testing)
  const resetDismissed = () => {
    localStorage.removeItem('pwaPromptDismissed');
    window.location.reload();
  };

  const handleShowInstructions = () => {
    setShowInstructions(true);
  };

  if (!showPrompt || isStandalone) return null;

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
          {!showInstructions ? (
            <div className="flex items-start">
              <div className="flex-1">
                <h3 className="text-base font-semibold mb-1">Install Episode Alert</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {isIOS 
                    ? 'Add this app to your home screen for a better experience and offline access.' 
                    : 'Install this app on your device for a better experience and offline access.'}
                </p>
                
                {isIOS ? (
                  <div className="flex flex-col gap-2">
                    <Button 
                      onClick={handleShowInstructions} 
                      className="w-full rounded-lg"
                      size="sm"
                    >
                      <SmartphoneIcon className="w-4 h-4 mr-2" />
                      Show Me How
                    </Button>
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
          ) : (
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold">How to Install</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={handleDismiss}
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>
              
              {isIOS ? (
                <div className="text-sm space-y-3">
                  <p>Follow these steps to install the app on your iOS device:</p>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Tap the <span className="font-semibold">Share</span> button in Safari's bottom menu
                      <div className="inline-block mx-1">
                        <svg className="w-4 h-4 inline" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M16 8L8 16M8 8L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </div>
                    </li>
                    <li>Scroll down and tap <span className="font-semibold">Add to Home Screen</span></li>
                    <li>Tap <span className="font-semibold">Add</span> in the top right corner</li>
                  </ol>
                  <p className="flex items-center text-xs text-muted-foreground mt-2">
                    <InfoIcon className="w-3 h-3 mr-1" />
                    The app will appear on your home screen like a regular app
                  </p>
                </div>
              ) : (
                <div className="text-sm space-y-3">
                  <p>Follow these steps to install the app:</p>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>In Chrome, tap the menu icon (three dots) in the upper right</li>
                    <li>Tap <span className="font-semibold">Install App</span> or <span className="font-semibold">Add to Home Screen</span></li>
                    <li>Follow the on-screen instructions to complete installation</li>
                  </ol>
                  <Button 
                    onClick={handleInstall} 
                    className="w-full rounded-lg mt-2"
                    size="sm"
                  >
                    <DownloadIcon className="w-4 h-4 mr-2" />
                    Try Automatic Install
                  </Button>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 