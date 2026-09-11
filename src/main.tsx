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
      window.dispatchEvent(new CustomEvent('regedek_sw_updated'));
    });
  });
}
