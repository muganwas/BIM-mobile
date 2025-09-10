// ESM wrapper that explicitly exports commonly-used React Native symbols
// and falls back to the default shim for anything else.
import ShimDefault, * as Shim from '../react-native-shim.js';

// Ensure a minimal globalThis.expo object exists for expo-modules-core runtime checks.
// expo-modules-core calls ensureNativeModulesAreInstalled() which expects
// registerWebGlobals() to set `globalThis.expo`. Some package entrypoints
// don't resolve the web-specific build in our Storybook environment, so
// provide a safe fallback here that supplies the small subset of APIs
// that libraries (like expo-web-browser, expo-modules-core) access.
if (typeof globalThis !== 'undefined' && !globalThis.expo) {
    globalThis.expo = {
        // Minimal NativeModule placeholder used by expo-modules-core
        NativeModule: {},
        // Minimal EventEmitter used by some expo pieces
        EventEmitter: class {
            addListener() { }
            removeListener() { }
            emit() { }
        },
        // Lightweight SharedObject/SharedRef placeholders
        SharedObject: class { },
        SharedRef: class { },
        // A place to register any web-specific module implementations
        modules: {},
        // UUID helpers (no-op identifiers) — some code references uuidv4/uuidv5
        uuidv4: () => '',
        uuidv5: () => '',
        getViewConfig: () => {
            throw new Error('Method not implemented.');
        },
        reloadAppAsync: async () => {
            try {
                if (typeof window !== 'undefined' && window.location) window.location.reload();
            } catch (_e) {
                /* ignore in storybook */
            }
        },
    };
}

// Ensure common web modules are registered on globalThis.expo.modules so
// `requireNativeModule('ExpoWebBrowser')` and similar resolve.
try {
    const webModules = (globalThis && globalThis.expo && globalThis.expo.modules) || {};
    // Prefer implementation from the underlying shim if available
    const shimNativeModules = (Shim && Shim.NativeModules) || (ShimDefault && ShimDefault.NativeModules) || {};
    webModules.ExpoWebBrowser = webModules.ExpoWebBrowser || shimNativeModules.ExpoWebBrowser || {
        openBrowserAsync: async (url) => {
            try {
                if (typeof window !== 'undefined' && window.open) window.open(url, '_blank');
            } catch (_e) {
                /* ignore */
            }
            return { type: 'opened' };
        },
    };
    if (globalThis && globalThis.expo) globalThis.expo.modules = webModules;
} catch (_e) {
    // ignore shim setup errors in storybook
}

// Common named exports expected by many libraries/stories
export const View = (Shim && Shim.View) || (ShimDefault && ShimDefault.View);
export const Text = (Shim && Shim.Text) || (ShimDefault && ShimDefault.Text);
export const Image = (Shim && Shim.Image) || (ShimDefault && ShimDefault.Image);
export const Animated = (Shim && Shim.Animated) || (ShimDefault && ShimDefault.Animated);
export const ScrollView = (Shim && Shim.ScrollView) || (ShimDefault && ShimDefault.ScrollView);
export const FlatList = (Shim && Shim.FlatList) || (ShimDefault && ShimDefault.FlatList);
export const SafeAreaView = (Shim && Shim.SafeAreaView) || (ShimDefault && ShimDefault.SafeAreaView);
export const TouchableOpacity = (Shim && Shim.TouchableOpacity) || (ShimDefault && ShimDefault.TouchableOpacity);

// Minimal TurboModuleRegistry shim required by some native libraries (e.g. react-native-svg fabric)
// Provide getEnforcing(name) -> returns a no-op proxy so method calls don't crash in the web preview.
// TurboModuleRegistry stub: some libraries import { TurboModuleRegistry } from 'react-native'
// and call TurboModuleRegistry.getEnforcing(name). Provide a no-op implementation here
// that returns a proxy with noop functions to avoid runtime crashes in Storybook web.
export const TurboModuleRegistry = {
    getEnforcing: (/* name */) => new Proxy({}, {
        get: () => () => undefined,
    }),
};

// Re-export everything else and default
export * from '../react-native-shim.js';
export { ShimDefault as default };

