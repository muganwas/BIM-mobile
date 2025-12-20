import Loader from '@/components/Loader';
import Toast from '@/components/Toast';
// apiBaseUrl removed — use service layer for endpoints
import translations from '@/constants/Trans';
import { delay, normalizePhoneForApi, parseAmount } from '@/helpers';
import { parseApiError, registerAuthCallbacks } from '@/helpers/api';
import * as AuthService from '@/services/AuthService';
import { fetchDashboard } from '@/services/UserService';
import {
	DashboardSummary,
	headerOptions,
	langCode,
	notifications,
	User as UserProps,
} from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNetInfo } from '@react-native-community/netinfo';
import * as DeviceInfo from 'expo-device';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { Animated, Keyboard, Platform } from 'react-native';

import { env } from '@/helpers/env';
const DEV_OTP = env('DEV_OTP');

type RouterType = ReturnType<typeof useRouter>;

export interface AuthContextType {
	user: UserProps | null;
	authToken?: string | null;
	setAuthToken?: React.Dispatch<React.SetStateAction<string | null>>;
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
	handleRegistration: (payload: {
		phone: string;
		password: string;
		name?: string;
		email?: string;
	}) => Promise<void>;
	// Verify OTP for a pending phone/registration. Accepts the OTP the user entered.
	handleVerify: (otp: string) => Promise<void>;
	// Verify 2FA code (authenticator app) for pending 2FA setup. Returns true on success.
	handleVerify2FA: (otp: string) => Promise<boolean>;
	// Complete TOTP setup by sending backend the setup_token, secret and otp
	handleSetupTotp: (params?: {
		setup_token?: string;
		secret?: string;
		otp?: string;
	}) => Promise<any>;
	// Pending registration payload kept until OTP verification completes
	pendingRegistration?: {
		phone: string;
		password: string;
		fullName?: string;
		email?: string;
	} | null;
	// Pending 2FA setup info returned by the backend after verification when TOTP setup is required
	pending2FASetup?: {
		qr?: string | null;
		qr_base64?: string | null;
		secret?: string | null;
		setup_token?: string | null;
		phone?: string | null;
		user?: any;
	} | null;
	// Phone number used for pending 2FA verification after initiating login/register
	pendingPhone?: string | null;
	setPendingPhone?: React.Dispatch<React.SetStateAction<string | null>>;

	// Which 2FA method is expected for the current pending verification
	// 'sms' = SMS OTP, 'totp' = authenticator app code
	pending2FAMethod?: 'sms' | 'totp' | null;
	setPending2FAMethod?: React.Dispatch<
		React.SetStateAction<'sms' | 'totp' | null>
	>;

	setPendingRegistration?: React.Dispatch<
		React.SetStateAction<{
			phone: string;
			password: string;
			fullName?: string;
			email?: string;
		} | null>
	>;
	setPending2FASetup?: React.Dispatch<
		React.SetStateAction<{
			qr?: string | null;
			qr_base64?: string | null;
			secret?: string | null;
			setup_token?: string | null;
			phone?: string | null;
			user?: any;
		} | null>
	>;
	online: boolean;
	router: RouterType;
	// Global app message (shown in Toast)
	appMessage?: {
		type: 'error' | 'message';
		message: string | null;
		actionLabel?: string | null;
		action?: (() => Promise<void>) | (() => void);
	} | null;
	setAppMessage: React.Dispatch<
		React.SetStateAction<{
			type: 'error' | 'message';
			message: string | null;
			actionLabel?: string | null;
			action?: (() => Promise<void>) | (() => void);
		} | null>
	>;

	retryRefresh?: () => Promise<boolean>;
	refreshDashboard?: (force?: boolean) => Promise<boolean>;
	lastDashboardUpdated?: number | null;
	verifyingAuth?: boolean;
}

const GeneralContext = createContext<AuthContextType | undefined>(undefined);

const HISTORY_KEY = 'BIM_history_v1';
const MAX_HISTORY = 5;

// Cross-platform runtime global for React Native (no browser `window` fallback)
// Use `globalThis` when available, otherwise `global` (Node-like runtimes).
const runtime: any =
	typeof globalThis !== 'undefined'
		? globalThis
		: typeof global !== 'undefined'
		? global
		: {};

