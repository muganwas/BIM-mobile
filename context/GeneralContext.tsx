import { delay } from '@/helpers';
import { User as UserProps, langCode, notifications } from '@/types';
import { useNetInfo } from '@react-native-community/netinfo';
import * as DeviceInfo from 'expo-device';
import { Router, useRouter } from 'expo-router';
import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
} from 'react';
import { Keyboard, Platform } from 'react-native';

// Define the type for the context
export interface AuthContextType {
	user: UserProps | null;
	language: langCode;
	setLanguage: (lang: langCode) => void;
	handleLogout: () => Promise<void>;
	fetchNotifications: () => Promise<void>;
	notifications: notifications[];
	isAnimatable: boolean;
	isHighEndDevice: boolean;
	keyboardVisible: boolean;
	setNotifications: React.Dispatch<React.SetStateAction<notifications[]>>;
	selectedOption:
		| 'notifications'
		| 'profile'
		| 'language'
		| 'search'
		| undefined; // Optional, can be used for dropdown state
	setSelectedOption: React.Dispatch<
		React.SetStateAction<
			'notifications' | 'profile' | 'language' | 'search' | undefined
		>
	>;
	history: string[]; // Optional, can be used for navigation history
	handleUpdateHistory: (current: string) => void;
	handleGoBack: () => void;
	handleAuthentication: (credentials: {
		number: string;
		password: string;
	}) => Promise<void>;
	online: boolean;
	router: Router;
}

// Create the context with the proper type
const GeneralContext = createContext<AuthContextType | undefined>(undefined);

