// src/lib/haptics.ts
// Mëku Storybook Studio v2.1.0
// Haptic feedback utility for mobile devices

export type HapticPattern = 'tap' | 'success' | 'error' | 'warning';

export const triggerHaptic = (pattern: HapticPattern) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    switch (pattern) {
      case 'tap': 
        navigator.vibrate(10);
        break;
      case 'success': 
        navigator.vibrate([10, 50, 10]);
        break;
      case 'error': 
        navigator.vibrate([10, 30, 10, 30, 10]);
        break;
      case 'warning':
        navigator.vibrate([10, 20, 10]);
        break;
    }
  }
};

// Check if haptics are supported
export const isHapticsSupported = (): boolean => {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
};
