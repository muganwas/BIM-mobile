const React = require('react');

module.exports = {
    SafeAreaView: ({ children, style }) => React.createElement('div', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
};
