// Minimal GeneralContext shim used only inside Storybook web preview.
// Keeps the same named exports `GeneralProvider` and `useGeneral`
// but avoids importing expo-device / expo-router which trigger native prebundling.
export const GeneralProvider = ({ children }) => {
    return children;
};

export const useGeneral = () => {
    // Return the small subset of the context used by components in stories.
    return {
        user: null,
        language: 'en',
        setLanguage: () => { },
        handleLogout: async () => { },
        fetchNotifications: async () => { },
        notifications: [],
        isAnimatable: false,
        isHighEndDevice: false,
        keyboardVisible: false,
        setNotifications: () => { },
        selectedOption: undefined,
        setSelectedOption: () => { },
        history: [],
        handleUpdateHistory: () => { },
        handleGoBack: () => { },
        handleAuthentication: async () => { },
        online: true,
        router: {
            back: () => { },
            replace: () => { },
            push: () => { },
        },
    };
};

export default GeneralProvider;
