import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	Animated,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	useAnimatedValue,
} from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import Prompt from '@/components/Prompt';
import { SegmentedTabs, SegmentedTab } from '@/components/SegmentedTabs';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import TileContainer from '@/components/TileContainer';
import { fontSize, fontWeight } from '@/constants/Font';
import translations from '@/constants/Trans';
import { useGeneral } from '@/context/GeneralContext';
import { useTransaction } from '@/context/TransactionContext';
import { parseApiError } from '@/helpers/api';
import { formatAmount } from '@/helpers/index';
import { useThemeColor } from '@/hooks/useThemeColor';
import useTrackHistory from '@/hooks/useTrackHistory';
import * as PackageService from '@/services/PackageService';
import {
	ApiRouter,
	PortalPackage,
	SharedRadiusProfile,
	TrialSettings,
} from '@/types';
import PackageForm, {
	PackageFormValues,
} from '@/views/PackageForm';
import PackageRoutersCard from '@/views/PackageRoutersCard';
import RadiusProfileForm, {
	RadiusProfileFormValues,
} from '@/views/RadiusProfileForm';
import TrialSettingsRow from '@/views/TrialSettingsRow';

type TabKey = 'packages' | 'routers' | 'profiles' | 'trial';

function isTruthy(value: unknown) {
	return value === true || value === 'true' || value === 1 || value === '1';
}

function visibleRouterCount(pkg: PortalPackage) {
	return (pkg.routers ?? []).filter((router) => router.visible).length;
}

function profileDuration(profile: SharedRadiusProfile) {
	if (profile.duration) return profile.duration;
	const seconds = Number(profile.duration_seconds ?? 0);
	if (!Number.isFinite(seconds) || seconds <= 0) return '—';
	if (seconds % 86400 === 0) return `${seconds / 86400}d`;
	if (seconds % 3600 === 0) return `${seconds / 3600}h`;
	return `${Math.round(seconds / 60)}m`;
}

