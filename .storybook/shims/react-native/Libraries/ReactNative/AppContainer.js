// Minimal AppContainer stub for web stories. Some libraries import this for debug wrappers.
const React = require('react');

function AppContainer({ children }) {
    return React.createElement('div', null, children);
}

module.exports = AppContainer;
