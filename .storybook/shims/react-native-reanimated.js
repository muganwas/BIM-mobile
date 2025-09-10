// Minimal shim for react-native-reanimated used in web Storybook
import React from 'react';

const noop = () => { };

export const useSharedValue = (v) => ({ value: v });
export const useAnimatedStyle = (fn) => fn || (() => ({}));
export const withTiming = (v) => v;
export const runOnJS = (fn) => fn;
export const useAnimatedRef = () => React.useRef(null);

const defaultExport = {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    runOnJS,
    useAnimatedRef,
    // helpers
    Value: function () { },
    event: () => noop,
};

export default defaultExport;