export default function PackagesScreen() {
	useTrackHistory('/(authenticated)/packages');
	const router = useRouter();
	const { language, authToken, user, setAppMessage } = useGeneral();
	const { routers, fetchRouters } = useTransaction();

	const bg = useThemeColor({}, 'background');
	const textColor = useThemeColor({}, 'text');
	const mutedText = useThemeColor({}, 'mutedText');
	const border = useThemeColor({}, 'borderDark');
	const chipBg = useThemeColor({}, 'listItemBackground');
	const selectedBg = useThemeColor({}, 'bim');
	const selectedText = useThemeColor({}, 'authButtonText');
	const errorColor = useThemeColor({}, 'error');

	const isAdmin = isTruthy(user?.platform?.is_admin);
	const isStaff = isTruthy(user?.platform?.is_staff);
	const canManageProfiles = isAdmin || isStaff;

	const enPackages = translations.en.categories.packages;
	const packagesCopy = (translations[language]?.categories?.packages ??
		enPackages) as Record<string, string>;
	const buttonsCopy =
		translations[language]?.categories?.buttons ??
		translations.en.categories.buttons;
	const t = useCallback(
		(key: string, fallback = '') =>
			packagesCopy[key] ?? enPackages[key] ?? fallback,
		[packagesCopy, enPackages]
	);

	const tabs = useMemo<SegmentedTab[]>(
		() => [
			{
				key: 'packages',
				label: t('tabPackages', 'Packages'),
				icon: 'packages',
			},
			{
				key: 'routers',
				label: t('tabRoutersRateLimits', 'Routers & rate limits'),
				icon: 'routers.outline',
			},
			{
				key: 'profiles',
				label: t('tabRadiusProfiles', 'RADIUS profiles'),
				icon: 'key',
			},
			{
				key: 'trial',
				label: t('tabFreeTrial', 'Free trial'),
				icon: 'clock',
			},
		],
		[t]
	);

	const [activeTab, setActiveTab] = useState<TabKey>('packages');
	const [portalPackages, setPortalPackages] = useState<PortalPackage[]>([]);
	const [profiles, setProfiles] = useState<SharedRadiusProfile[]>([]);
	const [profilesError, setProfilesError] = useState<string | null>(null);
	const [loadingPackages, setLoadingPackages] = useState(false);
	const [loadingProfiles, setLoadingProfiles] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [savingKey, setSavingKey] = useState<string | null>(null);
	const [selectedPackageId, setSelectedPackageId] = useState<string>();

	const [trialSettings, setTrialSettings] = useState<
		Record<string, TrialSettings | null | undefined>
	>({});
	const [loadingTrials, setLoadingTrials] = useState(false);
	const [trialVersion, setTrialVersion] = useState(0);
	const trialLoadedRef = useRef<Set<string>>(new Set());

	const packageFormAnim = useAnimatedValue(0);
	const profileFormAnim = useAnimatedValue(0);
	const confirmAnim = useAnimatedValue(0);

	const [showPackageForm, setShowPackageForm] = useState(false);
	const [packageFormMode, setPackageFormMode] = useState<'create' | 'edit'>(
		'create'
	);
	const [editingPackage, setEditingPackage] = useState<PortalPackage | null>(
		null
	);

	const [showProfileForm, setShowProfileForm] = useState(false);
	const [profileFormMode, setProfileFormMode] = useState<'create' | 'edit'>(
		'create'
	);
	const [editingProfile, setEditingProfile] =
		useState<SharedRadiusProfile | null>(null);

	const [showConfirm, setShowConfirm] = useState(false);
	const [confirmTarget, setConfirmTarget] = useState<{
		type: 'package' | 'profile';
		id: string;
		title: string;
		message: string;
	} | null>(null);

	const showError = useCallback(
		async (response: Response | null | undefined, fallback: string) => {
			let message = fallback;
			if (response) {
				try {
					const parsed = await parseApiError(response);
					if (parsed) message = parsed;
				} catch {
					// keep the fallback
				}
			}
			setAppMessage?.({ type: 'error', message });
		},
		[setAppMessage]
	);

	const loadPackages = useCallback(
		async (showSpinner = true) => {
			if (!authToken) return;
			if (showSpinner) setLoadingPackages(true);
			try {
				const response = await PackageService.fetchPortalPackages(authToken, {
					per_page: 100,
					scope: isAdmin ? 'all' : 'visible',
				});
				if (!response.ok) {
					await showError(response, 'Could not load portal packages.');
					return;
				}
				const json = await response.json();
				setPortalPackages(Array.isArray(json?.packages) ? json.packages : []);
			} catch (error) {
				console.error('[PackagesScreen] loadPackages failed', error);
				setAppMessage?.({
					type: 'error',
					message: 'Could not load portal packages.',
				});
			} finally {
				if (showSpinner) setLoadingPackages(false);
			}
		},
		[authToken, isAdmin, setAppMessage, showError]
	);

	const loadProfiles = useCallback(
		async (showSpinner = true) => {
			if (!authToken) return;
			if (showSpinner) setLoadingProfiles(true);
			try {
				const response = await PackageService.fetchSharedProfiles(authToken, {
					per_page: 100,
				});
				if (!response.ok) {
					setProfilesError(
						response.status === 403
							? 'RADIUS profiles require admin or staff access.'
							: 'Could not load RADIUS profiles.'
					);
					return;
				}
				const json = await response.json();
				setProfiles(Array.isArray(json?.profiles) ? json.profiles : []);
				setProfilesError(null);
			} catch (error) {
				console.error('[PackagesScreen] loadProfiles failed', error);
				setProfilesError('Could not load RADIUS profiles.');
			} finally {
				if (showSpinner) setLoadingProfiles(false);
			}
		},
		[authToken]
	);

	useEffect(() => {
		void loadPackages();
		void loadProfiles();
	}, [loadPackages, loadProfiles]);

	useEffect(() => {
		if (authToken && !routers) {
			void fetchRouters();
		}
	}, [authToken, routers, fetchRouters]);

	const handleRefresh = useCallback(async () => {
		setRefreshing(true);
		try {
			await Promise.all([loadPackages(false), loadProfiles(false)]);
			await fetchRouters();
			trialLoadedRef.current.clear();
			setTrialSettings({});
			setTrialVersion((version) => version + 1);
		} finally {
			setRefreshing(false);
		}
	}, [fetchRouters, loadPackages, loadProfiles]);

	useEffect(() => {
		if (activeTab !== 'trial' || !authToken || !routers?.length) return;
		const missing = routers.filter(
			(router) => !trialLoadedRef.current.has(router.id)
		);
		if (missing.length === 0) {
			setLoadingTrials(false);
			return;
		}
		missing.forEach((router) => trialLoadedRef.current.add(router.id));
		let cancelled = false;
		setLoadingTrials(true);

		void (async () => {
			await Promise.all(
				missing.map(async (router) => {
					try {
						const response = await PackageService.fetchTrialSettings(
							router.id,
							authToken
						);
						if (!response.ok) throw new Error('trial settings unavailable');
						const json = await response.json();
						if (!cancelled) {
							setTrialSettings((prev) => ({
								...prev,
								[router.id]: json?.trial_settings ?? null,
							}));
						}
					} catch {
						if (!cancelled) {
							setTrialSettings((prev) => ({ ...prev, [router.id]: null }));
						}
					}
				})
			);
			if (!cancelled) setLoadingTrials(false);
		})();

		return () => {
			cancelled = true;
		};
	}, [activeTab, authToken, routers, trialVersion]);

	const selectedPackage = useMemo(
		() =>
			portalPackages.find((pkg) => pkg.id === selectedPackageId) ??
			portalPackages[0],
		[portalPackages, selectedPackageId]
	);

	useEffect(() => {
		if (portalPackages.length === 0) {
			if (selectedPackageId) setSelectedPackageId(undefined);
			return;
		}
		if (
			!selectedPackageId ||
			!portalPackages.some((pkg) => pkg.id === selectedPackageId)
		) {
			setSelectedPackageId(portalPackages[0].id);
		}
	}, [portalPackages, selectedPackageId]);

	const togglePackageForm = (show?: boolean) => {
		const target = show ?? showPackageForm;
		if (target) {
			setShowPackageForm(true);
			Animated.timing(packageFormAnim, {
				toValue: 1,
				duration: 250,
				useNativeDriver: true,
			}).start();
		} else {
			Animated.timing(packageFormAnim, {
				toValue: 0,
				duration: 200,
				useNativeDriver: true,
			}).start(() => {
				setShowPackageForm(false);
				setEditingPackage(null);
			});
		}
	};

	const toggleProfileForm = (show?: boolean) => {
		const target = show ?? showProfileForm;
		if (target) {
			setShowProfileForm(true);
			Animated.timing(profileFormAnim, {
				toValue: 1,
				duration: 250,
				useNativeDriver: true,
			}).start();
		} else {
			Animated.timing(profileFormAnim, {
				toValue: 0,
				duration: 200,
				useNativeDriver: true,
			}).start(() => {
				setShowProfileForm(false);
				setEditingProfile(null);
			});
		}
	};

	const toggleConfirm = (show?: boolean) => {
		const target = show ?? showConfirm;
		if (target) {
			setShowConfirm(true);
			Animated.timing(confirmAnim, {
				toValue: 1,
				duration: 200,
				useNativeDriver: true,
			}).start();
		} else {
			Animated.timing(confirmAnim, {
				toValue: 0,
				duration: 180,
				useNativeDriver: true,
			}).start(() => {
				setShowConfirm(false);
				setConfirmTarget(null);
			});
		}
	};

	const openCreatePackage = () => {
		setPackageFormMode('create');
		setEditingPackage(null);
		togglePackageForm(true);
	};

	const openEditPackage = (pkg: PortalPackage) => {
		setPackageFormMode('edit');
		setEditingPackage(pkg);
		togglePackageForm(true);
	};

	const openCreateProfile = () => {
		setProfileFormMode('create');
		setEditingProfile(null);
		toggleProfileForm(true);
	};

	const openEditProfile = (profile: SharedRadiusProfile) => {
		setProfileFormMode('edit');
		setEditingProfile(profile);
		toggleProfileForm(true);
	};

	const handlePackageSubmit = async (values: PackageFormValues) => {
		if (!authToken) return;
		setSavingKey('package-form');
		try {
			const labelTranslations = values.labelTranslations ?? {};
			let response: Response;
			if (packageFormMode === 'create') {
				const payload =
					values.planMode === 'shared'
						? {
								label: values.label,
								label_translations: labelTranslations,
								profile: values.profileGroup,
								scope: values.isGlobal ? 'global' : 'owner',
						  }
						: {
								label: values.label,
								label_translations: labelTranslations,
								price: values.price ?? 0,
								profile: {
									duration: values.duration,
									bandwidth: values.bandwidth,
									devices: values.devices,
								},
								is_active: true,
								scope: 'owner',
						  };
				response = await PackageService.createPortalPackage(payload, authToken);
			} else if (editingPackage) {
				const payload = editingPackage.profile?.shared
					? {
							label: values.label,
							label_translations: labelTranslations,
					  }
					: {
							label: values.label,
							label_translations: labelTranslations,
							price: values.price,
							duration: values.duration,
							bandwidth: values.bandwidth,
							devices: values.devices,
							is_active: values.isActive,
					  };
				response = await PackageService.updatePortalPackage(
					editingPackage.id,
					payload,
					authToken
				);
			} else {
				return;
			}

			if (!response.ok) {
				await showError(response, 'Could not save the package.');
				return;
			}
			togglePackageForm(false);
			await loadPackages(false);
			setAppMessage?.({ type: 'message', message: 'Package saved.' });
		} catch (error) {
			console.error('[PackagesScreen] save package failed', error);
			setAppMessage?.({ type: 'error', message: 'Could not save the package.' });
		} finally {
			setSavingKey(null);
		}
	};

	const handleProfileSubmit = async (values: RadiusProfileFormValues) => {
		if (!authToken) return;
		setSavingKey('profile-form');
		try {
			const response =
				profileFormMode === 'create'
					? await PackageService.createSharedProfile(
							{
								name: values.name,
								price: values.price ?? 0,
								no_of_users: values.devices,
								bandwidth: values.bandwidth,
								duration: values.duration,
							},
							authToken
					  )
					: editingProfile
					? await PackageService.updateSharedProfile(
							editingProfile.group,
							{
								name: values.name,
								...(values.price !== undefined
									? { price: values.price }
									: {}),
								no_of_users: values.devices,
								bandwidth: values.bandwidth,
								duration: values.duration,
							},
							authToken
					  )
					: null;

			if (!response || !response.ok) {
				await showError(response, 'Could not save the RADIUS profile.');
				return;
			}
			toggleProfileForm(false);
			await Promise.all([loadProfiles(false), loadPackages(false)]);
			setAppMessage?.({ type: 'message', message: 'RADIUS profile saved.' });
		} catch (error) {
			console.error('[PackagesScreen] save profile failed', error);
			setAppMessage?.({
				type: 'error',
				message: 'Could not save the RADIUS profile.',
			});
		} finally {
			setSavingKey(null);
		}
	};

	const handleSaveRouters = async (
		pkg: PortalPackage,
		payload: {
			visible: string[];
			rate_limits: Record<string, string | null>;
			reconnect_users: boolean;
		}
	) => {
		if (!authToken) return;
		setSavingKey(`routers-${pkg.id}`);
		try {
			const response = await PackageService.updatePackageRouters(
				pkg.id,
				payload,
				authToken
			);
			if (!response.ok) {
				await showError(response, 'Could not save router settings.');
				return;
			}
			const json = await response.json();
			setPortalPackages((prev) =>
				prev.map((item) =>
					item.id === pkg.id
						? {
								...item,
								routers: Array.isArray(json?.routers)
									? json.routers
									: item.routers,
								rate_limits: json?.rate_limits ?? item.rate_limits,
						  }
						: item
				)
			);
			setAppMessage?.({ type: 'message', message: 'Router settings saved.' });
		} catch (error) {
			console.error('[PackagesScreen] save routers failed', error);
			setAppMessage?.({
				type: 'error',
				message: 'Could not save router settings.',
			});
		} finally {
			setSavingKey(null);
		}
	};

	const handleSaveTrial = async (
		routerItem: ApiRouter,
		enabled: boolean,
		minutes: number
	) => {
		if (!authToken) return;
		setSavingKey(`trial-${routerItem.id}`);
		try {
			const response = await PackageService.updateTrialSettings(
				routerItem.id,
				{ enabled, duration_minutes: minutes },
				authToken
			);
			if (!response.ok) {
				await showError(response, 'Could not save trial settings.');
				return;
			}
			const json = await response.json();
			setTrialSettings((prev) => ({
				...prev,
				[routerItem.id]:
					json?.trial_settings ?? {
						router_id: routerItem.id,
						enabled,
						duration_minutes: minutes,
						cooldown_hours: 24,
					},
			}));
			setAppMessage?.({ type: 'message', message: 'Trial settings saved.' });
		} catch (error) {
			console.error('[PackagesScreen] save trial failed', error);
			setAppMessage?.({ type: 'error', message: 'Could not save trial settings.' });
		} finally {
			setSavingKey(null);
		}
	};

	const requestDeletePackage = (pkg: PortalPackage) => {
		setConfirmTarget({
			type: 'package',
			id: pkg.id,
			title: 'Delete package',
			message: `Delete "${pkg.label}"? This cannot be undone.`,
		});
		toggleConfirm(true);
	};

	const requestDeleteProfile = (profile: SharedRadiusProfile) => {
		setConfirmTarget({
			type: 'profile',
			id: profile.group,
			title: 'Delete RADIUS profile',
			message: `Delete "${profile.display_name || profile.group}"? Packages selling this plan may stop working.`,
		});
		toggleConfirm(true);
	};

	const handleConfirmDelete = async () => {
		if (!authToken || !confirmTarget) return;
		const target = confirmTarget;
		setSavingKey(`delete-${target.type}-${target.id}`);
		try {
			const response =
				target.type === 'package'
					? await PackageService.deletePortalPackage(target.id, authToken)
					: await PackageService.deleteSharedProfile(target.id, authToken);
			if (!response.ok) {
				await showError(response, 'Could not delete the selected item.');
				return;
			}
			toggleConfirm(false);
			if (target.type === 'package') {
				await loadPackages(false);
			} else {
				await Promise.all([loadProfiles(false), loadPackages(false)]);
			}
			setAppMessage?.({ type: 'message', message: 'Deleted.' });
		} catch (error) {
			console.error('[PackagesScreen] delete failed', error);
			setAppMessage?.({ type: 'error', message: 'Could not delete the selected item.' });
		} finally {
			setSavingKey(null);
		}
	};

	const renderPackagesTab = () => (
		<ThemedView
			style={{ gap: 10 }}
			lightColor='transparent'
			darkColor='transparent'
		>
			<ThemedView
				style={styles.sectionHeader}
				lightColor='transparent'
				darkColor='transparent'
			>
				<ThemedText
					style={styles.sectionTitle}
					lightColor={textColor}
					darkColor={textColor}
				>
					Portal packages
				</ThemedText>
				<ThemedButton
					title={t('addPackage', 'Add package')}
					onPress={openCreatePackage}
					icon='plus'
					lightColor={selectedBg}
					darkColor={selectedBg}
					lightTextColor={selectedText}
					darkTextColor={selectedText}
				/>
			</ThemedView>
			<ThemedText
				style={styles.help}
				lightColor={mutedText}
				darkColor={mutedText}
			>
				{t('portalPackagesDescription', '')}
			</ThemedText>

			{loadingPackages && portalPackages.length === 0 ? (
				<ThemedText lightColor={mutedText} darkColor={mutedText}>
					Loading packages…
				</ThemedText>
			) : portalPackages.length === 0 ? (
				<ThemedView
					style={styles.empty}
					lightColor={chipBg}
					darkColor={chipBg}
				>
					<ThemedText lightColor={mutedText} darkColor={mutedText}>
						{t('noPackages', 'No packages found.')}
					</ThemedText>
				</ThemedView>
			) : (
				portalPackages.map((pkg) => {
					const canManage = isAdmin || pkg.owner?.type !== 'platform';
					return (
						<TileContainer
							key={pkg.id}
							id={`portal-package-${pkg.id}`}
							backgroundColor={bg}
							style={styles.card}
						>
							<ThemedView
								style={styles.cardHeader}
								lightColor='transparent'
								darkColor='transparent'
							>
								<ThemedView
									style={{ flex: 1, gap: 2 }}
									lightColor='transparent'
									darkColor='transparent'
								>
									<ThemedText
										style={styles.cardTitle}
										lightColor={textColor}
										darkColor={textColor}
									>
										{pkg.label}
									</ThemedText>
									<ThemedText
										style={styles.meta}
										lightColor={mutedText}
										darkColor={mutedText}
									>
										{pkg.owner?.name ?? (pkg.is_global ? 'Platform' : 'You')}{' '}
										· {pkg.profile?.group ?? pkg.rad_group}
									</ThemedText>
								</ThemedView>
								<ThemedText
									style={[
										styles.status,
										{ color: pkg.is_active ? selectedBg : errorColor },
									]}
									lightColor={pkg.is_active ? selectedBg : errorColor}
									darkColor={pkg.is_active ? selectedBg : errorColor}
								>
									{pkg.is_active ? 'active' : 'inactive'}
								</ThemedText>
							</ThemedView>

							<ThemedView
								style={styles.metrics}
								lightColor='transparent'
								darkColor='transparent'
							>
								<ThemedView
									style={styles.metric}
									lightColor='transparent'
									darkColor='transparent'
								>
									<ThemedText
										style={styles.metricLabel}
										lightColor={mutedText}
										darkColor={mutedText}
									>
										Price (UGX)
									</ThemedText>
									<ThemedText
										style={styles.metricValue}
										lightColor={textColor}
										darkColor={textColor}
									>
										{formatAmount(pkg.price ?? 0, 0)}
									</ThemedText>
								</ThemedView>
								<ThemedView
									style={styles.metric}
									lightColor='transparent'
									darkColor='transparent'
								>
									<ThemedText
										style={styles.metricLabel}
										lightColor={mutedText}
										darkColor={mutedText}
									>
										Devices
									</ThemedText>
									<ThemedText
										style={styles.metricValue}
										lightColor={textColor}
										darkColor={textColor}
									>
										{pkg.profile?.devices ?? '—'}
									</ThemedText>
								</ThemedView>
								<ThemedView
									style={styles.metric}
									lightColor='transparent'
									darkColor='transparent'
								>
									<ThemedText
										style={styles.metricLabel}
										lightColor={mutedText}
										darkColor={mutedText}
									>
										Routers
									</ThemedText>
									<ThemedText
										style={styles.metricValue}
										lightColor={textColor}
										darkColor={textColor}
									>
										{visibleRouterCount(pkg)} / {pkg.routers?.length ?? 0}
									</ThemedText>
								</ThemedView>
							</ThemedView>

							<ThemedView
								style={styles.actions}
								lightColor='transparent'
								darkColor='transparent'
							>
								<ThemedButton
									title='Edit'
									onPress={() => openEditPackage(pkg)}
									icon='edit.outline'
									disabled={!canManage}
									style={styles.actionButton}
									lightColor={chipBg}
									darkColor={chipBg}
									lightTextColor={textColor}
									darkTextColor={textColor}
								/>
								<ThemedButton
									title='Delete'
									onPress={() => requestDeletePackage(pkg)}
									icon='delete.outline'
									disabled={!canManage}
									style={styles.actionButton}
									lightColor={errorColor}
									darkColor={errorColor}
									lightTextColor='#fff'
									darkTextColor='#fff'
								/>
							</ThemedView>
						</TileContainer>
					);
				})
			)}
		</ThemedView>
	);

	const renderRoutersTab = () => (
		<ThemedView
			style={{ gap: 10 }}
			lightColor='transparent'
			darkColor='transparent'
		>
			<ThemedText
				style={styles.sectionTitle}
				lightColor={textColor}
				darkColor={textColor}
			>
				Routers & rate limits
			</ThemedText>
			<ThemedText
				style={styles.help}
				lightColor={mutedText}
				darkColor={mutedText}
			>
				{t('routersRateLimitsDescription', '')}
			</ThemedText>

			{portalPackages.length === 0 ? (
				<ThemedView style={styles.empty} lightColor={chipBg} darkColor={chipBg}>
					<ThemedText lightColor={mutedText} darkColor={mutedText}>
						{t('noPackages', 'No packages found.')}
					</ThemedText>
				</ThemedView>
			) : (
				<>
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={styles.selectorRow}
					>
						{portalPackages.map((pkg) => {
							const selected = pkg.id === selectedPackage?.id;
							return (
								<TouchableOpacity
									key={pkg.id}
									onPress={() => setSelectedPackageId(pkg.id)}
									style={[
										styles.selectorChip,
										{
											backgroundColor: selected ? selectedBg : chipBg,
											borderColor: selected ? selectedBg : border,
										},
									]}
								>
									<ThemedText
										style={[
											styles.selectorText,
											{ color: selected ? selectedText : textColor },
										]}
										lightColor={selected ? selectedText : textColor}
										darkColor={selected ? selectedText : textColor}
									>
										{pkg.label}
									</ThemedText>
								</TouchableOpacity>
							);
						})}
					</ScrollView>
					{selectedPackage ? (
						<PackageRoutersCard
							pkg={selectedPackage}
							saving={savingKey === `routers-${selectedPackage.id}`}
							onSave={(payload) =>
								handleSaveRouters(selectedPackage, payload)
							}
						/>
					) : null}
				</>
			)}
		</ThemedView>
	);

	const renderProfilesTab = () => (
		<ThemedView
			style={{ gap: 10 }}
			lightColor='transparent'
			darkColor='transparent'
		>
			<ThemedView
				style={styles.sectionHeader}
				lightColor='transparent'
				darkColor='transparent'
			>
				<ThemedText
					style={styles.sectionTitle}
					lightColor={textColor}
					darkColor={textColor}
				>
					RADIUS profiles
				</ThemedText>
				{canManageProfiles ? (
					<ThemedButton
						title={t('createGlobalProfile', 'Create global profile')}
						onPress={openCreateProfile}
						icon='plus'
						lightColor={selectedBg}
						darkColor={selectedBg}
						lightTextColor={selectedText}
						darkTextColor={selectedText}
					/>
				) : null}
			</ThemedView>
			<ThemedText
				style={styles.help}
				lightColor={mutedText}
				darkColor={mutedText}
			>
				{t('radiusProfilesDescription', '')}
			</ThemedText>

			{profilesError ? (
				<ThemedView style={styles.empty} lightColor={chipBg} darkColor={chipBg}>
					<ThemedText lightColor={errorColor} darkColor={errorColor}>
						{profilesError}
					</ThemedText>
				</ThemedView>
			) : loadingProfiles && profiles.length === 0 ? (
				<ThemedText lightColor={mutedText} darkColor={mutedText}>
					Loading profiles…
				</ThemedText>
			) : profiles.length === 0 ? (
				<ThemedView style={styles.empty} lightColor={chipBg} darkColor={chipBg}>
					<ThemedText lightColor={mutedText} darkColor={mutedText}>
						{t('noProfiles', 'No profiles found.')}
					</ThemedText>
				</ThemedView>
			) : (
				profiles.map((profile) => (
					<TileContainer
						key={profile.group}
						id={`radius-profile-${profile.group}`}
						backgroundColor={bg}
						style={styles.card}
					>
						<ThemedView
							style={styles.cardHeader}
							lightColor='transparent'
							darkColor='transparent'
						>
							<ThemedView
								style={{ flex: 1, gap: 2 }}
								lightColor='transparent'
								darkColor='transparent'
							>
								<ThemedText
									style={styles.cardTitle}
									lightColor={textColor}
									darkColor={textColor}
								>
									{profile.display_name || profile.name || profile.group}
								</ThemedText>
								<ThemedText
									style={styles.meta}
									lightColor={mutedText}
									darkColor={mutedText}
								>
									{profile.group} · {profile.shared ? 'Shared' : 'Owner'}
								</ThemedText>
							</ThemedView>
							<ThemedText
								style={styles.status}
								lightColor={mutedText}
								darkColor={mutedText}
							>
								{formatAmount(profile.price ?? 0, 0)} UGX
							</ThemedText>
						</ThemedView>

						<ThemedView
							style={styles.metrics}
							lightColor='transparent'
							darkColor='transparent'
						>
							<ThemedView
								style={styles.metric}
								lightColor='transparent'
								darkColor='transparent'
							>
								<ThemedText
									style={styles.metricLabel}
									lightColor={mutedText}
									darkColor={mutedText}
								>
									Duration
								</ThemedText>
								<ThemedText
									style={styles.metricValue}
									lightColor={textColor}
									darkColor={textColor}
								>
									{profileDuration(profile)}
								</ThemedText>
							</ThemedView>
							<ThemedView
								style={styles.metric}
								lightColor='transparent'
								darkColor='transparent'
							>
								<ThemedText
									style={styles.metricLabel}
									lightColor={mutedText}
									darkColor={mutedText}
								>
									Rate limit
								</ThemedText>
								<ThemedText
									style={styles.metricValue}
									lightColor={textColor}
									darkColor={textColor}
								>
									{profile.rate_limit ?? 'open'}
								</ThemedText>
							</ThemedView>
							<ThemedView
								style={styles.metric}
								lightColor='transparent'
								darkColor='transparent'
							>
								<ThemedText
									style={styles.metricLabel}
									lightColor={mutedText}
									darkColor={mutedText}
								>
									Devices
								</ThemedText>
								<ThemedText
									style={styles.metricValue}
									lightColor={textColor}
									darkColor={textColor}
								>
									{profile.devices ?? '—'}
								</ThemedText>
							</ThemedView>
						</ThemedView>

						{canManageProfiles ? (
							<ThemedView
								style={styles.actions}
								lightColor='transparent'
								darkColor='transparent'
							>
								<ThemedButton
									title='Edit'
									onPress={() => openEditProfile(profile)}
									icon='edit.outline'
									style={styles.actionButton}
									lightColor={chipBg}
									darkColor={chipBg}
									lightTextColor={textColor}
									darkTextColor={textColor}
								/>
								<ThemedButton
									title='Delete'
									onPress={() => requestDeleteProfile(profile)}
									icon='delete.outline'
									style={styles.actionButton}
									lightColor={errorColor}
									darkColor={errorColor}
									lightTextColor='#fff'
									darkTextColor='#fff'
								/>
							</ThemedView>
						) : null}
					</TileContainer>
				))
			)}
		</ThemedView>
	);

	const renderTrialTab = () => (
		<ThemedView
			style={{ gap: 10 }}
			lightColor='transparent'
			darkColor='transparent'
		>
			<ThemedText
				style={styles.sectionTitle}
				lightColor={textColor}
				darkColor={textColor}
			>
				Free trial
			</ThemedText>
			<ThemedText
				style={styles.help}
				lightColor={mutedText}
				darkColor={mutedText}
			>
				{t('freeTrialDescription', '')}
			</ThemedText>

			{!routers?.length ? (
				<ThemedView style={styles.empty} lightColor={chipBg} darkColor={chipBg}>
					<ThemedText lightColor={mutedText} darkColor={mutedText}>
						No routers are available yet.
					</ThemedText>
				</ThemedView>
			) : (
				<TileContainer
					id='trial-settings'
					backgroundColor={bg}
					style={styles.card}
				>
					{routers.map((routerItem) => (
						<TrialSettingsRow
							key={routerItem.id}
							router={routerItem}
							settings={trialSettings[routerItem.id]}
							loading={
								loadingTrials && trialSettings[routerItem.id] === undefined
							}
							saving={savingKey === `trial-${routerItem.id}`}
							onSave={(enabled, minutes) =>
								handleSaveTrial(routerItem, enabled, minutes)
							}
						/>
					))}
				</TileContainer>
			)}
		</ThemedView>
	);

	return (
		<>
			<ParallaxScrollView
				headerBackgroundColor={{ light: bg, dark: bg }}
				containerStyle={{ flex: 1 }}
				contentStyle={{ padding: 16 }}
				onRefresh={handleRefresh}
				refreshing={refreshing}
			>
				<ThemedView
					style={{ flexDirection: 'row', flexWrap: 'wrap' }}
					lightColor={bg}
					darkColor={bg}
				>
					<ThemedText
						lightColor={textColor}
						darkColor={textColor}
						style={styles.heading}
					>
						{t('title', 'Packages / Profiles')}
					</ThemedText>
					<ThemedView
						style={styles.headerActions}
						lightColor={bg}
						darkColor={bg}
					>
						{canManageProfiles ? (
							<ThemedButton
								title={t('createGlobalProfile', 'Create global profile')}
								onPress={openCreateProfile}
								style={styles.headerButton}
								icon='plus'
								darkColor='transparent'
								lightColor='transparent'
								darkTextColor={selectedBg}
								lightTextColor={selectedBg}
							/>
						) : null}
						<ThemedButton
							title={buttonsCopy.portalLang}
							onPress={() => router.replace('/(authenticated)/translation')}
							style={styles.headerButton}
							icon='translate'
							darkColor='transparent'
							lightColor='transparent'
							darkTextColor={selectedBg}
							lightTextColor={selectedBg}
						/>
					</ThemedView>
				</ThemedView>

				<ThemedText
					style={styles.subtitle}
					lightColor={mutedText}
					darkColor={mutedText}
				>
					{t('subtitle', '')}
				</ThemedText>

				<ThemedView style={{ marginVertical: 8 }} lightColor={bg} darkColor={bg}>
					<SegmentedTabs
						tabs={tabs}
						activeKey={activeTab}
						onChange={(key) => setActiveTab(key as TabKey)}
					/>
				</ThemedView>

				{activeTab === 'packages'
					? renderPackagesTab()
					: activeTab === 'routers'
					? renderRoutersTab()
					: activeTab === 'profiles'
					? renderProfilesTab()
					: renderTrialTab()}
			</ParallaxScrollView>

			<PackageForm
				visible={showPackageForm}
				fadeAnim={packageFormAnim}
				toggleVisible={togglePackageForm}
				mode={packageFormMode}
				initial={editingPackage}
				profiles={profiles}
				isAdmin={isAdmin}
				saving={savingKey === 'package-form'}
				onSubmit={handlePackageSubmit}
			/>

			<RadiusProfileForm
				visible={showProfileForm}
				fadeAnim={profileFormAnim}
				toggleVisible={toggleProfileForm}
				mode={profileFormMode}
				initial={editingProfile}
				saving={savingKey === 'profile-form'}
				onSubmit={handleProfileSubmit}
			/>

			<Prompt
				visible={showConfirm}
				fadeAnim={confirmAnim}
				title={confirmTarget?.title ?? 'Delete'}
				message={confirmTarget?.message ?? ''}
				onClose={() => toggleConfirm(false)}
				buttons={[
					{
						title: 'Cancel',
						color: chipBg,
						textColor,
						action: () => toggleConfirm(false),
					},
					{
						title: 'Delete',
						color: errorColor,
						textColor: '#fff',
						action: () => {
							void handleConfirmDelete();
						},
					},
				]}
			/>
		</>
	);
}

