import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import TileContainer from '@/components/TileContainer';
import { fontSize, fontWeight } from '@/constants/Font';
import translations from '@/constants/Trans';
import { useGeneral } from '@/context/GeneralContext';
import { useTransaction } from '@/context/TransactionContext';
import { ShowAlert } from '@/helpers';
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
import { ActivityIndicator, RefreshControl, StyleSheet, useColorScheme } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

export default function VouchersHotspotScreen() {
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
	const bim = useThemeColor({}, 'bim');
	const white = useThemeColor({}, 'white');
	const navigation = useNavigation();
	const router = useRouter();
	const { vRId } = useLocalSearchParams() as { vRId?: string };
	// memoize the path so useTrackHistory doesn't receive a new string each render
	const trackPath = useMemo(() => {
		return vRId ? '/(authenticated)/routers/vouchers/' + vRId : undefined;
	}, [vRId]);
	useTrackHistory(trackPath);
	const { packages, fetchPackages, routers } = useTransaction();
	const { user, language, handleUpdateHistory, authToken } = useGeneral();
	const [currentRouter, setCurrentRouter] = React.useState<ApiRouter>();
	const [hotspots, setHotspots] = React.useState<Hotspot[]>([]);
	const [isLoading, setIsLoading] = React.useState(false);
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
	}, [navigation]);

	useFocusEffect(
		useCallback(() => {
			if (!vRId) return;
			const parent = '/(authenticated)/vouchers';
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
		}, [handleUpdateHistory, trackPath, vRId])
	);

	const fetchHotspots = useCallback(async () => {
		if (!vRId || !authToken) return;
		setIsLoading(true);
		try {
			const hotspotsResponse = await getRouterHotspots(vRId, authToken);
			if (hotspotsResponse && hotspotsResponse.ok) {
				const hotspotsData = await hotspotsResponse.json();
				if (hotspotsData.hotspots) {
					setHotspots(hotspotsData.hotspots);
				}
			} else {
				ShowAlert(translations[language].categories.errors.somethingWentWrong, 'Error');
			}
		} catch (e) {
			console.error('[VouchersHotspotScreen] fetchHotspots failed', e);
			ShowAlert(translations[language].categories.errors.somethingWentWrong, 'Error');
		} finally {
			setIsLoading(false);
		}
	}, [vRId, authToken, language]);

	useEffect(() => {
		void fetchHotspots();
	}, [fetchHotspots]);

	const handleRefresh = useCallback(async () => {
		setRefreshing(true);
		try {
			await fetchHotspots();
		} catch (e) {
			console.error('[VouchersHotspotScreen] refresh failed', e);
		} finally {
			setRefreshing(false);
		}
	}, [fetchHotspots]);

	useEffect(() => {
		if (user && packages.length === 0) {
			(async () => {
				await fetchPackages();
			})();
		}
	}, [user, packages, fetchPackages]);

	useEffect(() => {
		if (vRId && routers) {
			const found = routers.data.find((r) => r.id === vRId);
			setCurrentRouter(found);
		}
	}, [vRId, routers]);
	if (isLoading) {
			return (
				<ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} lightColor={background} darkColor={background}>
					<ActivityIndicator size="large" color={bim} />
				</ThemedView>
			);
		}
	return (
		<ParallaxScrollView
			containerStyle={styles.container}
			contentStyle={{ padding: 16 }}
			headerBackgroundColor={{ dark: backgroundDark, light: backgroundLight }}
			onRefresh={handleRefresh}
			refreshing={refreshing}
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
							refreshControl={
								<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
							}
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
											lightColor={bim}
											darkColor={bim}
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
												flexDirection: 'row',
												justifyContent: 'space-between',
												gap: 5,
												width: 120,
											}}
											lightColor={backgroundLight}
											darkColor={backgroundDark}
										>
											<ThemedButton
												title={translations[
													language
												].categories.buttons.viewVouchers.toUpperCase()}
												numberOfLines={1}
												onPress={() =>
													router.push({
														pathname:
															'/(authenticated)/routers/vouchers/[vRId]/[hotspotId]',
														params: {
															vRId: vRId ?? '',
															hotspotId: hotspot['.id'],
															name: hotspot.name,
														},
													})
												}
												lightColor={bim}
												darkColor={bim}
												darkTextColor={white}
												lightTextColor={white}
												style={{ flex: 1 }}
											/>
										</ThemedView>
									</ThemedView>
								))}
							</ThemedView>
						</ScrollView>
					</ThemedView>
				</ScrollView>
			</TileContainer>
		</ParallaxScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		margin: 0,
	},
	routerItem: {
		borderBottomWidth: 1
	},
});
