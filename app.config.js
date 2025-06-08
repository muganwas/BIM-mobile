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
            "supportsTablet": true
        },
        "android": {
            "adaptiveIcon": {
                "foregroundImage": "./assets/images/logo.png",
                "backgroundColor": "#ffffff"
            },
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