const styles = StyleSheet.create({
	heading: {
		width: '100%',
		textTransform: 'capitalize',
		fontSize: fontSize['heading.one'],
		fontWeight: fontWeight['heading.one'],
	},
	subtitle: {
		fontSize: fontSize['text.medium'],
		marginTop: 8,
	},
	headerActions: {
		width: '100%',
		paddingVertical: 8,
		alignItems: 'flex-end',
		gap: 8,
	},
	headerButton: {
		borderRadius: 8,
	},
	sectionHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 10,
		flexWrap: 'wrap',
	},
	sectionTitle: {
		fontSize: fontSize['heading.two'],
		fontWeight: fontWeight['heading.two'],
	},
	help: {
		fontSize: fontSize['text.medium'],
	},
	card: {
		width: '100%',
		gap: 10,
	},
	cardHeader: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 8,
	},
	cardTitle: {
		fontSize: fontSize['heading.two'],
		fontWeight: fontWeight['heading.two'],
	},
	meta: {
		fontSize: 13,
	},
	status: {
		fontSize: 12,
		textTransform: 'uppercase',
		fontWeight: fontWeight['text.xsmall'],
	},
	metrics: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 12,
	},
	metric: {
		minWidth: 90,
		gap: 2,
	},
	metricLabel: {
		fontSize: 11,
		textTransform: 'uppercase',
	},
	metricValue: {
		fontSize: fontSize['text.medium'],
		fontWeight: fontWeight['heading.three'],
	},
	actions: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	actionButton: {
		flex: 1,
		minWidth: 110,
	},
	empty: {
		padding: 16,
		borderRadius: 8,
		alignItems: 'center',
	},
	selectorRow: {
		flexDirection: 'row',
		gap: 8,
		paddingVertical: 2,
	},
	selectorChip: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 999,
		borderWidth: 1,
	},
	selectorText: {
		fontSize: 13,
	},
});
