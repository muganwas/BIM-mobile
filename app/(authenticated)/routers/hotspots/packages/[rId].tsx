import Loader from '@/components/Loader';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import TileContainer from '@/components/TileContainer';
import { fontSize, fontWeight } from '@/constants/Font';
import translations from '@/constants/Trans';
import { useGeneral } from '@/context/GeneralContext';
import { useTransaction } from '@/context/TransactionContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import useTrackHistory from '@/hooks/useTrackHistory';
import { getRouterHotspots } from '@/services/RouterService';
import { ApiRouter, Hotspot } from '@/types';
import {
    useFocusEffect,
    useLocalSearchParams,
    useNavigation,
    useRouter,
} from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Animated, RefreshControl, StyleSheet, useAnimatedValue, useColorScheme } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

export default function PackageRouterHotspotsScreen() {
	useColorScheme();
	// Theme helpers
	const background = useThemeColor({}, 'background');
	const backgroundLight = useThemeColor({}, 'background', 'light');
	const backgroundDark = useThemeColor({}, 'background', 'dark');
	const textLight = useThemeColor({}, 'text', 'light');
	const textDark = useThemeColor({}, 'text', 'dark');
	const titleBgLight = useThemeColor({}, 'titleBg', 'light');
	const titleBgDark = useThemeColor({}, 'titleBg', 'dark');
	const borderDark = useThemeColor({}, 'borderDark');
	const listItemBackground = useThemeColor({}, 'listItemBackground');
	const lime = useThemeColor({}, 'lime');
	const white = useThemeColor({}, 'white');
	const router = useRouter();
	const navigation = useNavigation();
	const expoRouter = useRouter();
	const { rId } = useLocalSearchParams() as { rId?: string };
	const fadeAnim = useAnimatedValue(0);
	// memoize the path so useTrackHistory doesn't receive a new string each render
	const trackPath = useMemo(() => {
		return rId ? '/(authenticated)/routers/hotspots/' + rId : undefined;
	}, [rId]);
	useTrackHistory(trackPath);
	const { packages, fetchPackages, routers } = useTransaction();
	const { user, language, handleUpdateHistory, authToken } = useGeneral();
	const [currentRouter, setCurrentRouter] = React.useState<ApiRouter>();
	const [hotspots, setHotspots] = React.useState<Hotspot[]>([]);
	const [loading, setLoading] = React.useState(false);
	const [refreshing, setRefreshing] = React.useState(false);

	// stable per-mount id to avoid duplicate handler registration during Fast Refresh
	const packageRouterHotspotsListDetailsId = useRef(
		`package-router-hotspots-list-details-${Math.random()
			.toString(36)
			.slice(2)}`
	);

	const packageRouterHotspotsListId = useRef(
		`package-router-hotspots-list-${Math.random().toString(36).slice(2)}`
	);
	const packageRouterHotspotsListHeaderId = useRef(
		`package-router-hotspots-list-header-${Math.random().toString(36).slice(2)}`
	);

	// avoid repeatedly seeding the parent history entry (prevents loops)
	const seededParentRef = useRef(false);

	useEffect(() => {
		navigation.setOptions({
			headerProps: {
				goback: true,
			},
		});
	}, [navigation, expoRouter]);

	useFocusEffect(
		useCallback(() => {
			if (!rId) return;
			const parent = '/(authenticated)/packages';
			if (!seededParentRef.current) {
				handleUpdateHistory(parent);
				if (trackPath) {
					handleUpdateHistory(trackPath);
				}
				seededParentRef.current = true;
			}
			return () => {
				// on blur (cleanup)
				seededParentRef.current = false;
			};
		}, [handleUpdateHistory, trackPath, rId])
	);

	useEffect(() => {
		if (user && packages.length === 0) {
			(async () => {
				await fetchPackages();
			})();
		}
	}, [user, packages, fetchPackages]);

	useEffect(() => {
		if (rId && routers) {
			const found = routers.routers.data.find((r) => r.id === rId);
			setCurrentRouter(found);
		}
	}, [rId, routers]);


	const toggleOverlay = (show?: boolean) => {
		const val = show !== undefined ? show : !loading;
		if (val) {
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 300,
				useNativeDriver: true,
			}).start();
			setLoading(true);		
		} else {
			Animated.timing(fadeAnim, {
				toValue: 0,
				duration: 300,
				useNativeDriver: true,
			}).start(() => {
				setLoading(false);
			});
		}
	}

	const fetchHotspots = useCallback(async (showOverlay = false) => {
		if (!rId || !authToken) return;
		if (showOverlay) toggleOverlay(true);
		try {
			const hotspotsResponse = await getRouterHotspots(rId, authToken);
			if (hotspotsResponse && hotspotsResponse.ok) {
				const hotspotsData = await hotspotsResponse.json();
				if (hotspotsData.hotspots) {
					setHotspots(hotspotsData.hotspots);
				}
			}
		} catch (error) {
			console.error('Error fetching hotspots:', error);
		} finally {
			if (showOverlay) toggleOverlay(false);
		}
	}, [rId, authToken]);

	useEffect(() => {
		void fetchHotspots(true);
	}, [fetchHotspots]);

	const handleRefresh = useCallback(async () => {
		setRefreshing(true);
		try {
			await fetchHotspots(false);
		} catch (e) {
			console.error('[PackageRouterHotspotsScreen] refresh failed', e);
		} finally {
			setRefreshing(false);
		}
	}, [fetchHotspots]);


	return (
		<>
		<ThemedView
			lightColor={backgroundLight}
			darkColor={backgroundDark}
			style={styles.container}
		>
			<ThemedView
				style={{ flexDirection: 'column', gap: 5, marginBottom: 10 }}
				lightColor={backgroundLight}
				darkColor={backgroundDark}
			>
				<ThemedText
					lightColor={textLight}
					darkColor={textDark}
					style={{
						width: '100%',
						textTransform: 'capitalize',
						fontSize: fontSize['heading.one'],
						fontWeight: fontWeight['heading.three'],
					}}
				>
					{translations[language].categories.hotspots.title}
					<ThemedText
						lightColor={textLight}
						darkColor={textDark}
						style={{
							fontSize: fontSize['heading.one'],
							fontWeight: fontWeight['heading.one'],
						}}
					>
						{currentRouter ? ` ${currentRouter.name}` : ''}
					</ThemedText>
				</ThemedText>
			</ThemedView>

			<TileContainer
				id={packageRouterHotspotsListId.current}
				backgroundColor={background}
				style={{
					flexDirection: 'column',
					overflow: 'hidden',
					boxSizing: 'border-box',
					padding: 0,
				}}
			>
				<ScrollView
					style={{ width: '100%' }}
					horizontal
					showsHorizontalScrollIndicator={true}
				>
					<ThemedView
						style={{ flexDirection: 'column' }}
						lightColor={backgroundLight}
						darkColor={backgroundDark}
					>
						<ThemedView
							id={packageRouterHotspotsListHeaderId.current}
							style={{
								flexDirection: 'row',
								justifyContent: 'space-between',
								gap: 10,
								paddingHorizontal: 10,
								paddingVertical: 10,
								borderBottomWidth: 1,
								borderBottomColor: borderDark,
							}}
							lightColor={titleBgLight}
							darkColor={titleBgDark}
						>
							<ThemedText
								style={{
									fontSize: fontSize['text.medium'],
									width: 120,
									textTransform: 'uppercase',
									paddingRight: 8,
								}}
								lightColor={textLight}
								darkColor={textDark}
							>
								{translations[language].categories.dashboard.name}
							</ThemedText>
							<ThemedText
								numberOfLines={1}
								ellipsizeMode='tail'
								style={{
									fontSize: fontSize['text.medium'],
									width: 120,
									textTransform: 'uppercase',
									paddingRight: 8,
								}}
								lightColor={textLight}
								darkColor={textDark}
							>
								{translations[language].categories.dashboard.location}
							</ThemedText>
							<ThemedText
								numberOfLines={1}
								ellipsizeMode='tail'
								style={{
									fontSize: fontSize['text.medium'],
									width: 120,
									textTransform: 'uppercase',
									paddingRight: 8,
								}}
								lightColor={textLight}
								darkColor={textDark}
							>
								{translations[language].categories.dashboard.ipAddress}
							</ThemedText>
							<ThemedText
								numberOfLines={1}
								ellipsizeMode='tail'
								style={{
									fontSize: fontSize['text.medium'],
									width: 120,
									textTransform: 'uppercase',
									paddingRight: 8,
								}}
								lightColor={textLight}
								darkColor={textDark}
							>
								{translations[language].categories.dashboard.routerUsername}
							</ThemedText>
							<ThemedText
								numberOfLines={1}
								ellipsizeMode='tail'
								style={{
									fontSize: fontSize['text.medium'],
									width: 120,
									textTransform: 'uppercase',
									textAlign: 'center',
								}}
								lightColor={textLight}
								darkColor={textDark}
							>
								{translations[language].categories.dashboard.actions}
							</ThemedText>
						</ThemedView>
						<ScrollView
							id={packageRouterHotspotsListDetailsId.current}
							style={{
								flexDirection: 'column',
								backgroundColor: background,
							}}
							refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
						>
							<ThemedView
								style={{ flexDirection: 'column', gap: 5 }}
								lightColor={backgroundLight}
								darkColor={backgroundDark}
							>
								{hotspots.map((hotspot, index) => (
									<ThemedView
										key={index}
										style={{
											flexDirection: 'row',
											width: '100%',
											alignItems: 'center',
											paddingVertical: 5,
											paddingHorizontal: 10,
											backgroundColor:
												index % 2 === 0 ? listItemBackground : background,
											justifyContent: 'space-between',
										}}
										lightColor={backgroundLight}
										darkColor={backgroundDark}
									>
										<ThemedText
											numberOfLines={1}
											style={{
												width: 120,
												paddingRight: 8,
												overflow: 'hidden',
											}}
											lightColor={lime}
											darkColor={lime}
										>
											{hotspot.name.toUpperCase()}
										</ThemedText>
										<ThemedText
											numberOfLines={1}
											style={{
												paddingRight: 8,
												width: 120,
											}}
											lightColor={textLight}
											darkColor={textDark}
										>
											{hotspot.interface}
										</ThemedText>
										<ThemedText
											numberOfLines={1}
											style={{
												paddingRight: 8,
												width: 120,
											}}
											lightColor={textLight}
											darkColor={textDark}
										>
											{hotspot.profile}
										</ThemedText>
										<ThemedText
											numberOfLines={1}
											style={{
												paddingRight: 8,
												width: 120,
											}}
											lightColor={textLight}
											darkColor={textDark}
										>
											{hotspot.disabled === true || hotspot.disabled === 'true' ? 'Disabled' : 'Enabled'}
										</ThemedText>
										<ThemedView
											style={{
												position: 'relative',
												flexDirection: 'row',
												justifyContent: 'space-between',
												gap: 5,
												width: 120,
												zIndex:100
											}}
											lightColor={backgroundLight}
											darkColor={backgroundDark}
										>
											<ThemedButton
												title={translations[
													language
												].categories.buttons.viewPackages.toUpperCase()}
												numberOfLines={1}
												onPress={() =>
													router.push(
														`/(authenticated)/routers/packages/${hotspot['.id']}`
													)
												}
												lightColor={lime}
												darkColor={lime}
												darkTextColor={white}
												lightTextColor={white}
												style={{ flex: 1, zIndex: 150 }}
											/>
										</ThemedView>
									</ThemedView>
								))}
							</ThemedView>
						</ScrollView>
					</ThemedView>
				</ScrollView>
			</TileContainer>
		</ThemedView>
			{loading && <Loader showOverlay={loading} fadeAnim={fadeAnim} toggleShowOverlay={toggleOverlay} />}
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
	},
	routerItem: {
		padding: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
	},
});
