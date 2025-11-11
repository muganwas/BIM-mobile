import Toast from '@/components/Toast';
import { apiBaseUrl } from '@/constants/API';
import { delay } from '@/helpers';
import { apiFetch } from '@/helpers/api';
import {
	headerOptions,
	langCode,
	notifications,
	User as UserProps,
} from '@/types';
import { useNetInfo } from '@react-native-community/netinfo';
import * as DeviceInfo from 'expo-device';
import { useRouter } from 'expo-router';
import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react';
import { Keyboard, Platform } from 'react-native';

type RouterType = ReturnType<typeof useRouter>;

export interface AuthContextType {
	user: UserProps | null;
	language: langCode;
	setLanguage: (l: langCode) => void;
	handleLogout: () => Promise<void>;
	fetchNotifications: () => Promise<void>;
	notifications: notifications[];
	isAnimatable: boolean;
	isHighEndDevice: boolean;
	keyboardVisible: boolean;
	setNotifications: React.Dispatch<React.SetStateAction<notifications[]>>;
	selectedOption: headerOptions | undefined;
	setSelectedOption: React.Dispatch<
		React.SetStateAction<headerOptions | undefined>
	>;
	history: string[];
	handleUpdateHistory: (current: string) => void;
	handleGoBack: () => void;
	handleAuthentication: (credentials: {
		number: string;
		password?: string;
	}) => Promise<void>;
	// Phone number used for pending 2FA verification after initiating login/register
	pendingPhone?: string | null;
	online: boolean;
	router: RouterType;
	// Global app message (shown in Toast)
	appMessage?: { type: 'error' | 'message'; message: string | null } | null;
	setAppMessage: React.Dispatch<
		React.SetStateAction<{
			type: 'error' | 'message';
			message: string | null;
		} | null>
	>;
}

const GeneralContext = createContext<AuthContextType | undefined>(undefined);

const HISTORY_KEY = 'BIM_history_v1';
const MAX_HISTORY = 5;