export const GeneralProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const router = useRouter();
	const netInfo = useNetInfo();
	const totalMemory = (DeviceInfo as any)?.totalMemory;

	// Used to suppress history updates while we are programmatically navigating back
	const navigatingBackRef = React.useRef(false);
	const isLoggingOutRef = React.useRef(false);

	const [user, setUser] = useState<UserProps | null>(null);
	// Keep an in-memory copy of the auth token for fast checks and guards
	const [authToken, setAuthToken] = useState<string | null>(null);
	const [notifications, setNotifications] = useState<notifications[]>([]);
	const [pendingPhone, setPendingPhone] = useState<string | null>(null);
	// Which 2FA method is expected for the current pending verification
	// 'sms' = SMS OTP, 'totp' = authenticator app code
	const [pending2FAMethod, setPending2FAMethod] = useState<
		'sms' | 'totp' | null
	>(null);
	// Pending registration payload kept until OTP verification completes
	const [pendingRegistration, setPendingRegistration] = useState<{
		phone: string;
		password: string;
		fullName?: string;
		email?: string;
	} | null>(null);
	// pending 2FA setup information returned by backend after verify when TOTP setup required
	const [pending2FASetup, setPending2FASetup] = useState<{
		qr?: string | null;
		qr_base64?: string | null;
		secret?: string | null;
		setup_token?: string | null;
		phone?: string | null;
		user?: any;
	} | null>(null);
	// global message state shown as toast/modal; can include an optional action
	const [appMessage, setAppMessage] = useState<{
		type: 'error' | 'message';
		message: string | null;
		actionLabel?: string | null;
		action?: (() => Promise<void>) | (() => void);
	} | null>(null);
	const [language, setLanguage] = useState<langCode>('en');
	// Local typed alias for current language translations to avoid TS indexing errors
	// Memoize so it's stable for hook dependency arrays.
	const tr = useMemo(
		() => (translations as any)[language] ?? translations.en,
		[language]
	);
	const [online, setOnline] = useState<boolean>(true);
	const [selectedOption, setSelectedOption] = useState<
		headerOptions | undefined
	>(undefined);
	const [mounted, setMounted] = useState<boolean>(false);
	// Keep loader visible until we've checked SecureStore for an existing token
	const [verifyingAuth, setVerifyingAuth] = useState<boolean>(true);
	// Timestamp (ms since epoch) when the dashboard was last updated from server
	const [lastDashboardUpdated, setLastDashboardUpdated] = useState<
		number | null
	>(null);
	// Flag to indicate we've finished the initial token load from SecureStore
	const [initialTokenChecked, setInitialTokenChecked] =
		useState<boolean>(false);
	const loaderFadeAnimRef = React.useRef(new Animated.Value(0));
	const [isAnimatable, setIsAnimatable] = useState<boolean>(false);
	const [isHighEndDevice, setIsHighEndDevice] = useState<boolean>(false);
	const [keyboardVisible, setKeyboardVisible] = useState<boolean>(false);

	const [history, setHistory] = useState<string[]>([]);

	// Animate loader fade when verifyingAuth changes so overlay is actually visible
	useEffect(() => {
		try {
			Animated.timing(loaderFadeAnimRef.current, {
				toValue: verifyingAuth ? 1 : 0,
				duration: 220,
				useNativeDriver: true,
			}).start();
		} catch {}
	}, [verifyingAuth]);

	// Determine whether to enable detailed auth lifecycle debug. Sources:
	// - build-time env: `process.env.BIM_AUTH_DEBUG` === 'true'
	// Optional TTL (minutes) can be provided via `process.env.BIM_AUTH_DEBUG_TTL_MIN`
	// is deterministic across the session.
	const _envDebug =
		typeof process !== 'undefined' && process.env?.BIM_AUTH_DEBUG === 'true';
	const _envTtlMin =
		typeof process !== 'undefined' && process.env?.BIM_AUTH_DEBUG_TTL_MIN
			? Number(process.env.BIM_AUTH_DEBUG_TTL_MIN)
			: 0;
	const _winDebug = Boolean(runtime && runtime.__BIM_AUTH_DEBUG__);
	const _winTtlMin = runtime
		? Number(runtime.__BIM_AUTH_DEBUG_TTL_MIN__ ?? 0)
		: 0;

	if (runtime && (_envDebug || _winDebug)) {
		// record when debugging was first enabled in this session so TTL is stable
		if (!runtime.__BIM_AUTH_DEBUG_ENABLED_AT__) {
			runtime.__BIM_AUTH_DEBUG_ENABLED_AT__ = Date.now();
		}
	}

	const _enabledAt = runtime ? runtime.__BIM_AUTH_DEBUG_ENABLED_AT__ : 0;
	const _ttlMin = _winTtlMin || _envTtlMin || 0;
	const _ttlMs = _ttlMin > 0 ? _ttlMin * 60 * 1000 : 0;

	const authDebug = Boolean(
		(_envDebug || _winDebug) &&
			(!_ttlMs || Date.now() - (_enabledAt || 0) < _ttlMs)
	);

	// Load persisted history from AsyncStorage on mount (React Native compatible)
	useEffect(() => {
		(async () => {
			try {
				const raw = await AsyncStorage.getItem(HISTORY_KEY);
				if (raw) {
					const parsed = JSON.parse(raw);
					if (Array.isArray(parsed)) setHistory(parsed as string[]);
				}
			} catch {
				// ignore
			}
		})();
	}, []);

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

	// Logout handler: revoke token (if present), clear storage and app state,
	// then redirect to the login screen.
	// Logout handler: revoke token (if present), clear storage and app state,
	// then redirect to the login screen.
	const handleLogout = React.useCallback(async () => {
		// Prevent multiple simultaneous logout calls
		if (isLoggingOutRef.current) {
			console.log('Logout already in progress, ignoring duplicate call');
			return;
		}
		
		isLoggingOutRef.current = true;
		
		try {
			// 1. Attempt backend logout (best effort)
			try {
				const token = await SecureStore.getItemAsync('auth_token');
				if (token) {
					// We don't await the result or check success/failure for UI purposes
					// The user wants to be logged out regardless of server status.
					await AuthService.logout(String(token)).catch(() => {});
				}
			} catch {
				// Ignore token lookup errors
			}

			// 2. Perform local cleanup (Critical)
			let localCleanupSuccess = true;
			try {
				// Clear credentials
				await SecureStore.deleteItemAsync('auth_token');
				await SecureStore.deleteItemAsync('totp_secret');
				
				// Clear user data
				await AsyncStorage.removeItem('user_id');
				await AsyncStorage.removeItem('user_email');
				await AsyncStorage.removeItem('user_phone');
				
				// Reset state
				setUser(null);
				setNotifications([]);
				setPendingRegistration?.(null);
				setPending2FASetup?.(null);
				setPendingPhone?.(null);
				setPending2FAMethod?.(null);
			} catch (e) {
				console.error('logout: local cleanup failed', e);
				localCleanupSuccess = false;
			}

			// 3. UI Feedback & Navigation
			if (localCleanupSuccess) {
				setAppMessage?.({
					type: 'message',
					message: tr.categories.auth['logoutSuccess'] || 'Logged out',
				});
				router.replace('/(auth)/login');
			} else {
				setAppMessage?.({
					type: 'error',
					message: 'Failed to clear local session. Please try again.',
				});
			}
		} finally {
			isLoggingOutRef.current = false;
		}
	}, [tr, router]);

	// Attempt a single token refresh on demand. Returns the new token on success, or null.
	const attemptRefresh = React.useCallback(async (): Promise<string | null> => {
		if (!authToken) return null;
		try {
			const tokenVal = String(authToken);
			if (authDebug)
				console.debug(
					'attemptRefresh: calling refresh endpoint, token prefix=',
					tokenVal?.slice?.(0, 8)
				);
			const refreshRes = await AuthService.refreshToken(tokenVal);
			if (authDebug)
				console.debug(
					'attemptRefresh: refresh response',
					refreshRes && refreshRes.status,
					'ok=',
					refreshRes && refreshRes.ok
				);
			if (!refreshRes || !refreshRes.ok) return null;
			const refJson = await refreshRes.json().catch(() => null);
			if (refJson && (refJson as any).token) {
				const newToken = String((refJson as any).token);
				try {
					await SecureStore.setItemAsync(
						'auth_token',
						newToken
					);
				} catch {}
				setAuthToken(newToken);
				
				if (refJson && (refJson as any).user) {
					setUser((refJson as any).user as any);
				}
				return newToken;
			}
			return null;
		} catch (e) {
			if (authDebug) console.error('attemptRefresh: error', e);
			return null;
		}
	}, [authToken, authDebug]);

	// Register API interceptor callbacks
	useEffect(() => {
		registerAuthCallbacks({
			onRefreshToken: attemptRefresh,
			onLogout: handleLogout,
		});
	}, [attemptRefresh, handleLogout]);

	// When an auth token is present in memory, verify it with the backend. If
	// the token is invalid, perform a logout to clear local state. If the
	// verify response includes an expiry timestamp, schedule an automatic
	// logout when the token expires.
	useEffect(() => {
		let expiryTimer: ReturnType<typeof setTimeout> | null = null;
		let canceled = false;
		const verifyAndSchedule = async () => {
			if (!initialTokenChecked) {
				if (authDebug)
					console.debug('verifyAndSchedule: waiting for initial token load');
				return;
			}
			if (authDebug)
				console.debug('verifyAndSchedule: starting; authToken=', authToken);
			setVerifyingAuth(true);
			try {
				if (!authToken) {
					if (expiryTimer) {
						clearTimeout(expiryTimer);
						expiryTimer = null;
					}
					return;
				}

				const res = await AuthService.verifyToken(String(authToken));
				if (authDebug)
					console.debug(
						'verifyAndSchedule: verify response',
						res && res.status,
						'ok=',
						res && res.ok
					);
				if (!res || !res.ok) {
					if (authDebug)
						console.debug(
							'verifyAndSchedule: verify failed, calling handleLogout'
						);
					await handleLogout();
					return;
				}

				const json = await res.json().catch(() => null);
				if (authDebug) console.debug('verifyAndSchedule: verify json', json);
				if (!json) return;

				// Merge returned user object into state when present
				if (json && (json as any).user) {
					setUser((json as any).user as any);
					try {
						const anyRouter = router as any;
						const currentPath =
							anyRouter?.pathname ||
							anyRouter?.asPath ||
							anyRouter?.route ||
							'';
						if (
							!currentPath ||
							currentPath === '/' ||
							currentPath.startsWith('/(auth)')
						) {
							if (anyRouter?.replace) {
								try {
									anyRouter.replace('/(authenticated)/home');
								} catch {}
							} else if (anyRouter?.push) {
								try {
									anyRouter.push('/(authenticated)/home');
								} catch {}
							} else {
								let attempts = 0;
								const maxAttempts = 12;
								const tryNav = () => {
									const ar = router as any;
									if (ar?.replace) {
										try {
											ar.replace('/(authenticated)/home');
											return;
										} catch {}
									}
									if (ar?.push) {
										try {
											ar.push('/(authenticated)/home');
											return;
										} catch {}
									}
									attempts++;
									if (attempts < maxAttempts) setTimeout(tryNav, 100);
									else if (runtime && runtime.__BIM_HISTORY_DEBUG__)
										console.warn(
											'verifyAndSchedule: router not ready, aborting redirect to authenticated home'
										);
								};
								tryNav();
							}
						}
					} catch {}
				}

				// Support token expiry from either token_meta.expires_at or top-level expires_at
				const expiresAt =
					(json &&
						(json as any).token_meta &&
						(json as any).token_meta.expires_at) ||
					(json && (json as any).expires_at) ||
					null;
				if (expiresAt) {
					if (authDebug)
						console.debug('verifyAndSchedule: token expiresAt=', expiresAt);
					const expMs = Date.parse(String(expiresAt));
					if (!Number.isFinite(expMs)) return;
					const now = Date.now();
					const msUntilExpiry = expMs - now;
					if (authDebug)
						console.debug('verifyAndSchedule: msUntilExpiry=', msUntilExpiry);

					const REFRESH_BEFORE_MS = 30000; // try refresh 30s before expiry

					const scheduleRefresh = async (immediate = false) => {
						const doRefresh = async () => {
							const ok = await attemptRefresh();
							if (!ok) {
								setAppMessage({
									type: 'error',
									message:
										(tr && tr.categories?.auth?.sessionRefreshFailed) ||
										'Session refresh failed. Tap Retry to attempt refresh or log in again.',
									actionLabel: (tr && tr.categories?.buttons?.retry) || 'Retry',
									action: async () => {
										setAppMessage(null);
										const ok2 = await attemptRefresh();
										if (!ok2) {
											setAppMessage({
												type: 'error',
												message:
													(tr && tr.categories?.auth?.retryFailedPleaseLogin) ||
													'Retry failed — please log in again',
											});
										}
									},
								});
							}
						};

						if (immediate) {
							await doRefresh();
							return;
						}

						const msUntilRefresh = Math.max(
							0,
							msUntilExpiry - REFRESH_BEFORE_MS
						);
						if (authDebug)
							console.debug(
								'verifyAndSchedule: scheduling refresh in ms',
								msUntilRefresh
							);
						expiryTimer = setTimeout(async () => {
							if (canceled) return;
							try {
								if (authDebug)
									console.debug('verifyAndSchedule: scheduled refresh firing');
								await doRefresh();
							} catch (e) {
								console.error('scheduled token refresh failed', e);
							}
						}, msUntilRefresh);
					};

					if (msUntilExpiry <= 0) {
						if (authDebug)
							console.debug(
								'verifyAndSchedule: token already expired, attempting immediate refresh'
							);
						await scheduleRefresh(true);
						return;
					}

					await scheduleRefresh(false);
				}
			} catch (e) {
				console.error('token verification failed', e);
			} finally {
				setVerifyingAuth(false);
			}
		};

		verifyAndSchedule();

		return () => {
			canceled = true;
			if (expiryTimer) clearTimeout(expiryTimer);
		};
	}, [
		authToken,
		handleLogout,
		authDebug,
		attemptRefresh,
		tr,
		router,
		initialTokenChecked,
	]);

	// Load auth token from SecureStore on mount so guards can rely on it
	useEffect(() => {
		(async () => {
			try {
				const t = await SecureStore.getItemAsync('auth_token');
				if (t) {
					if (authDebug)
						console.debug(
							'GeneralContext: loaded auth_token from SecureStore',
							t
						);
					setAuthToken(String(t));
				} else {
					if (authDebug)
						console.debug('GeneralContext: no auth_token found in SecureStore');
				}
			} catch (e) {
				if (authDebug)
					console.debug('GeneralContext: SecureStore.getItemAsync error', e);
			} finally {
				// Mark that initial token load has completed so verification can proceed
				setInitialTokenChecked(true);
			}
		})();
	}, [authDebug]);

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
			const payload = JSON.stringify(arr);
			// AsyncStorage is used for React Native and web compatibility
			AsyncStorage.setItem(HISTORY_KEY, payload).catch((e) => {
				if (runtime?.__BIM_HISTORY_DEBUG__)
					console.debug('GeneralContext: persist failed', e);
			});
		} catch (e) {
			if (runtime?.__BIM_HISTORY_DEBUG__)
				console.debug('GeneralContext: persist failed', e);
		}
	};

	const handleUpdateHistory = useCallback((current: string) => {
		const debug = runtime?.__BIM_HISTORY_DEBUG__;
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
		if (runtime) {
			// Expose a debug helper that reads persisted history and logs it.
			(runtime as any).__BIM_DUMP_HISTORY__ = async () => {
				try {
					const raw = await AsyncStorage.getItem(HISTORY_KEY);
					const parsed = raw ? JSON.parse(raw) : history;
					console.log('BIM_HISTORY_DUMP', parsed);
				} catch (e) {
					console.log('BIM_HISTORY_DUMP error', e);
				}
			};
			return () => {
				try {
					delete (runtime as any).__BIM_DUMP_HISTORY__;
				} catch {}
			};
		}
	}, [history]);

	const navigateToPath = useCallback(
		(path: string) => {
			// router may not be ready at provider mount time. Retry briefly
			// until router methods are available before giving up.
			const tryNavigate = (attempt = 0) => {
				const maxAttempts = 12; // ~1.2s
				if ((router as any)?.replace) {
					try {
						(router.replace as any)(path);
						return;
					} catch {}
				}
				if ((router as any)?.push) {
					try {
						(router.push as any)(path);
						return;
					} catch {}
				}
				if (attempt < maxAttempts) {
					setTimeout(() => tryNavigate(attempt + 1), 100);
				} else if (runtime && runtime.__BIM_HISTORY_DEBUG__)
					console.warn(
						'navigateToPath: router not ready, aborting navigation to',
						path
					);
			};
			tryNavigate();
		},
		[router]
	);

	const handleGoBack = useCallback(() => {
		navigatingBackRef.current = true;
		const prev = historyRef.current || [];
		let action: () => void = () => {};

		if (runtime?.__BIM_HISTORY_DEBUG__)
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
			const normalizedNumber = normalizePhoneForApi(number);
			const res = await AuthService.login(normalizedNumber, password ?? '');
			if (!res.ok) {
				const text = await parseApiError(res);
				setAppMessage({
					type: 'error',
					message:
						String(text) && String(text).trim()
							? String(text)
							: tr.categories.auth['loginFailed'] || 'Login failed',
				});
				return;
			}
			const data = await res.json();

			// If the server returned pre-computed dashboard data (no TOTP required),
			// forward that payload into `user` so TransactionContext can pick it up.
			const hasDashboard = !!(
				data &&
				typeof data === 'object' &&
				(Array.isArray(data.recentTransactions) ||
					data.todayTransactions !== undefined ||
					Array.isArray(data.routerBalances) ||
					Array.isArray(data.chartData))
			);
			if (hasDashboard) {
				try {
				// Map server-provided dashboard fields into typed structures and coerce numeric strings to numbers
				const dashboard: DashboardSummary = {
					chartData: Array.isArray(data.chartData)
						? data.chartData.map((c: any) => ({
								date: String(c.date),
								total: parseAmount(c.total),
						  }))
						: undefined,
					monthTransactions: parseAmount(data.monthTransactions),
					monthUsers:
						typeof data.monthUsers !== 'undefined'
							? Number(data.monthUsers)
							: undefined,
					recentTransactions: Array.isArray(data.recentTransactions)
						? data.recentTransactions.map((t: any) => ({
								...t,
								amount: parseAmount(t.amount),
						  }))
						: undefined,
					routerBalances: Array.isArray(data.routerBalances)
						? data.routerBalances.map((r: any) => ({
								...r,
								balance: parseAmount(r.balance),
						  }))
						: undefined,
					todayTransactions: parseAmount(data.todayTransactions),
					todayUsers:
						typeof data.todayUsers !== 'undefined'
							? Number(data.todayUsers)
							: undefined,
					weekTransactions: parseAmount(data.weekTransactions),
					weekUsers:
						typeof data.weekUsers !== 'undefined'
							? Number(data.weekUsers)
							: undefined,
				};

				// Merge user info (if any) with typed dashboard payload so consumers can access both.
				const mergedUser = {
					...(data.user || {}),
					dashboard,
				};
				setUser(mergedUser as any);
				setLastDashboardUpdated(Date.now());

				// If server returned a token as part of the login payload, persist it
				if (data && data.token) {
					await SecureStore.setItemAsync('auth_token', String(data.token));
					setAuthToken(String(data.token));
				}
				return navigateToPath('/(authenticated)/home');
				} catch(e) {
					console.error('[GeneralContext] Error setting last dashboard updated:', e);
				}
			}

			// Determine which 2FA method the backend expects when redirecting to verify
			try {
				const msg = String(data?.message || '').toLowerCase();
				if (msg.includes('totp setup required')) {
					if (data && (data.qr || data.setup_token || data.qr_base64)) {
						setPending2FASetup({
							qr: data.qr ?? null,
							qr_base64: data.qr_base64 ?? null,
							secret: data.secret ?? null,
							setup_token: data.setup_token ?? null,
							phone: normalizePhoneForApi(data.phone ?? number),
							user: data.user ?? null,
						});
						// navigate to the authenticator setup screen
						return navigateToPath('/(auth)/setup-2fa');
					}
				} else {
					setPending2FAMethod('totp');
				}
			} catch(e) {
				console.error('[GeneralContext] Error determining 2FA method:', e);
				setPending2FAMethod(null);
			}
			// Store the pending phone so the verify screen can reference it if need
			setPendingPhone(data?.phone || number);
			// Navigate to verify screen for OTP entry
			router.replace('/(auth)/verify');
		} catch (error) {
			// Surface unexpected/network errors via the global app message instead of throwing
			const msg = (error && (error as any).message) || '';
			setAppMessage({
				type: 'error',
				message:
					String(msg) && String(msg).trim()
						? String(msg)
						: tr.categories.auth['loginFailed'] || 'Login failed',
			});
		}
	};

	// Shared helper that actually performs the dashboard fetch and merges
	// the result into `user.dashboard`. Returns true on success.
	const refreshDashboard = React.useCallback(
		async (force = false): Promise<boolean> => {
			if (!user || !authToken) return false;

			// If not forced, skip fetching when dashboard-like data already exists
			if (!force) {
				try {
					const existing = (user as any).dashboard;
					if (
						existing &&
						typeof existing === 'object' &&
						(Array.isArray((existing as any).recentTransactions) ||
							(existing as any).todayTransactions !== undefined ||
							Array.isArray((existing as any).routerBalances) ||
							Array.isArray((existing as any).chartData))
					) {
						return false;
					}
				} catch {
					// fallthrough
				}
			}

			try {
				const resp = await fetchDashboard(String(authToken));
				try {
					const json = await (resp as any).json?.();
					if (json !== undefined) {
						const hasDashboard = !!(
							json &&
							typeof json === 'object' &&
							(Array.isArray((json as any).recentTransactions) ||
								(json as any).todayTransactions !== undefined ||
								Array.isArray((json as any).routerBalances) ||
								Array.isArray((json as any).chartData))
						);
						if (hasDashboard) {
							setUser((prev) => {
								try {
									const base = prev && typeof prev === 'object' ? prev : {};
									const out = { ...base, dashboard: json } as any;
									try {
										setLastDashboardUpdated(Date.now());
									} catch {}
									return out;
								} catch {
									return prev;
								}
							});
							return true;
						}
					}
				} catch (e) {
					console.debug('[GeneralContext] refreshDashboard parse failed:', e);
				}
				return false;
			} catch (e) {
				console.warn('[GeneralContext] refreshDashboard failed:', e);
				return false;
			}
		},
		[authToken, user]
	);

	// Initial fetch when we become authenticated — do not re-run on unrelated
	// `user` object changes. The helper will avoid duplicate fetching.
	useEffect(() => {
		if (!user?.id || !authToken) return;
		void refreshDashboard(false);
	}, [authToken, user?.id, refreshDashboard]);

	// Auto-refresh dashboard every 2 minutes while authenticated.
	useEffect(() => {
		if (!user?.id || !authToken) return undefined;
		const INTERVAL_MS = 2 * 60 * 1000; // 2 minutes
		const id = setInterval(() => {
			void refreshDashboard(true);
		}, INTERVAL_MS);
		return () => clearInterval(id);
	}, [authToken, user?.id, refreshDashboard]);

	const handleRegistration = async ({
		phone,
		password,
		name,
		email,
	}: {
		phone: string;
		password: string;
		name?: string;
		email?: string;
	}) => {
		try {
			const res = await AuthService.register({
				phone: normalizePhoneForApi(phone),
				password: password || '',
				name: name || undefined,
				email: email || undefined,
			});
			if (!res.ok) {
				const text = await parseApiError(res);
				console.info('Registration error response:', text);
				setAppMessage({
					type: 'error',
					message:
						String(text) && String(text).trim()
							? String(text)
							: tr.categories.auth['registrationFailed'] ||
							  'Registration failed',
				});
				return;
			}
			const data = await res.json();
			console.info('Registration response data:', data);
			setPendingPhone(data?.phone || phone);
			setPendingRegistration({ phone, password, fullName: name, email });
			router.replace('/(auth)/verify');
		} catch (error: any) {
			console.info('Registration error:', error?.message);
			const msg = (error && (error as any).message) || '';
			setAppMessage({
				type: 'error',
				message:
					String(msg) && String(msg).trim()
						? String(msg)
						: tr.categories.auth['registrationFailed'] || 'Registration failed',
			});
		}
	};

	const handleVerify = async (otp: string) => {
		// Determine OTP to send. In development, backend expects a fixed DEV_OTP; otherwise use the
		// code passed in.
		const otpToSend =
			typeof DEV_OTP !== 'undefined' && DEV_OTP ? String(DEV_OTP) : otp;

		const payload = {
			name: pendingRegistration?.fullName || pendingRegistration?.phone || '',
			email: pendingRegistration?.email || '',
			phone: pendingRegistration?.phone || pendingPhone || '',
			password: pendingRegistration?.password || '',
			otp: otpToSend,
		};

		// Normalize phone before sending to backend
		payload.phone = normalizePhoneForApi(payload.phone);

		try {
			const res = await AuthService.verifyOtp(payload);
			if (!res.ok) {
				const text = await parseApiError(res);
				setAppMessage({
					type: 'error',
					message:
						String(text) && String(text).trim()
							? String(text)
							: tr.categories.auth['otpVerificationFailed'] ||
							  'OTP verification failed',
				});
				return;
			}
			const resJson = await res.json();
			// If backend requests TOTP setup, store the setup payload and navigate to the setup screen
			if (resJson && (resJson.qr || resJson.setup_token || resJson.qr_base64)) {
				setPending2FASetup({
					qr: resJson.qr ?? null,
					qr_base64: resJson.qr_base64 ?? null,
					secret: resJson.secret ?? null,
					setup_token: resJson.setup_token ?? null,
					phone: resJson.phone ?? payload.phone,
					user: resJson.user ?? null,
				});
				// navigate to the authenticator setup screen
				navigateToPath('/(auth)/setup-2fa');
				return;
			}
			// Success - clear pending state and navigate to home
			setPendingRegistration?.(null);
			setPendingPhone?.(null);
			setPending2FAMethod?.(null);
			router.push('/(authenticated)/home');
		} catch (err: any) {
			const msg = (err && err.message) || '';
			setAppMessage({
				type: 'error',
				message:
					String(msg) && String(msg).trim()
						? String(msg)
						: tr.categories.auth['otpVerificationFailed'] ||
						  'OTP verification failed',
			});
		}
	};

	const handleVerify2FA = async (otp: string) => {
		if (!pending2FASetup?.phone && !pendingPhone) {
			setAppMessage({
				type: 'error',
				message:
					tr.categories.auth['setupAuthenticator.missingPhone'] ??
					'Missing phone for 2FA verification',
			});
			return false;
		}
		if (!otp || String(otp).trim().length === 0) {
			setAppMessage({
				type: 'error',
				message:
					tr.categories.auth['setupAuthenticator.enterCodeError'] ??
					'Enter the code from your authenticator app',
			});
			return false;
		}
		try {
			const res = await AuthService.verify2fa(
				normalizePhoneForApi(String(pending2FASetup?.phone ?? pendingPhone)),
				String(otp).trim()
			);
			if (!res.ok) {
				const text = await parseApiError(res);
				setAppMessage({
					type: 'error',
					message:
						String(text) && String(text).trim()
							? String(text)
							: tr.categories.auth['setupAuthenticator.verifyFailed'] ||
							  '2FA verification failed',
				});
				return false;
			}
			const resJson = await res.json();
			console.info('2FA verification response data:', resJson);
			// If server returned token/user/dashboard, persist and merge into app state
			try {
				if (resJson && (resJson as any).token) {
					await SecureStore.setItemAsync(
						'auth_token',
						String((resJson as any).token)
					);
					setAuthToken(String((resJson as any).token));
				}
				if (resJson && (resJson as any).user) {
					const u = (resJson as any).user;
					if (u.id !== undefined) {
						await AsyncStorage.setItem('user_id', String(u.id));
					}
					if (u.email)
						await AsyncStorage.setItem('user_email', String(u.email));
					if (u.phone)
						await AsyncStorage.setItem('user_phone', String(u.phone));
					if (u.totp_secret) {
						await SecureStore.setItemAsync(
							'totp_secret',
							String(u.totp_secret)
						);
					}
					setUser(u as any);
				}
				// If server provided dashboard-like fields at top-level, merge into user
				if (
					resJson &&
					typeof resJson === 'object' &&
					(Array.isArray((resJson as any).recentTransactions) ||
						(resJson as any).todayTransactions !== undefined ||
						Array.isArray((resJson as any).routerBalances) ||
						Array.isArray((resJson as any).chartData))
				) {
					const mergedUser = {
						...((resJson as any).user || {}),
						...(resJson as any),
					};
					setUser(mergedUser as any);
					try {
						setLastDashboardUpdated(Date.now());
					} catch {}
				}
				// Show success toast if backend provided a message
				try {
					const successMessage =
						(resJson && (resJson as any).message) ||
						tr.categories.auth['setupAuthenticator.loginSuccess'] ||
						'Login successful';
					setAppMessage?.({ type: 'message', message: String(successMessage) });
				} catch {}
			} catch (e) {
				console.error('handleVerify2FA: error persisting auth state', e);
			}
			// success — clear pending setup and navigate to home
			setPending2FASetup?.(null);
			setPending2FAMethod?.(null);
			router.replace('/(authenticated)/home');
			return true;
		} catch (err: any) {
			setAppMessage({
				type: 'error',
				message:
					(err?.message as string) ||
					tr.categories.auth['setupAuthenticator.verifyFailed'] ||
					'2FA verification failed',
			});
			return false;
		}
	};

	const handleSetupTotp = async (params?: {
		setup_token?: string;
		secret?: string;
		otp?: string;
	}) => {
		const setup_token = params?.setup_token ?? pending2FASetup?.setup_token;
		const secret = params?.secret ?? pending2FASetup?.secret;
		const otp = params?.otp ?? '';

		if (!setup_token) {
			setAppMessage?.({
				type: 'error',
				message:
					tr.categories.auth['setupAuthenticator.missingSetupToken'] ??
					'Missing setup token for TOTP setup',
			});
			return null;
		}
		if (!secret) {
			setAppMessage?.({
				type: 'error',
				message:
					tr.categories.auth['setupAuthenticator.missingSecret'] ??
					'Missing secret for TOTP setup',
			});
			return null;
		}
		if (!otp || String(otp).trim().length === 0) {
			setAppMessage?.({
				type: 'error',
				message:
					tr.categories.auth['setupAuthenticator.enterCodeError'] ??
					'Enter the code from your authenticator app',
			});
			return null;
		}
		try {
			const res = await AuthService.setupTotp({
				setup_token,
				secret,
				otp: String(otp).trim(),
			});
			if (!res.ok) {
				const text = await parseApiError(res);
				setAppMessage?.({
					type: 'error',
					message:
						String(text) && String(text).trim()
							? String(text)
							: tr.categories.auth['setupAuthenticator.setupFailed'] ||
							  'TOTP setup failed',
				});
				return null;
			}
			const json = await (res.ok ? res.json() : null);

			try {
				// Persist token and selected user fields to AsyncStorage if present
				if (json && json.token) {
					// Store token securely
					await SecureStore.setItemAsync('auth_token', String(json.token));
					setAuthToken(String(json.token));
				}
				if (json && json.user) {
					const user = json.user;
					if (user.id !== undefined) {
						await AsyncStorage.setItem('user_id', String(user.id));
					}
					if (user.email) {
						await AsyncStorage.setItem('user_email', String(user.email));
					}
					if (user.phone) {
						await AsyncStorage.setItem('user_phone', String(user.phone));
					}
					if (user.totp_secret) {
						// Store TOTP secret securely
						await SecureStore.setItemAsync(
							'totp_secret',
							String(user.totp_secret)
						);
					}
					setUser(user as any);
				}
				// Show success toast if backend provided a message, then navigate
				try {
					const successMessage =
						(json && (json as any).message) ||
						tr.categories.auth['setupAuthenticator.setupSuccess'] ||
						'Two-factor authentication enabled.';
					setAppMessage?.({ type: 'message', message: String(successMessage) });
				} catch {
					// ignore
				}

				// Clear pending setup and navigate into authenticated area
				setPending2FASetup?.(null);
				setPending2FAMethod?.(null);
				router.replace('/(authenticated)/home');
			} catch (e) {
				console.error('handleSetupTotp: error persisting auth state', e);
			}

			return { json };
		} catch (err: any) {
			setAppMessage?.({
				type: 'error',
				message:
					(err?.message as string) ||
					tr.categories.auth['setupAuthenticator.setupFailed'] ||
					'TOTP setup failed',
			});
			return null;
		}
	};

	const fetchNotifications = async () => {
		const fetched: notifications[] = [];
		setNotifications(fetched);
	};

	const retryRefreshWrapper = useCallback(async () => {
		const res = await attemptRefresh();
		return !!res;
	}, [attemptRefresh]);

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
				handleRegistration,
				handleVerify,
				handleVerify2FA,
				handleSetupTotp,
				pending2FAMethod,
				setPending2FAMethod,
				pendingPhone,
				setPendingPhone,
				online,
				appMessage,
				setAppMessage,
				pendingRegistration,
				setPendingRegistration,
				pending2FASetup,
				setPending2FASetup,
				authToken,
				setAuthToken,
				retryRefresh: retryRefreshWrapper,
				verifyingAuth,
				lastDashboardUpdated,
			}}
		>
			{children}
			{/* Global loader shown while auth token is being verified */}
			<Loader
				showOverlay={verifyingAuth}
				fadeAnim={loaderFadeAnimRef.current}
				toggleShowOverlay={() => setVerifyingAuth(false)}
			/>
			{/* Global toast for app messages/errors */}
			<Toast
				visible={!!appMessage}
				type={appMessage?.type ?? 'message'}
				message={appMessage?.message ?? ''}
				onDismiss={() => setAppMessage(null)}
				onAction={() => {
					if (appMessage && appMessage.action) {
						// fire-and-forget the action; it will update app state/message as needed
						try {
							void appMessage.action();
						} catch {}
					} else {
						setAppMessage(null);
					}
				}}
				actionLabel={appMessage?.actionLabel ?? undefined}
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
	if (runtime) (runtime as any).__BIM_HISTORY_DEBUG__ = true;
}

export function disableHistoryDebug() {
	if (runtime) (runtime as any).__BIM_HISTORY_DEBUG__ = false;
}
