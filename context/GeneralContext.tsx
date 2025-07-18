import { User as UserProps, languages, notifications } from '@/types';
import { useNetInfo } from '@react-native-community/netinfo';
import { Router, useRouter } from 'expo-router';
import React, { createContext, useContext, useEffect } from 'react';

// Define the type for the context
export interface AuthContextType {
	user: UserProps | null;
	language: languages;
	setLanguage: (lang: languages) => void;
	handleLogout: () => Promise<void>;
	fetchNotifications: () => Promise<void>;
	notifications: notifications[];
	history: string[]; // Optional, can be used for navigation history
	handleUpdateHistory: (current: string) => void;
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
	const router = useRouter();
	const netInfo = useNetInfo();
	const [user, setUser] = React.useState<UserProps | null>(null);
	const [notifications, setNotifications] = React.useState<notifications[]>([]);
	const [language, setLanguage] = React.useState<languages>('en'); // Default language
	const [online, setOnline] = React.useState<boolean>(true);
	const [mounted, setMounted] = React.useState<boolean>(false);
	const [history, setHistory] = React.useState<string[]>([]);

	useEffect(() => {
		const delay = setTimeout(() => {
			setMounted(true);
		}, 200);
		return () => clearTimeout(delay);
	}, []);

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

	const handleUpdateHistory = (current: string) => {
		setHistory((prev) => {
			const newHistory = [...prev, current];
			if (newHistory.length > 10) {
				newHistory.shift(); // Keep the history length manageable
			}
			return newHistory;
		});
	};

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
				setLanguage,
				notifications,
				fetchNotifications,
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
