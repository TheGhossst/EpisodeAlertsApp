import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DownloadIcon, InfoIcon, RefreshCw, Chrome, BookOpen, Globe } from 'lucide-react';
import { showInstallPrompt } from '@/serviceWorkerRegistration';
import { toast } from '@/components/ui/use-toast';

interface InstallInstructionsProps {
  onClose?: () => void;
}

export const InstallInstructions: React.FC<InstallInstructionsProps> = ({ onClose }) => {
  const [selectedTab, setSelectedTab] = useState('chrome');
  
  const isChrome = /Chrome|Chromium|Edge/.test(navigator.userAgent);
  const isFirefox = /Firefox/.test(navigator.userAgent);
  const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
  const isIOS = /(iPhone|iPod|iPad)/i.test(navigator.userAgent);
  
  const handleTryAgain = async () => {
    try {
      const installed = await showInstallPrompt();
      if (installed) {
        toast({
          title: "Installation started",
          description: "The app is being installed on your device.",
        });
        if (onClose) onClose();
      } else {
        toast({
          title: "Installation not available",
          description: "Please try the manual installation steps.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error during installation:', error);
    }
  };
  
  const handleReloadPage = () => {
    window.location.reload();
  };
  
  const clearCache = () => {
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
        toast({
          title: "Cache cleared",
          description: "Application cache has been cleared. Please reload the page.",
        });
      });
    } else {
      toast({
        title: "Cannot clear cache",
        description: "Cache API not supported in your browser.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Install Episode Alert as an App</h2>
      
      <p className="text-sm text-muted-foreground">
        If you're experiencing issues with installation, try these steps:
      </p>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-start gap-2">
          <div className="mt-0.5 text-primary">1.</div>
          <div>Make sure you're using a supported browser: Chrome, Edge, Samsung Internet, or Safari on iOS.</div>
        </div>
        <div className="flex items-start gap-2">
          <div className="mt-0.5 text-primary">2.</div>
          <div>Ensure your browser is up to date.</div>
        </div>
        <div className="flex items-start gap-2">
          <div className="mt-0.5 text-primary">3.</div>
          <div>Try reloading the page or clearing the application cache.</div>
        </div>
        <div className="flex items-start gap-2">
          <div className="mt-0.5 text-primary">4.</div>
          <div>On some devices, you'll need to use the manual installation option from your browser menu.</div>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mt-4">
        <Button 
          onClick={handleTryAgain}
          size="sm"
          variant="default"
          className="flex-1"
        >
          <DownloadIcon className="w-4 h-4 mr-2" />
          Try Again
        </Button>
        
        <Button 
          onClick={handleReloadPage}
          size="sm"
          variant="outline"
          className="flex-1"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Reload Page
        </Button>
        
        <Button 
          onClick={clearCache}
          size="sm"
          variant="outline"
          className="flex-1"
        >
          Clear Cache
        </Button>
      </div>
      
      <div className="mt-6">
        <Tabs defaultValue={isChrome ? "chrome" : isFirefox ? "firefox" : isIOS ? "ios" : "other"}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="chrome">
              <Chrome className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Chrome</span>
            </TabsTrigger>
            <TabsTrigger value="firefox">
              <BookOpen className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Firefox</span>
            </TabsTrigger>
            <TabsTrigger value="ios">
              <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="5" y="2" width="14" height="20" rx="3" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="18" r="1" fill="currentColor" />
              </svg>
              <span className="hidden sm:inline">iOS</span>
            </TabsTrigger>
            <TabsTrigger value="other">
              <Globe className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Other</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="chrome" className="mt-4 space-y-4">
            <h3 className="text-base font-medium">Chrome / Edge Installation</h3>
            <ol className="list-decimal pl-5 space-y-2 text-sm">
              <li>Look for the install icon <span className="inline-flex items-center justify-center w-5 h-5 border rounded text-xs">+</span> in the address bar, or</li>
              <li>Click the menu button (three dots ⋮) in the upper right corner</li>
              <li>Select "Install Episode Alert" or "Install App"</li>
              <li>Follow the on-screen instructions to complete installation</li>
            </ol>
            
            <div className="text-sm rounded-md bg-muted p-3">
              <p className="flex items-center font-medium">
                <InfoIcon className="w-4 h-4 mr-2 text-blue-500" />
                Troubleshooting
              </p>
              <p className="mt-1">If you don't see the install option:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Make sure you're not in incognito mode</li>
                <li>Check if the app is already installed (look in your app drawer/desktop)</li>
                <li>Some corporate or managed devices may block PWA installation</li>
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="firefox" className="mt-4 space-y-4">
            <h3 className="text-base font-medium">Firefox Installation</h3>
            <p className="text-sm">Firefox has limited PWA support. Try these alternatives:</p>
            
            <ol className="list-decimal pl-5 space-y-2 text-sm">
              <li>Click the menu button (three lines ☰) in the upper right</li>
              <li>Select "Add to Home Screen" on mobile or "Add to Desktop" on desktop</li>
              <li>Confirm by clicking "Add"</li>
            </ol>
            
            <div className="text-sm rounded-md bg-muted p-3">
              <p className="flex items-center font-medium">
                <InfoIcon className="w-4 h-4 mr-2 text-blue-500" />
                Note
              </p>
              <p className="mt-1">Firefox doesn't support full PWA features. For the best experience, consider using Chrome, Edge, or Safari (iOS).</p>
            </div>
          </TabsContent>
          
          <TabsContent value="ios" className="mt-4 space-y-4">
            <h3 className="text-base font-medium">iOS Installation</h3>
            <ol className="list-decimal pl-5 space-y-2 text-sm">
              <li>Make sure you're using Safari (not Chrome or another browser on iOS)</li>
              <li>Tap the Share button <svg className="w-4 h-4 inline mx-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 8L8 16M8 8L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
              </svg> at the bottom of the screen</li>
              <li>Scroll down and tap "Add to Home Screen"</li>
              <li>Tap "Add" in the top right corner</li>
            </ol>
            
            <div className="text-sm rounded-md bg-muted p-3">
              <p className="flex items-center font-medium">
                <InfoIcon className="w-4 h-4 mr-2 text-blue-500" />
                Important
              </p>
              <p className="mt-1">On iOS, you must use Safari browser. Chrome, Firefox, or other browsers on iOS cannot install PWAs.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="other" className="mt-4 space-y-4">
            <h3 className="text-base font-medium">Other Browsers</h3>
            <p className="text-sm">Different browsers have different installation methods:</p>
            
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium">Samsung Internet:</p>
                <ul className="list-disc pl-5">
                  <li>Tap the menu button (three dots) and select "Add to home screen"</li>
                </ul>
              </div>
              
              <div>
                <p className="font-medium">Opera:</p>
                <ul className="list-disc pl-5">
                  <li>Tap the + icon in the address bar or go to menu → "Add to home screen"</li>
                </ul>
              </div>
              
              <div>
                <p className="font-medium">UC Browser:</p>
                <ul className="list-disc pl-5">
                  <li>Tap the menu button and select "Add to Home Screen"</li>
                </ul>
              </div>
            </div>
            
            <div className="text-sm rounded-md bg-muted p-3">
              <p className="flex items-center font-medium">
                <InfoIcon className="w-4 h-4 mr-2 text-yellow-500" />
                Compatibility Note
              </p>
              <p className="mt-1">Not all browsers support PWA installation. For the best experience, use Chrome, Edge, or Safari (iOS).</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}; 