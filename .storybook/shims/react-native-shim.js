// Minimal react-native shim for Storybook web.
// Re-export react-native-web and attach small runtime shims for NativeModules/UIManager/etc.
import * as RNWeb from 'react-native-web';

// Minimal NativeModules expected by some libraries
const NativeModules = {
    UIManager: {},
    PlatformConstants: { forceTouchAvailable: false },
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

export * from 'react-native-web';
export { NativeEventEmitter, NativeModules, Platform, UIManager };
export default { ...RNWeb, NativeModules, UIManager, NativeEventEmitter, Platform };

