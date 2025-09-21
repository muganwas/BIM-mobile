import React from 'react';

// Visible, lightweight shim for @expo/vector-icons in Storybook web.
// Renders a simple SVG icon so placeholders are actually visible.
const StubIcon = ({ size = 16, color = 'currentColor', name, ...rest }) => {
    const isClock = typeof name === 'string' && name.toLowerCase().includes('clock');
    if (isClock) {
        // Clock glyph
        return React.createElement(
            'svg',
            {
                width: size,
                height: size,
                viewBox: '0 0 24 24',
                fill: 'none',
                stroke: color,
                strokeWidth: 2,
                'data-shim-icon': true,
                style: { display: 'inline-block', verticalAlign: 'middle' },
                ...rest,
            },
            React.createElement('circle', { cx: 12, cy: 12, r: 9 }),
            React.createElement('line', { x1: 12, y1: 12, x2: 12, y2: 7 }),
            React.createElement('line', { x1: 12, y1: 12, x2: 16, y2: 12 }),
        );
    }
    // Calendar glyph (default)
    return React.createElement(
        'svg',
        {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: 2,
            'data-shim-icon': true,
            style: { display: 'inline-block', verticalAlign: 'middle' },
            ...rest,
        },
        React.createElement('rect', { x: 3, y: 4, width: 18, height: 17, rx: 2, ry: 2 }),
        React.createElement('line', { x1: 3, y1: 10, x2: 21, y2: 10 }),
        React.createElement('line', { x1: 8, y1: 2, x2: 8, y2: 6 }),
        React.createElement('line', { x1: 16, y1: 2, x2: 16, y2: 6 }),
    );
};

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