export const GeneralProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const totalMemory = DeviceInfo.totalMemory;
	const router = useRouter();
	const netInfo = useNetInfo();
	const [user, setUser] = React.useState<UserProps | null>(null);
	const [notifications, setNotifications] = React.useState<notifications[]>([]);
	const [language, setLanguage] = React.useState<langCode>('en'); // Default language
	const [online, setOnline] = React.useState<boolean>(true);
	const [selectedOption, setSelectedOption] = React.useState<
		'notifications' | 'profile' | 'language' | 'search'
	>();
	const [mounted, setMounted] = React.useState<boolean>(false);
	const [isAnimatable, setIsAnimatable] = React.useState<boolean>(false);
	const [isHighEndDevice, setIsHighEndDevice] = React.useState<boolean>(false);
	const [keyboardVisible, setKeyboardVisible] = React.useState<boolean>(false);
	const [history, setHistory] = React.useState<string[]>([]);

	useEffect(() => {
		const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
			setKeyboardVisible(true);
		});
		const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
			setKeyboardVisible(false);
		});
		delay(200).then(() => setMounted(true));
		return () => {
			showSubscription.remove();
			hideSubscription.remove();
		};
	}, []);

	useEffect(() => {
		if (!totalMemory) return;
		const lIsHighEndDevice = totalMemory > 4 * 1024 * 1024 * 1024;
		setIsHighEndDevice(lIsHighEndDevice);
		setIsAnimatable(
			Platform.OS === 'ios' || (Platform.OS === 'android' && lIsHighEndDevice)
		);
	}, [totalMemory]);

	useEffect(() => {
		if (mounted) {
			(async () => await fetchNotifications())();
		}
	}, [mounted]);

	useEffect(() => {
		const check = async () => {
			if (
				netInfo.isConnected === true &&
				netInfo.isInternetReachable !== false
			) {
				try {
					const res = await fetch('https://clients3.google.com/generate_204');
					setOnline(res.status === 204);
				} catch {
					setOnline(false);
				}
			} else {
				setOnline(false);
			}
		};
		mounted && check();
	}, [netInfo, mounted]);

	const handleUpdateHistory = useCallback((current: string) => {
		// Helper: normalize a path by replacing likely id segments with a placeholder
		const normalizePath = (p: string) => {
			try {
				// strip query/hash
				const stripped = p.split('?')[0].split('#')[0];
				const parts = stripped.split('/').filter(Boolean);
				const normalized = parts
					.map((seg) => {
						// treat numeric-only or long hex/uuid-like segments as ids
						if (/^\d+$/.test(seg)) return ':id';
						if (/^[0-9a-fA-F-]{8,}$/.test(seg)) return ':id';
						return seg;
					})
					.join('/');
				return '/' + normalized;
			} catch {
				return p;
			}
		};

		setHistory((prev) => {
			// avoid pushing exact duplicate consecutive entries
			if (prev.length > 0 && prev[prev.length - 1] === current) return prev;

			// if last entry has the same skeleton (route shape) as current,
			// replace the last entry instead of pushing a new one. This prevents
			// dynamic-route parameter swaps from creating two near-duplicate entries
			// which previously caused the back handler to skip one route.
			if (prev.length > 0) {
				const last = prev[prev.length - 1];
				if (normalizePath(last) === normalizePath(current)) {
					const newHistory = [...prev];
					newHistory[newHistory.length - 1] = current; // update to newest paramized path
					return newHistory;
				}
			}

			const newHistory = [...prev, current];
			if (newHistory.length > 50) {
				newHistory.shift(); // Keep the history length manageable
			}
			return newHistory;
		});
	}, []);

	const handleGoBack = useCallback(() => {
		setHistory((prev) => {
			if (prev.length <= 1) {
				try {
					router.back?.();
				} catch {
					(router.replace as unknown as (p: string) => void)('/');
				}
				return prev;
			}

			// Build a small normalizer (mirror of handleUpdateHistory's logic)
			const normalizePath = (p: string) => {
				try {
					const stripped = p.split('?')[0].split('#')[0];
					const parts = stripped.split('/').filter(Boolean);
					const normalized = parts
						.map((seg) => {
							if (/^\d+$/.test(seg)) return ':id';
							if (/^[0-9a-fA-F-]{8,}$/.test(seg)) return ':id';
							return seg;
						})
						.join('/');
					return '/' + normalized;
				} catch {
					return p;
				}
			};

			// Remove only the current entry initially
			const newHistory = [...prev];
			newHistory.pop(); // remove current
			let previous = newHistory[newHistory.length - 1];

			if (!previous) {
				// no previous, fallback
				if (router.back) router.back();
				else (router.replace as unknown as (p: string) => void)('/');
				return newHistory;
			}

			// If the previous entry is a short-lived duplicate caused by ordering
			// (pattern like: A, B, A where current was the trailing A), try to
			// find the nearest earlier entry whose normalized skeleton differs from
			// `previous` and navigate there instead.
			let targetIndex = newHistory.length - 2; // start one before `previous`
			const prevSkeleton = normalizePath(previous);
			while (
				targetIndex >= 0 &&
				normalizePath(newHistory[targetIndex]) === prevSkeleton
			) {
				targetIndex--;
			}

			let targetPath: string;
			let resultingHistory: string[];
			if (targetIndex >= 0) {
				// We found an earlier differing entry; choose it and trim history to it
				targetPath = newHistory[targetIndex];
				resultingHistory = newHistory.slice(0, targetIndex + 1);
			} else {
				// No earlier differing entry; navigate to `previous` (the last remaining)
				targetPath = previous;
				resultingHistory = newHistory;
			}

			try {
				navigateToPath(router, targetPath);
			} catch {
				if (router.back) {
					try {
						router.back();
					} catch {
						(router.replace as unknown as (p: string) => void)(targetPath);
					}
				} else {
					(router.replace as unknown as (p: string) => void)(targetPath);
				}
			}

			return resultingHistory;
		});
	}, [router]);

	// Helper to navigate to a string path while keeping typing localized.
	function navigateToPath(router: Router, path: string) {
		// Router types in expo-router may be strict; cast once here to allow simple string paths
		try {
			// prefer replace when navigating to a previous path to avoid stacking routes
			try {
				(router.replace as unknown as (p: string) => void)(path);
				return;
			} catch {
				// fall back to push if replace isn't available on this router instance
				(router.push as unknown as (p: string) => void)(path);
				return;
			}
		} catch {
			// fallback: replace
			router.replace(path as any);
		}
	}

	const handleAuthentication = async ({
		number,
		password,
	}: {
		number: string;
		password: string;
	}) => {
		try {
			// Handle error, e.g., redirect to login
			setUser({
				id: '123doe',
				name: 'J Doe',
				email: 'jd@gmail.com',
				phone: number,
				avatarUrl: '',
				userLanguage: 'en',
				createdAt: new Date(),
				updatedAt: new Date(),
			});
			router.replace('/(auth)/verify');
		} catch (error: any) {
			console.error('Authentication error:', error);
		}
	};

	const handleLogout = async () => {
		try {
			// Simulate logout process
			setUser(null);
			setNotifications([]);
			router.replace('/(auth)/login');
		} catch (error: any) {
			console.error('Logout error:', error);
		}
	};

	const fetchNotifications = async () => {
		try {
			// Simulate fetching notifications
			const fetchedNotifications: notifications[] = [
				{
					id: '1',
					from: 'System',
					to: 'User',
					type: 'alert',
					title: 'Welcome!',
					message: 'Welcome to the app!',
					isRead: false,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			];
			setNotifications(fetchedNotifications);
		} catch (error: any) {
			console.error('Error fetching notifications:', error);
		}
	};

	return (
		<GeneralContext.Provider
			value={{
				user,
				handleLogout,
				router,
				language,
				history,
				handleUpdateHistory,
				handleGoBack,
				isAnimatable,
				isHighEndDevice,
				setLanguage,
				keyboardVisible,
				notifications,
				fetchNotifications,
				selectedOption,
				setSelectedOption,
				setNotifications,
				handleAuthentication,
				online,
			}}
		>
			{children}
		</GeneralContext.Provider>
	);
};

// Custom hook to use the AuthContext
export const useGeneral = () => {
	const context = useContext(GeneralContext);
	if (!context) {
		throw new Error('useGeneral must be used within an AuthProvider');
	}
	return context;
};
