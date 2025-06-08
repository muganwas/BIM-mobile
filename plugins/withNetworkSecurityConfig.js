// plugins/withNetworkSecurityConfig.js
const { withAndroidManifest } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

module.exports = function withNetworkSecurityConfig(config) {
    return withAndroidManifest(config, async (config) => {
        const manifest = config.modResults.manifest;
        const app = manifest.application?.[0]?.$;
        if (app) {
            app['android:networkSecurityConfig'] = '@xml/network_security_config';
        }
        // Copy the file if needed
        const dest = path.join(config.modRequest.projectRoot, 'android/app/src/main/res/xml/network_security_config.xml');
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(path.dirname(dest), { recursive: true });
            fs.copyFileSync(
                path.join(config.modRequest.projectRoot, 'network_security_config.xml'),
                dest
            );
        }
        return config;
    });
};