import React from 'react';
import { Button } from '@/components/ui/button';
import { DownloadIcon } from 'lucide-react';
import { showInstallPrompt } from '@/serviceWorkerRegistration';
import { toast } from '@/components/ui/use-toast';

export const ManualInstallButton: React.FC = () => {
  const handleInstall = async () => {
    console.log('Manual install button clicked');
    try {
      const installed = await showInstallPrompt();
      console.log('Manual install result:', installed);
      
      if (!installed) {
        toast({
          title: "Installation not available",
          description: "Your browser may not support PWA installation or the app is already installed.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error during manual installation:', error);
      toast({
        title: "Installation error",
        description: "An error occurred during installation. Please try again later.",
        variant: "destructive",
      });
    }
  };

  // Reset the dismissed state
  const resetDismissed = () => {
    localStorage.removeItem('pwaPromptDismissed');
    toast({
      title: "Install prompt reset",
      description: "The install prompt will appear again on the next page refresh.",
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <Button 
        onClick={handleInstall} 
        className="w-full rounded-lg"
        variant="outline"
      >
        <DownloadIcon className="w-4 h-4 mr-2" />
        Install App
      </Button>
      <Button
        onClick={resetDismissed}
        variant="ghost"
        size="sm"
        className="text-xs"
      >
        Reset Install Prompt
      </Button>
    </div>
  );
}; 