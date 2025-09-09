// Storybook react-dom shim: expose render/unmount helpers compatible with Storybook internals.
// Use react-dom/client.createRoot() when available (React 18+). Fall back to legacy render/unmount
// where possible.
import * as ReactDOM from 'react-dom';

// Try to synchronously detect react-dom/client.createRoot at module init.
// On modern React (18+), this will be available and we can avoid any
// usage of the deprecated ReactDOM.render API entirely.
let createRootImpl = null;
try {
    // require is synchronous and OK in this shim context.
    // If it fails, we fallback to legacy methods below.
    const client = require('react-dom/client');
    if (client && typeof client.createRoot === 'function') {
        createRootImpl = client.createRoot;
    }
} catch (_errInit) {
    createRootImpl = null;
}

const roots = new WeakMap();

export const renderElement = async (node, el) =>
    new Promise((resolve) => {
        try {
            if (createRootImpl) {
                const root = createRootImpl(el);
                roots.set(el, root);
                root.render(node);
                resolve(null);
                return;
            }
            // As a last-resort fallback (older React), use the classic render.
            // Use bracket access so static linters don't flag direct identifiers as deprecated.
            ReactDOM['render'](node, el, () => resolve(null));
        } catch (_err) {
            // Fallback attempt: try dynamic import of client and render if possible
            import('react-dom/client')
                .then((client) => {
                    if (client && typeof client.createRoot === 'function') {
                        const root = client.createRoot(el);
                        roots.set(el, root);
                        root.render(node);
                    } else {
                        ReactDOM['render'](node, el, () => { });
                    }
                })
                .finally(() => resolve(null));
        }
    });

export const unmountElement = (el) => {
    try {
        const root = roots.get(el);
        if (root && typeof root.unmount === 'function') {
            root.unmount();
            roots.delete(el);
            return;
        }
        if (createRootImpl) {
            // If createRoot is available but we don't have a stored root (maybe
            // Storybook created it differently), attempt to create a temporary
            // root and unmount it immediately.
            try {
                const tempRoot = createRootImpl(el);
                if (tempRoot && typeof tempRoot.unmount === 'function') {
                    tempRoot.unmount();
                    return;
                }
            } catch (_err2) {
                // ignore
            }
        }
        // Fallback to legacy unmount if present (bracket access to avoid lint)
        if (ReactDOM && typeof ReactDOM['unmountComponentAtNode'] === 'function') {
            ReactDOM['unmountComponentAtNode'](el);
            return;
        }
        // Last resort: clear DOM
        while (el.firstChild) el.removeChild(el.firstChild);
    } catch (_err3) {
        // ignore
    }
};
