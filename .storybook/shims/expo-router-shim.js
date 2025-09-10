import React from 'react';

export function useRouter() {
    return {
        back: () => { },
        replace: () => { },
        push: () => { },
    };
}

export function useNavigation() {
    return useRouter();
}

export function useLocalSearchParams() {
    return {};
}

export const Link = ({ children, href, ...props }) => {
    return React.createElement('a', { href: typeof href === 'string' ? href : '#', ...props }, children);
};

export default {
    useRouter,
    useNavigation,
    useLocalSearchParams,
    Link,
};
