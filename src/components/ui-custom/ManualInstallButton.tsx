import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DownloadIcon, InfoIcon, SmartphoneIcon, HelpCircle } from 'lucide-react';
import { showInstallPrompt, canInstallPWA, initInstallPrompt } from '@/serviceWorkerRegistration';
import { toast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InstallInstructions } from './InstallInstructions';

export const ManualInstallButton: React.FC = () => {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  
  useEffect(() => {
    // Initialize the install prompt event listener
    initInstallPrompt();
    
    // Check if it's iOS
    const iOS = /(iPhone|iPod|iPad)/i.test(navigator.userAgent);
    setIsIOS(iOS);
    
    // Check if the app is already in standalone mode (installed)
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as Navigator & { standalone?: boolean }).standalone 
      || document.referrer.includes('android-app://');
    
    setIsStandalone(isInStandaloneMode);
  }, []);
  
  const handleInstall = async () => {
    console.log('Manual install button clicked');
    try {
      if (isIOS) {
        // For iOS, show installation instructions
        setShowInstructions(true);
        return;
      }
      
      const installed = await showInstallPrompt();
      console.log('Manual install result:', installed);
      
      if (installed) {
        toast({
          title: "Installation started",
          description: "The app is being installed on your device.",
        });
      } else {
        toast({
          title: "Installation not available",
          description: "Your browser may not support PWA installation. Check troubleshooting guides.",
          variant: "destructive",
        });
        // Show troubleshooting dialog
        setShowTroubleshooting(true);
      }
    } catch (error) {
      console.error('Error during manual installation:', error);
      toast({
        title: "Installation error",
        description: "An error occurred during installation. Please try again later.",
        variant: "destructive",
      });
      setShowTroubleshooting(true);
    }
  };

  // Reset the dismissed state
  const resetDismissed = () => {
    localStorage.removeItem('pwaPromptDismissed');
    toast({
      title: "Install prompt reset",
      description: "The install prompt will appear again on the next page refresh.",
    });
    window.location.reload();
  };

  if (isStandalone) {
    return (
      <div className="text-center text-sm text-muted-foreground py-2">
        <p className="flex items-center justify-center gap-1">
          <InfoIcon className="h-4 w-4" />
          App is already installed
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        {isIOS ? (
          <Button 
            onClick={() => setShowInstructions(true)} 
            className="flex-1 rounded-lg"
            variant="outline"
          >
            <SmartphoneIcon className="w-4 h-4 mr-2" />
            Show iOS Installation Steps
          </Button>
        ) : (
          <Button 
            onClick={handleInstall} 
            className="flex-1 rounded-lg"
            variant="outline"
          >
            <DownloadIcon className="w-4 h-4 mr-2" />
            Install App
          </Button>
        )}
        
        <Button
          onClick={() => setShowTroubleshooting(true)}
          size="icon" 
          variant="ghost"
          className="h-9 w-9 rounded-lg"
          title="Installation Help"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      </div>
      
      <Button
        onClick={resetDismissed}
        variant="ghost"
        size="sm"
        className="text-xs"
      >
        Reset Install Prompt
      </Button>
      
      {/* Basic Install Instructions Dialog */}
      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>How to Install</DialogTitle>
            <DialogDescription>
              Follow these steps to install the app on your device
            </DialogDescription>
          </DialogHeader>
          
          {isIOS ? (
            <div className="text-sm space-y-3">
              <ol className="list-decimal pl-5 space-y-2">
                <li>Make sure you're using <strong>Safari</strong> browser (not Chrome or Firefox on iOS)</li>
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
              
              <Button
                onClick={() => {
                  setShowInstructions(false);
                  setShowTroubleshooting(true);
                }}
                variant="ghost"
                size="sm"
                className="w-full mt-2"
              >
                Need more help? View troubleshooting guide
              </Button>
            </div>
          ) : (
            <div className="text-sm space-y-3">
              <ol className="list-decimal pl-5 space-y-2">
                <li>Look for the install icon <span className="inline-flex items-center justify-center w-5 h-5 border rounded text-xs">+</span> in the address bar, or</li>
                <li>Click the menu button (three dots ⋮) in the upper right corner</li>
                <li>Select "Install Episode Alert" or "Install App"</li>
                <li>Follow the on-screen instructions to complete installation</li>
              </ol>
              <Button 
                onClick={handleInstall} 
                className="w-full rounded-lg mt-4"
                size="sm"
              >
                <DownloadIcon className="w-4 h-4 mr-2" />
                Try Automatic Install
              </Button>
              
              <Button
                onClick={() => {
                  setShowInstructions(false);
                  setShowTroubleshooting(true);
                }}
                variant="ghost"
                size="sm"
                className="w-full mt-1"
              >
                Need more help? View troubleshooting guide
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Comprehensive Troubleshooting Dialog */}
      <Dialog open={showTroubleshooting} onOpenChange={setShowTroubleshooting}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Installation Help</DialogTitle>
            <DialogDescription>
              Comprehensive guide to install the app on different devices
            </DialogDescription>
          </DialogHeader>
          
          <InstallInstructions onClose={() => setShowTroubleshooting(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};