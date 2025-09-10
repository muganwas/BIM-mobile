// Minimal stub for react-native's codegenNativeComponent used by some RN libraries
module.exports = function codegenNativeComponent(name) {
    // Return a simple passthrough component for web stories
    const React = require('react');
    const Comp = React.forwardRef((props, ref) => React.createElement('div', { ...props, ref }));
    Comp.displayName = `CodegenNativeComponent(${String(name)})`;
    return Comp;
};
