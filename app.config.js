export default ({ config }) => {
    const ENV = process.env.ENV || 'development';
    return {
        ...config,
        "name": "BIM-mobile",
        "slug": "BIM-mobile",
        "version": "1.0.0",
        "orientation": "portrait",
        "icon": "./assets/images/icon.png",
        "scheme": "bimmobile",
        "userInterfaceStyle": "automatic",
        "newArchEnabled": true,
        "ios": {
            supportsTablet: true,
            bundleIdentifier: 'com.muganwas.BIMmobile',
            googleServicesFile: './GoogleService-Info.plist',
            infoPlist: {
                NSCameraUsageDescription: "This app needs access to your camera to let you take photos.",
                NSPhotoLibraryUsageDescription: "This app needs access to your photo library to let you select photos.",
                NSPhotoLibraryAddUsageDescription: "This app needs access to save photos to your library.",
                "NSAppTransportSecurity": {
                    "NSAllowsArbitraryLoads": false,
                    "NSAllowsLocalNetworking": true,
                    NSExceptionDomains: {
                        "192.168.100.6": {
                            NSIncludesSubdomains: true,
                            NSTemporaryExceptionAllowsInsecureHTTPLoads: true,
                        },
                        "192.168.5.11": {
                            NSIncludesSubdomains: true,
                            NSTemporaryExceptionAllowsInsecureHTTPLoads: true,
                        },
                        "localhost": {
                            NSIncludesSubdomains: true,
                            NSTemporaryExceptionAllowsInsecureHTTPLoads: true,
                        },
                    },
                },
                "UIBackgroundModes": [
                    "fetch",
                    "processing",
                    "remote-notification",
                ]
            },
        },
        "android": {
            icon: './assets/images/icon.png',
            "package": "com.muganwas.BIMmobile",
            "adaptiveIcon": {
                "foregroundImage": "./assets/images/adaptive-icon.png",
                "backgroundColor": "#ffffff"
            },
            permissions: [
                "CAMERA",
                "READ_EXTERNAL_STORAGE",
                "WRITE_EXTERNAL_STORAGE",
                "READ_MEDIA_IMAGES",
            ],
            "edgeToEdgeEnabled": true
        },
        "web": {
            "bundler": "metro",
            "output": "static",
            "favicon": "./assets/images/favicon.png"
        },
        plugins: [
            /** may be needed in future */
            // '@react-native-firebase/app',
            // '@react-native-firebase/auth',
            // '@react-native-firebase/crashlytics',
            // "@react-native-google-signin/google-signin",
            [
                'expo-build-properties',
                {
                    ios: {
                        useFrameworks: 'static',
                    },
                    android: {
                        "networkSecurityConfig": './network_security_config.xml',
                    }
                },
            ],
            './plugins/withNetworkSecurityConfig.js',
            'expo-router',
            [
                'expo-splash-screen',
                {
                    image: './assets/images/splash-icon.png',
                    imageWidth: 200,
                    resizeMode: 'contain',
                    backgroundColor: '#ffffff',
                },
            ],
            [
                'expo-font',
                // {
                //     fonts: [
                //         './assets/fonts/SpaceMono-Regular.ttf',
                //         './assets/fonts/Peralta-Regular.ttf',
                //         './assets/fonts/sf-pro-display/Sf-Pro-Display-Regular.otf',
                //     ],
                // },
            ],
            [
                'expo-image-picker',
                {
                    photosPermission:
                        'The app accesses your photos to let you share them with your friends.',
                },
            ],
        ],
        "experiments": {
            "typedRoutes": true
        },
        extra: {
            apiBaseUrl: process.env.API_BASE_URL,
            env: ENV,
            countryCode: process.env.COUNTRY_CODE,
            countryName: process.env.COUNTRY_NAME,
            phoneNumberLength: process.env.PHONE_NUMBER_LENGTH,
            router: {
                origin: false,
            },
            eas: {
                //sprojectId: '5df788ea-5b51-4b15-ae1f-33b91fb56b67',
            },
        },
    }
}