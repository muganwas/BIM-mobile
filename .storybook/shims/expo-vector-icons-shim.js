import React from 'react';

// Minimal, forgiving shim for @expo/vector-icons used in Storybook web.
// Any requested icon export will be a simple stub component that renders
// an empty inline-block so layout doesn't break.
const StubIcon = ({ size = 16, color = 'currentColor', ...rest }) =>
    React.createElement('span', {
        'data-shim-icon': true,
        style: { display: 'inline-block', width: size, height: size, background: 'transparent' },
        ...rest,
    });

// Export common icon families as stubs. Apps commonly import named families.
export const Ionicons = StubIcon;
export const MaterialIcons = StubIcon;
export const FontAwesome = StubIcon;
export const Entypo = StubIcon;
export const Feather = StubIcon;
export const MaterialCommunityIcons = StubIcon;
export const Octicons = StubIcon;

// default export usable as a generic icon component
export default StubIcon;