export const GeneralProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const router = useRouter();
	const netInfo = useNetInfo();
	const totalMemory = (DeviceInfo as any)?.totalMemory;

	// Used to suppress history updates while we are programmatically navigating back
	const navigatingBackRef = React.useRef(false);

	const [user, setUser] = useState<UserProps | null>(null);
	const [notifications, setNotifications] = useState<notifications[]>([]);
	const [pendingPhone, setPendingPhone] = useState<string | null>(null);
	// global message state shown as toast/modal
	const [appMessage, setAppMessage] = useState<{
		type: 'error' | 'message';
		message: string | null;
	} | null>(null);
	const [language, setLanguage] = useState<langCode>('en');
	const [online, setOnline] = useState<boolean>(true);
	const [selectedOption, setSelectedOption] = useState<
		headerOptions | undefined
	>(undefined);
	const [mounted, setMounted] = useState<boolean>(false);
	const [isAnimatable, setIsAnimatable] = useState<boolean>(false);
	const [isHighEndDevice, setIsHighEndDevice] = useState<boolean>(false);
	const [keyboardVisible, setKeyboardVisible] = useState<boolean>(false);

	const [history, setHistory] = useState<string[]>(() => {
		try {
			if (typeof window !== 'undefined' && window.sessionStorage) {
				const raw =
					window.sessionStorage.getItem(HISTORY_KEY) ||
					window.localStorage.getItem(HISTORY_KEY);
				if (raw) {
					const parsed = JSON.parse(raw);
					if (Array.isArray(parsed)) return parsed as string[];
				}
			}
		} catch {
			// ignore
		}
		return [];
	});

	// Keep an up-to-date ref of history so we can read it synchronously
	// without causing re-renders or relying on setState updaters.
	const historyRef = React.useRef<string[]>(history);
	useEffect(() => {
		historyRef.current = history;
	}, [history]);

	useEffect(() => {
		const show = Keyboard.addListener('keyboardDidShow', () =>
			setKeyboardVisible(true)
		);
		const hide = Keyboard.addListener('keyboardDidHide', () =>
			setKeyboardVisible(false)
		);
		delay(200).then(() => setMounted(true));
		return () => {
			show.remove();
			hide.remove();
		};
	}, []);

	useEffect(() => {
		if (!totalMemory) return;
		const lIsHighEnd = totalMemory > 4 * 1024 * 1024 * 1024;
		setIsHighEndDevice(lIsHighEnd);
		setIsAnimatable(
			Platform.OS === 'ios' || (Platform.OS === 'android' && lIsHighEnd)
		);
	}, [totalMemory]);

	useEffect(() => {
		if (mounted) (async () => await fetchNotifications())();
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
			} else setOnline(false);
		};
		mounted && check();
	}, [netInfo, mounted]);

	const normalizePath = (p: string) => {
		try {
			const stripped = p.split('?')[0].split('#')[0];
			const parts = stripped.split('/').filter(Boolean);
			return (
				'/' +
				parts
					.map((seg) =>
						/^\d+$/.test(seg) || /^[0-9a-fA-F-]{8,}$/.test(seg) ? ':id' : seg
					)
					.join('/')
			);
		} catch {
			return p;
		}
	};

	const persist = (arr: string[]) => {
		try {
			if (typeof window !== 'undefined' && window.sessionStorage) {
				const payload = JSON.stringify(arr);
				window.sessionStorage.setItem(HISTORY_KEY, payload);
				window.localStorage.setItem(HISTORY_KEY, payload);
			}
		} catch (e) {
			if ((window as any)?.__BIM_HISTORY_DEBUG__)
				console.debug('GeneralContext: persist failed', e);
		}
	};

	const handleUpdateHistory = useCallback((current: string) => {
		const debug = (window as any)?.__BIM_HISTORY_DEBUG__;
		if (debug) console.debug('handleUpdateHistory called with', current);
		setHistory((prev) => {
			if (debug) console.debug('handleUpdateHistory prev', prev);
			// If a back navigation is in progress, ignore incidental updates
			if (navigatingBackRef.current) {
				if (debug)
					console.debug('handleUpdateHistory: skipping due to back nav');
				return prev;
			}
			try {
				const last = prev[prev.length - 1] || '';
				if (
					current === '/(authenticated)/routers' &&
					last.includes('/(authenticated)/routers/hotspots')
				)
					return prev;
			} catch {}

			// If the routers parent is being pushed AFTER a routers detail is already last,
			// reorder so the parent sits immediately before the current detail (keep detail last).
			try {
				const isRoutersParent = current === '/(authenticated)/routers';
				const last = prev[prev.length - 1] || '';
				const isRoutersDetail = /\/(authenticated)\/routers\/preview\//.test(
					last
				);
				if (isRoutersParent && isRoutersDetail) {
					// Remove any previous occurrences of the parent to avoid duplicates
					const withoutParent = prev.filter(
						(p) => normalizePath(p) !== normalizePath(current)
					);
					const lastEntry = withoutParent[withoutParent.length - 1];
					const base = withoutParent.slice(0, -1);
					const reordered = [...base, current, lastEntry].slice(
						Math.max(0, base.length + 2 - MAX_HISTORY)
					);
					if (debug)
						console.debug(
							'handleUpdateHistory: reorder parent before detail',
							reordered
						);
					persist(reordered);
					return reordered;
				}
			} catch {}

			if (prev.length > 0 && prev[prev.length - 1] === current) {
				if (debug)
					console.debug(
						'handleUpdateHistory: identical last entry, skipping',
						current
					);
				return prev;
			}

			if (
				prev.length > 0 &&
				normalizePath(prev[prev.length - 1]) === normalizePath(current)
			) {
				const updated = [...prev];
				updated[updated.length - 1] = current;
				if (debug)
					console.debug('handleUpdateHistory: replace-last with', updated);
				persist(updated);
				return updated;
			}

			const next = [...prev, current];
			if (next.length > MAX_HISTORY) {
				next.splice(0, next.length - MAX_HISTORY);
			}
			if (debug) console.debug('handleUpdateHistory: push next', next);
			persist(next);
			return next;
		});
	}, []);

	useEffect(() => {
		if (typeof window !== 'undefined') {
			(window as any).__BIM_DUMP_HISTORY__ = () =>
				console.log('BIM_HISTORY_DUMP', history);
			return () => {
				try {
					delete (window as any).__BIM_DUMP_HISTORY__;
				} catch {}
			};
		}
	}, [history]);

	const navigateToPath = useCallback(
		(path: string) => {
			try {
				(router.replace as any)(path);
				return;
			} catch {}
			try {
				(router.push as any)(path);
				return;
			} catch {}
			try {
				router.replace(path as any);
			} catch {}
		},
		[router]
	);

	const handleGoBack = useCallback(() => {
		navigatingBackRef.current = true;
		const prev = historyRef.current || [];
		let action: () => void = () => {};

		if ((window as any)?.__BIM_HISTORY_DEBUG__)
			console.debug('handleGoBack using history', prev);

		if (prev.length <= 1 || !prev[prev.length - 2]) {
			// No previous path recorded, use a fallback navigation
			let currentPath = '';
			try {
				const anyRouter = router as any;
				currentPath =
					anyRouter?.pathname || anyRouter?.asPath || anyRouter?.route || '';
			} catch {}
			if (currentPath && /\/routers\/hotspots\//.test(currentPath)) {
				action = () => navigateToPath('/(authenticated)/packages');
			} else {
				action = () => router.back?.();
			}
		} else {
			// Pop current and navigate to the immediate previous entry
			const targetPath = prev[prev.length - 2];
			const newHistory = prev.slice(0, -1);
			setHistory(newHistory);
			persist(newHistory);
			action = () => {
				try {
					navigateToPath(targetPath);
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
			};
		}

		// Perform navigation after state has been updated, outside of render/state updater
		setTimeout(() => {
			try {
				action();
			} finally {
				navigatingBackRef.current = false;
			}
		}, 0);
	}, [router, navigateToPath]);

	const handleAuthentication = async ({
		number,
		password,
	}: {
		number: string;
		password?: string;
	}) => {
		// Initiate login which (per backend) sends a 2FA OTP to the provided phone
		try {
			const res = await apiFetch((apiBaseUrl || '') + '/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					phone: number.replaceAll(' ', ''),
					password: password ?? '',
				}),
			});
			if (!res.ok) {
				// Prefer extracting JSON message, fallback to text, then generic HTTP code message
				let text: string | null = null;
				try {
					const ct = res.headers.get('content-type') || '';
					if (ct.includes('application/json')) {
						const body = await res.json();
						text =
							(body && (body.message || body.error)) || JSON.stringify(body);
					} else {
						text = await res.text();
					}
				} catch {}
				if (!text) text = `HTTP error ${res.status}`;
				setAppMessage({ type: 'error', message: String(text) });
				return;
			}
			const data = await res.json();
			console.info('Login response data:', data);
			// Store the pending phone so the verify screen can reference it if need
			setPendingPhone(data?.phone || number);
			// Navigate to verify screen for OTP entry
			router.replace('/(auth)/verify');
		} catch (error) {
			// Surface unexpected/network errors via the global app message instead of throwing
			const msg = (error && (error as any).message) || 'Login failed';
			setAppMessage({ type: 'error', message: String(msg) });
		}
	};

	const handleLogout = async () => {
		setUser(null);
		setNotifications([]);
		router.replace('/(auth)/login');
	};

	const fetchNotifications = async () => {
		const fetched: notifications[] = [];
		setNotifications(fetched);
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
				pendingPhone,
				online,
				appMessage,
				setAppMessage,
			}}
		>
			{children}
			{/* Global toast for app messages/errors */}
			<Toast
				visible={!!appMessage}
				type={appMessage?.type ?? 'message'}
				message={appMessage?.message ?? ''}
				onDismiss={() => setAppMessage(null)}
			/>
		</GeneralContext.Provider>
	);
};

export const useGeneral = () => {
	const context = useContext(GeneralContext);
	if (!context)
		throw new Error('useGeneral must be used within a GeneralProvider');
	return context;
};

export function enableHistoryDebug() {
	if (typeof window !== 'undefined')
		(window as any).__BIM_HISTORY_DEBUG__ = true;
}

export function disableHistoryDebug() {
	if (typeof window !== 'undefined')
		(window as any).__BIM_HISTORY_DEBUG__ = false;
}
