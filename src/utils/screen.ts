/**
 * Screen Wake Lock, Fullscreen, and Notification utilities for Focus Mode.
 */

let wakeLockSentinel: any = null;
let isWakeLockRequested = false;

export async function requestWakeLock(): Promise<boolean> {
  if (typeof window === 'undefined' || !('wakeLock' in navigator)) {
    return false;
  }

  isWakeLockRequested = true;

  try {
    if (!wakeLockSentinel || wakeLockSentinel.released) {
      wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
      wakeLockSentinel.addEventListener('release', () => {
        wakeLockSentinel = null;
      });
      return true;
    }
    return true;
  } catch (err) {
    // Wake Lock may fail if battery is ultra-low or user disabled it
    console.debug('Wake lock request could not be granted:', err);
    return false;
  }
}

export async function releaseWakeLock(): Promise<void> {
  isWakeLockRequested = false;
  try {
    if (wakeLockSentinel && !wakeLockSentinel.released) {
      await wakeLockSentinel.release();
    }
  } catch (err) {
    console.debug('Wake lock release error:', err);
  } finally {
    wakeLockSentinel = null;
  }
}

// Re-request wake lock if user switches away and returns to the tab
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible' && isWakeLockRequested) {
      await requestWakeLock();
    }
  });
}

/**
 * Attempts fullscreen request with cross-browser support and safety checks
 */
export async function requestFullscreenSafe(element: HTMLElement = document.documentElement): Promise<boolean> {
  try {
    if (document.fullscreenElement) return true;

    const req =
      element.requestFullscreen ||
      (element as any).webkitRequestFullscreen ||
      (element as any).mozRequestFullScreen ||
      (element as any).msRequestFullscreen;

    if (req) {
      await req.call(element);
      return true;
    }
    return false;
  } catch (err) {
    // In iframes or unprivileged contexts, requestFullscreen might throw or be denied
    console.debug('Fullscreen not allowed or denied:', err);
    return false;
  }
}

export async function exitFullscreenSafe(): Promise<boolean> {
  try {
    if (!document.fullscreenElement) return true;

    const exit =
      document.exitFullscreen ||
      (document as any).webkitExitFullscreen ||
      (document as any).mozCancelFullScreen ||
      (document as any).msExitFullscreen;

    if (exit) {
      await exit.call(document);
      return true;
    }
    return false;
  } catch (err) {
    console.debug('Exit fullscreen error:', err);
    return false;
  }
}

export function isCurrentlyFullscreen(): boolean {
  if (typeof document === 'undefined') return false;
  return !!(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).msFullscreenElement
  );
}

/**
 * Browser Notifications for session end
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  try {
    const result = await Notification.requestPermission();
    return result === 'granted';
  } catch {
    return false;
  }
}

export function showSessionCompletionNotification(title: string, body: string): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    new Notification(title, {
      body,
      icon: '/pwa-192x192.png',
      badge: '/favicon.svg',
      tag: 'tenvylo-session-finish',
    });
  } catch (err) {
    console.debug('Notification could not be displayed:', err);
  }
}
