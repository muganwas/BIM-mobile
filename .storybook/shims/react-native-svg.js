import React from 'react';

// Minimal web shim for react-native-svg used in Storybook preview.
// Converts common RN SVG primitives to DOM SVG elements and forwards props.
export const Svg = ({ children, width, height, viewBox, style, ...rest }) => {
    const attrs = { width, height, viewBox, ...rest };
    // Avoid passing array-style RN styles to DOM; normalize simple style objects
    const normStyle = style && typeof style === 'object' && !Array.isArray(style) ? style : undefined;
    if (normStyle) attrs.style = normStyle;
    return React.createElement('svg', attrs, children);
};

export const G = ({ children, ...rest }) => React.createElement('g', rest, children);
export const Path = ({ d, fill, stroke, strokeWidth, ...rest }) => React.createElement('path', { d, fill, stroke, strokeWidth, ...rest });
export const Circle = ({ cx, cy, r, ...rest }) => React.createElement('circle', { cx, cy, r, ...rest });
export const Rect = ({ x, y, width, height, rx, ry, ...rest }) => React.createElement('rect', { x, y, width, height, rx, ry, ...rest });
export const Line = ({ x1, y1, x2, y2, ...rest }) => React.createElement('line', { x1, y1, x2, y2, ...rest });
export const Ellipse = ({ cx, cy, rx, ry, ...rest }) => React.createElement('ellipse', { cx, cy, rx, ry, ...rest });

export default {
    Svg,
    G,
    Path,
    Circle,
    Rect,
    Line,
    Ellipse,
};
