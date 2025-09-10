// Minimal react-native shim for Storybook web.
// Re-export react-native-web and attach small runtime shims for NativeModules/UIManager/etc.
import React from 'react';
import * as RNWeb from 'react-native-web';

// Minimal NativeModules expected by some libraries
const NativeModules = {
    UIManager: {},
    PlatformConstants: { forceTouchAvailable: false },
    // Minimal RNCNetInfo native module shim used by @react-native-community/netinfo
    RNCNetInfo: {
        getCurrentState: async () => ({ isConnected: true, isInternetReachable: true }),
        addListener: () => ({ remove: () => { } }),
        removeListeners: () => { },
    },
    // Minimal Expo Web Browser native module shim
    ExpoWebBrowser: {
        openBrowserAsync: async (url) => {
            // open in a new tab on web
            try {
                if (typeof window !== 'undefined' && window.open) window.open(url, '_blank');
            } catch (_e) {
                // ignore in test/storybook environment
            }
            return { type: 'opened' };
        },
        // Some builds access NativeModule on the platform implementation
        NativeModule: {
            openBrowserAsync: async (url) => {
                try {
                    if (typeof window !== 'undefined' && window.open) window.open(url, '_blank');
                } catch (_e) {
                    // ignore
                }
                return { type: 'opened' };
            },
        },
    },
};

// Minimal UIManager stub
const UIManager = NativeModules.UIManager;

// Minimal NativeEventEmitter stub
class NativeEventEmitter {
    constructor() { }
    addListener() { }
    removeListener() { }
    removeAllListeners() { }
}

// Minimal Platform stub
const Platform = {
    OS: 'web',
    select: obj => (obj && obj.web != null ? obj.web : obj.default || obj),
};

// Minimal ToastAndroid stub (no-op for web)
const ToastAndroid = {
    SHORT: 0,
    LONG: 1,
    TOP: 0,
    BOTTOM: 1,
    CENTER: 2,
    show: (message, duration) => {
        // no-op on web; log for visibility in Storybook console
        console.info('[ToastAndroid]', message, duration);
    },
    showWithGravity: (message, duration, gravity) => {
        console.info('[ToastAndroid]', message, duration, gravity);
    },
    showWithGravityAndOffset: (message, duration, gravity, xOffset, yOffset) => {
        console.info('[ToastAndroid]', message, duration, gravity, xOffset, yOffset);
    },
};

// Provide a simple useAnimatedValue hook that returns a react-native-web Animated.Value
export const useAnimatedValue = (initialValue) => {
    const ref = React.useRef();
    if (!ref.current) {
        try {
            ref.current = new RNWeb.Animated.Value(initialValue);
        } catch (_e) {
            // fallback to simple object when Animated.Value isn't available
            ref.current = { value: initialValue };
        }
    }
    return ref.current;
};

export * from 'react-native-web';
export { NativeEventEmitter, NativeModules, Platform, ToastAndroid, UIManager };
export default { ...RNWeb, NativeModules, UIManager, NativeEventEmitter, Platform, ToastAndroid, useAnimatedValue };

