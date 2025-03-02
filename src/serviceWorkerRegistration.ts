// This optional code is used to register a service worker.
// register() is not called by default.

// This lets the app load faster on subsequent visits in production, and gives
// it offline capabilities. However, it also means that developers (and users)
// will only see deployed updates on subsequent visits to a page, after all the
// existing tabs open on the page have been closed, since previously cached
// resources are updated in the background.

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]' ||
    // 127.0.0.0/8 are considered localhost for IPv4.
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

type Config = {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
};

export function register(config?: Config): void {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    // The URL constructor is available in all browsers that support SW.
    const publicUrl = new URL(process.env.PUBLIC_URL || '', window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      // Our service worker won't work if PUBLIC_URL is on a different origin
      // from what our page is served on. This might happen if a CDN is used to
      // serve assets; see https://github.com/facebook/create-react-app/issues/2374
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL || ''}/sw.js`;

      if (isLocalhost) {
        // This is running on localhost. Let's check if a service worker still exists or not.
        checkValidServiceWorker(swUrl, config);

        // Add some additional logging to localhost, pointing developers to the
        // service worker/PWA documentation.
        navigator.serviceWorker.ready.then(() => {
          console.log(
            'This web app is being served cache-first by a service ' +
              'worker. To learn more, visit https://cra.link/PWA'
          );
        });
      } else {
        // Is not localhost. Just register service worker
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl: string, config?: Config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // At this point, the updated precached content has been fetched,
              // but the previous service worker will still serve the older
              // content until all client tabs are closed.
              console.log(
                'New content is available and will be used when all ' +
                  'tabs for this page are closed. See https://cra.link/PWA.'
              );

              // Execute callback
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // At this point, everything has been precached.
              // It's the perfect time to display a
              // "Content is cached for offline use." message.
              console.log('Content is cached for offline use.');

              // Execute callback
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('Error during service worker registration:', error);
    });
}

function checkValidServiceWorker(swUrl: string, config?: Config) {
  // Check if the service worker can be found. If it can't reload the page.
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      // Ensure service worker exists, and that we really are getting a JS file.
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // No service worker found. Probably a different app. Reload the page.
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Service worker found. Proceed as normal.
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('No internet connection found. App is running in offline mode.');
    });
}

export function unregister(): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}

// Define a type for the BeforeInstallPromptEvent globally
declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
    appinstalled: Event;
  }
}

// Function to check if the app can be installed
export function canInstallPWA(): boolean {
  console.log('Checking if PWA can be installed');
  console.log('deferredPrompt is:', deferredPrompt ? 'available' : 'null');
  
  // The most reliable way to check is if we have the deferredPrompt
  if (deferredPrompt) {
    return true;
  }
  
  // Check if we're in a browser that supports service workers
  if (!('serviceWorker' in navigator)) {
    console.log('Service workers not supported');
    return false;
  }

  // Check if the app is in standalone mode (already installed)
  if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('App is already installed (standalone mode)');
    return false;
  }
  
  // Check for Chrome, Edge or other compatible browsers
  const isCompatibleBrowser = /Chrome|Edge|Opera|Samsung|Android/.test(navigator.userAgent) && 
    !/(iPad|iPhone|iPod)/.test(navigator.userAgent);
  
  if (!isCompatibleBrowser) {
    console.log('Browser may not support PWA installation');
  } else {
    console.log('Browser appears to support PWA installation');
  }
  
  return isCompatibleBrowser || Boolean(
    // The Safari check for iOS
    /(iPhone|iPod|iPad)/i.test(navigator.userAgent) && 
    /Safari/i.test(navigator.userAgent) &&
    !/(Chrome|CriOS|FxiOS)/i.test(navigator.userAgent)
  );
}

// Function to show custom install prompt
// Define a type for the BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

// Capture the deferred prompt as early as possible, even before DOM is fully loaded
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e as BeforeInstallPromptEvent;
  console.log('Captured beforeinstallprompt event early');
});

export function initInstallPrompt(): void {
  console.log('Initializing install prompt event listener');
  
  // Check if we already have a stored prompt
  if (deferredPrompt) {
    console.log('Already have a stored prompt');
  } else {
    console.log('No deferred prompt available yet');
    
    // Add event listener again just to be safe
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      deferredPrompt = e as BeforeInstallPromptEvent;
      console.log('Captured beforeinstallprompt event');
    });
  }
  
  // Listen for when the PWA is successfully installed
  window.addEventListener('appinstalled', () => {
    console.log('App was installed');
    deferredPrompt = null;
  });
  
  // Check if app is already in standalone mode
  if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('App is already in standalone mode (installed)');
  }
  
  // Check if install criteria are met
  console.log('Install criteria met:', Boolean(
    // Check service workers supported
    'serviceWorker' in navigator &&
    // Not already in standalone mode
    !window.matchMedia('(display-mode: standalone)').matches &&
    // Has a valid manifest
    !!document.querySelector('link[rel="manifest"]')
  ));
  
  // Force browser to check for install criteria by accessing the manifest
  const manifestLink = document.querySelector('link[rel="manifest"]');
  if (manifestLink) {
    const href = manifestLink.getAttribute('href');
    if (href) {
      console.log('Manifest found at:', href);
      fetch(href).then(() => console.log('Manifest fetched to trigger installability check'));
    }
  } else {
    console.warn('No manifest link found in document head');
  }
}

export function showInstallPrompt(): Promise<boolean> {
  console.log('Attempting to show install prompt');
  
  if (!deferredPrompt) {
    console.log('No deferred prompt available, cannot show install prompt');
    
    // Try to manually trigger installability check
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        console.log('Service worker registrations:', registrations.length);
      });
    }
    
    // On iOS, we can provide custom instructions
    if (/(iPhone|iPod|iPad)/i.test(navigator.userAgent)) {
      console.log('On iOS device, use Add to Home Screen option');
      return Promise.resolve(false);
    }
    
    // Try manual installation for Chrome
    if (/Chrome/.test(navigator.userAgent)) {
      console.log('Chrome detected, checking for installability');
      
      // Try to force show the install prompt
      const manifestLink = document.querySelector('link[rel="manifest"]');
      if (manifestLink) {
        console.log('Manifest found, attempting to trigger install check');
        fetch(manifestLink.getAttribute('href') || '')
          .then(() => console.log('Manifest fetched to trigger installability'));
      }
    }
    
    return Promise.resolve(false);
  }

  console.log('Showing install prompt');
  // Show the install prompt
  deferredPrompt.prompt();

  // Wait for the user to respond to the prompt
  return deferredPrompt.userChoice.then((choiceResult) => {
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
      deferredPrompt = null;
      return true;
    } else {
      console.log('User dismissed the install prompt');
      return false;
    }
  });
} 