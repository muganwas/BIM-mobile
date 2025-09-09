// Minimal shim for react-native-reanimated used in web Storybook
const React = require('react');

const noop = () => { };

module.exports = {
    // minimal named exports
    useSharedValue: (v) => ({ value: v }),
    useAnimatedStyle: (fn) => fn || (() => ({})),
    withTiming: (v) => v,
    runOnJS: (fn) => fn,
    // default export to satisfy both import styles
    default: {
        useSharedValue: (v) => ({ value: v }),
        useAnimatedStyle: (fn) => fn || (() => ({})),
        withTiming: (v) => v,
        runOnJS: (fn) => fn,
        // helpers
        Value: function () { },
        event: () => noop,
    },
    __esModule: true,
};
