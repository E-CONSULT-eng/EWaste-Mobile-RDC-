import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { testFirestoreConnection } from './firebase';

// Validate Firestore connection on boot
testFirestoreConnection();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register Service Worker for offline capability & instant OTA updates
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      console.log('ServiceWorker registered with scope:', reg.scope);
      // Immediately check for updates
      reg.update().catch(() => {});

      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[SW] New version available, activating...');
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        }
      });
    }).catch((err) => {
      console.log('ServiceWorker registration failed:', err);
    });

    // When controller changes (new SW took control), dispatch event
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[SW] Controller changed: new version active');
      window.location.reload();
    });
  });
}

// Periodic background check for version updates (every 3 minutes) for continuous publication & sync
setInterval(async () => {
  try {
    const res = await fetch('/version.json?t=' + Date.now(), { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      const localVersion = localStorage.getItem('ewaste_system_version');
      if (localVersion && localVersion !== data.version) {
        console.log('[OTA Sync] New version detected:', data.version);
        localStorage.setItem('ewaste_system_version', data.version);
        window.location.reload();
      } else if (!localVersion) {
        localStorage.setItem('ewaste_system_version', data.version);
      }
    }
  } catch (err) {
    // Offline mode or network unreachable - continue normally
  }
}, 180000);
