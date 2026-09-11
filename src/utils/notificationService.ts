// Web Push and In-App Sound Notification Service for REGEDEK Kinshasa
import { InAppNotification } from '../types';

// Play a pleasant notification chime using Web Audio API
export function playNotificationSound() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Harmonic two-tone chime (e.g. 523.25Hz -> 659.25Hz)
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12); // A5
    gain2.gain.setValueAtTime(0.2, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);
  } catch (e) {
    // Audio might be restricted until user gesture, safely ignore
  }
}

// Check native browser notification permission
export function getPushPermissionStatus(): NotificationPermission {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    return Notification.permission;
  }
  return 'denied';
}

// Request permission for Web Push Notifications
export async function requestPushPermission(): Promise<NotificationPermission> {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (e) {
      console.warn("Error requesting push notification permission:", e);
      return 'denied';
    }
  }
  return 'denied';
}

// Trigger native OS/Browser Push Notification
export function sendBrowserPushNotification(notification: InAppNotification) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    try {
      const iconUrl = '/favicon.ico';
      const n = new Notification(`REGEDEK Kinshasa: ${notification.title}`, {
        body: notification.message,
        icon: iconUrl,
        badge: iconUrl,
        tag: `sig-${notification.signalementId}-${notification.status}`,
      });

      n.onclick = () => {
        window.focus();
        n.close();
      };
    } catch (e) {
      console.warn("Failed to fire browser push notification:", e);
    }
  }
}
