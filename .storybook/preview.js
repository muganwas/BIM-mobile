// Ensure a minimal `process` object exists in the browser runtime for
// libraries that reference `process` (e.g. util/assert do).
// This must run early, before other modules rely on `process`.
import React from 'react';
import { View } from 'react-native';
// Synchronously import react-dom so we can patch it before Storybook runtime uses it.
import * as ReactDOM from 'react-dom';
import * as ReactDOMClient from 'react-dom/client';

// If unmountComponentAtNode is missing (React 18), provide a synchronous polyfill
// that delegates to createRoot().unmount() where possible.
if (typeof ReactDOM['unmountComponentAtNode'] === 'undefined') {
    try {
        if (ReactDOMClient && typeof ReactDOMClient.createRoot === 'function') {
            ReactDOM['unmountComponentAtNode'] = function (container) {
                try {
                    const root = ReactDOMClient.createRoot(container);
                    root.unmount();
                    return true;
                } catch (_e) {
                    while (container.firstChild) container.removeChild(container.firstChild);
                    return true;
                }
            };
        }
    } catch (_e) {
        // ignore
    }
}

// Ensure a minimal `process` object exists in the browser runtime for
// libraries that reference `process` (e.g. util/assert do).
// This must run early, before other modules rely on `process`.
if (typeof globalThis.process === 'undefined') {
    globalThis.process = { env: { NODE_ENV: 'development' } };
}

// Runtime polyfill: ensure ReactDOM.unmountComponentAtNode exists for React 18+.
// Some Storybook internals call this API; provide a runtime delegating implementation
// that uses react-dom/client.createRoot().unmount() when available.
(async () => {
    try {
        const ReactDOM = await import('react-dom');
        if (typeof ReactDOM['unmountComponentAtNode'] === 'undefined') {
            try {
                const client = await import('react-dom/client');
                if (client && typeof client.createRoot === 'function') {
                    ReactDOM['unmountComponentAtNode'] = (container) => {
                        try {
                            const root = client.createRoot(container);
                            root.unmount();
                            return true;
                        }
                        catch (_err) {
                            while (container.firstChild) container.removeChild(container.firstChild);
                            return true;
                        }
                    };
                }
            }
            catch (_e) {
                // ignore
            }
        }
    }
    catch (_e) {
        // ignore
    }
})();

// Using React.createElement avoids JSX parsing in a plain ESM file.
export const decorators = [
    (Story) =>
        React.createElement(
            View,
            { style: { flex: 1, padding: 16 } },
            React.createElement(Story)
        ),
];

export const parameters = {
    actions: { argTypesRegex: '^on[A-Z].*' },
};
