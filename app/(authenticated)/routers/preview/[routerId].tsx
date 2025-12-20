import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import TileContainer from '@/components/TileContainer';
import { fontSize, fontWeight } from '@/constants/Font';
import translations from '@/constants/Trans';
import { useGeneral } from '@/context/GeneralContext';
import { generateRandomInt, msToHms } from '@/helpers';
import { useThemeColor } from '@/hooks/useThemeColor';
import useTrackHistory from '@/hooks/useTrackHistory';
import { getRouterById, getRouterHotspots, getRouterStatus } from '@/services/RouterService';
import { ApiRouter, Hotspot } from '@/types';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

export interface RouterStatus {
	uptime?: string;
	version?: string;
	'cpu-load'?: string;
	'cpu-frequency'?: string;
	'free-memory'?: string;
	'total-memory'?: string;
	'free-hdd-space'?: string;
	'total-hdd-space'?: string;
	'architecture-name'?: string;
	'board-name'?: string;
	platform?: string;
}

export default function RouterDetailsScreen() {
	const navigation = useNavigation<any>();
	const router = useRouter();
	const { routerId, name } = useLocalSearchParams() as { routerId?: string, name?: string };
	const { handleUpdateHistory, language, authToken } = useGeneral();
	
	// Theme helpers
	const background = useThemeColor({}, 'background');
	const backgroundLight = useThemeColor({}, 'background', 'light');
	const backgroundDark = useThemeColor({}, 'background', 'dark');
	const headingOneLight = useThemeColor({}, 'heading.one', 'light');
	const headingOneDark = useThemeColor({}, 'heading.one', 'dark');
	const textLight = useThemeColor({}, 'text', 'light');
	const textDark = useThemeColor({}, 'text', 'dark');
	const titleBgLight = useThemeColor({}, 'titleBg', 'light');
	const titleBgDark = useThemeColor({}, 'titleBg', 'dark');
	const borderDark = useThemeColor({}, 'borderDark');
	const listItemBackground = useThemeColor({}, 'listItemBackground');
	const bim = useThemeColor({}, 'bim');
	const whiteLight = useThemeColor({}, 'white', 'light');
	const whiteDark = useThemeColor({}, 'white', 'dark');
	
	// State
	const [apiRouter, setApiRouter] = useState<Partial<ApiRouter>>();
	const [routerStatus, setRouterStatus] = useState<RouterStatus | undefined>();
	const [hotspots, setHotspots] = useState<Hotspot[]>([]);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);

	// Seed parent immediately on mount to guarantee ordering before current route push
	useEffect(() => {
		handleUpdateHistory('/(authenticated)/routers');
	}, [handleUpdateHistory]);

	// Track current route after parent seeding is registered
	useTrackHistory(
		routerId
			? `/(authenticated)/routers/preview/${routerId}`
			: '/(authenticated)/routers/preview'
	);

	useEffect(() => {
		navigation.setOptions({
			headerProps: {
				goback: true,
			},
		});
	}, [navigation]);

	// Fetch router data, status, and hotspots
	const fetchRouterData = useCallback(async () => {
		if (!routerId || !authToken) return;
		console.log('[RouterDetailsScreen] Fetching data for router ID:', routerId);
		setLoading(true);
		try {
			if (name && routerId) {
				setApiRouter({ name, id: routerId });
			} else {
				const routerResponse = await getRouterById(routerId, authToken);
				if (routerResponse && routerResponse.ok) {
					const routerData = await routerResponse.json();
					if (routerData.router) setApiRouter({ ...routerData });
				}
			}

			const statusResponse = await getRouterStatus(routerId, authToken);
			if (statusResponse && statusResponse.ok) {
				const statusData = await statusResponse.json();
				if (statusData.status && statusData.status.length > 0) {
					setRouterStatus(statusData.status[0]);
				}
			}

			const hotspotsResponse = await getRouterHotspots(routerId, authToken);
			if (hotspotsResponse && hotspotsResponse.ok) {
				const hotspotsData = await hotspotsResponse.json();
				if (hotspotsData.hotspots) setHotspots(hotspotsData.hotspots);
			}
		} catch (error) {
			console.error('[RouterDetailsScreen] Failed to fetch router data:', error);
		} finally {
			setLoading(false);
		}
	}, [routerId, name, authToken]);

	useEffect(() => {
		void fetchRouterData();
	}, [fetchRouterData]);

	const handleRefresh = useCallback(async () => {
		setRefreshing(true);
		try {
			await fetchRouterData();
		} catch (e) {
			console.error('[RouterDetailsScreen] refresh failed', e);
		} finally {
			setRefreshing(false);
		}
	}, [fetchRouterData]);

	const handleViewHotspotUsers = (hotspot: Hotspot) => {
		const hotspotId = hotspot['.id'];
		if (!hotspotId) return;
		
		router.push({
			pathname: `/routers/vouchers/${routerId}/${hotspotId}`,
			params: { ...hotspot, disabled: String(hotspot.disabled) }
		} as any);
	};



	if (loading) {
		return (
			<ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} lightColor={background} darkColor={background}>
				<ActivityIndicator size="large" color={bim} />
			</ThemedView>
		);
	}
	return (
		<ParallaxScrollView
			headerBackgroundColor={{
				light: backgroundLight,
				dark: backgroundDark,
			}}
			contentStyle={{
				paddingHorizontal: 10,
			}}
			containerStyle={{ flex: 1 }}
			onRefresh={handleRefresh}
			refreshing={refreshing}
		>
			<TileContainer
				id={routerId || 'new-router'}
				backgroundColor={background}
				style={{
					flexDirection: 'column',
					boxSizing: 'border-box',
					overflow: 'hidden',
					paddingBottom: 10,
					marginHorizontal: 20,
				}}
			>
				<ThemedView
					lightColor={backgroundLight}
					darkColor={backgroundDark}
					style={{ flexDirection: 'column' }}
				>
					<ThemedText
						style={{
							fontSize: fontSize['heading.one'],
							fontWeight: fontWeight['heading.two'],
							marginBottom: 10,
						}}
						lightColor={headingOneLight}
						darkColor={headingOneDark}
					>
						{translations[language].categories.routers.routerHash}
					</ThemedText>
					<ThemedText>{routerId}</ThemedText>
				</ThemedView>
			</TileContainer>
			<TileContainer
				id={routerId || 'new-router-' + generateRandomInt(1000, 9999)}
				backgroundColor={background}
				style={{
					flexDirection: 'column',
					boxSizing: 'border-box',
					overflow: 'hidden',
					padding: 0,
					marginHorizontal: 20,
				}}
			>
				<ThemedView
					lightColor={backgroundLight}
					darkColor={backgroundDark}
					style={{ flexDirection: 'column', padding: 10 }}
				>
					<ThemedText
						style={{
							fontSize: fontSize['heading.one'],
							fontWeight: fontWeight['heading.two'],
							marginBottom: 10,
						}}
						lightColor={headingOneLight}
						darkColor={headingOneDark}
					>
						{translations[language].categories.routers.routerStatus}
					</ThemedText>
					<ThemedView
						lightColor={backgroundLight}
						darkColor={backgroundDark}
						style={{ flexDirection: 'row', alignItems: 'center' }}
					>
						<ThemedText
							lightColor={textLight}
							darkColor={textDark}
							style={styles.statusLabel}
						>
							{`${translations[language].categories.routers.uptime}:`}
						</ThemedText>
						<ThemedText style={{ marginLeft: 10 }}>
							{routerStatus?.uptime &&
								msToHms(parseInt(routerStatus.uptime))}
						</ThemedText>
					</ThemedView>
					<ThemedView
						lightColor={backgroundLight}
						darkColor={backgroundDark}
						style={{ flexDirection: 'row', alignItems: 'center' }}
					>
						<ThemedText
							lightColor={textLight}
							darkColor={textDark}
							style={styles.statusLabel}
						>
							{`${translations[language].categories.routers.routerOS}:`}
						</ThemedText>
						<ThemedText style={{ marginLeft: 10 }}>
							{routerStatus?.version}
						</ThemedText>
					</ThemedView>
					<ThemedView
						lightColor={backgroundLight}
						darkColor={backgroundDark}
						style={{ flexDirection: 'row', alignItems: 'center' }}
					>
						<ThemedText
							lightColor={textLight}
							darkColor={textDark}
							style={styles.statusLabel}
						>
							{`${translations[language].categories.routers.freeMemory}:`}
						</ThemedText>
						<ThemedText style={{ marginLeft: 10 }}>
							{routerStatus?.['free-memory']}
						</ThemedText>
					</ThemedView>
					<ThemedView
						lightColor={backgroundLight}
						darkColor={backgroundDark}
						style={{ flexDirection: 'row', alignItems: 'center' }}
					>
						<ThemedText
							lightColor={textLight}
							darkColor={textDark}
							style={styles.statusLabel}
						>
							{`${translations[language].categories.routers.totalMemory}:`}
						</ThemedText>
						<ThemedText style={{ marginLeft: 10 }}>
							{routerStatus?.['total-memory']}
						</ThemedText>
					</ThemedView>
					<ThemedView
						lightColor={backgroundLight}
						darkColor={backgroundDark}
						style={{ flexDirection: 'row', alignItems: 'center' }}
					>
						<ThemedText
							lightColor={textLight}
							darkColor={textDark}
							style={styles.statusLabel}
						>
							{`${translations[language].categories.routers.cpuFrequency}:`}
						</ThemedText>
						<ThemedText style={{ marginLeft: 10 }}>
							{routerStatus?.['cpu-frequency'] ? routerStatus?.['cpu-frequency'] + ' MHz' : 'N/A'}
						</ThemedText>
					</ThemedView>
					<ThemedView
						lightColor={backgroundLight}
						darkColor={backgroundDark}
						style={{ flexDirection: 'row', alignItems: 'center' }}
					>
						<ThemedText
							lightColor={textLight}
							darkColor={textDark}
							style={styles.statusLabel}
						>
							{`${translations[language].categories.routers.cpuLoad}:`}
						</ThemedText>
						<ThemedText style={{ marginLeft: 10 }}>
							{routerStatus?.['cpu-load'] ? routerStatus?.['cpu-load'] + '%' : 'N/A'}
						</ThemedText>
					</ThemedView>
				</ThemedView>
			</TileContainer>
			<TileContainer
				id={routerId || 'new-router-' + generateRandomInt(1000, 9999)}
				backgroundColor={background}
				style={{
					flexDirection: 'column',
					boxSizing: 'border-box',
					overflow: 'hidden',
					padding: 0,
					marginHorizontal: 20,
				}}
			>
				<ThemedView
					lightColor={backgroundLight}
					darkColor={backgroundDark}
					style={{
						flexDirection: 'row',
						paddingHorizontal: 10,
						paddingTop: 10,
					}}
				>
					<ThemedText
						lightColor={textLight}
						darkColor={textDark}
						numberOfLines={1}
					>
						<ThemedText
							lightColor={textLight}
							darkColor={textDark}
							style={{
								fontWeight: fontWeight['heading.three'],
								fontSize: fontSize['heading.two'],
							}}
						>
							{`${translations[language].categories.routers.hotspotsTitle}: `}
						</ThemedText>
						<ThemedText
							lightColor={textLight}
							darkColor={textDark}
							style={{
								fontWeight: fontWeight['heading.two'],
								fontSize: fontSize['heading.two'],
							}}
						>
							{apiRouter?.name}
						</ThemedText>
					</ThemedText>
				</ThemedView>
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
							id={`hotspot-list-header-${routerId}`}
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
								style={{ width: 30 }}
								lightColor={textLight}
								darkColor={textDark}
							>
								{translations[language].categories.routers.id}
							</ThemedText>
							<ThemedText
								numberOfLines={1}
								ellipsizeMode='tail'
								style={styles.colTitle}
								lightColor={textLight}
								darkColor={textDark}
							>
								{translations[language].categories.routers.hotspotName}
							</ThemedText>
							<ThemedText
								numberOfLines={1}
								ellipsizeMode='tail'
								style={styles.colTitle}
								lightColor={textLight}
								darkColor={textDark}
							>
								{translations[language].categories.routers.interface}
							</ThemedText>
							<ThemedText
								numberOfLines={1}
								ellipsizeMode='tail'
								style={styles.colTitle}
								lightColor={textLight}
								darkColor={textDark}
							>
								{translations[language].categories.routers.profile}
							</ThemedText>
							<ThemedText
								numberOfLines={1}
								ellipsizeMode='tail'
								style={styles.colTitle}
								lightColor={textLight}
								darkColor={textDark}
							>
								{translations[language].categories.routers.status}
							</ThemedText>
							<ThemedText
								numberOfLines={1}
								ellipsizeMode='tail'
								style={[styles.colTitle, { textAlign: 'center' }]}
								lightColor={textLight}
								darkColor={textDark}
							>
								{translations[language].categories.routers.actions}
							</ThemedText>
						</ThemedView>
						<ScrollView
							nativeID={`hotspot-list-details-${routerId}`}
							style={{
								flexDirection: 'column',
								backgroundColor: background,
							}}
						>
							{hotspots.map((hotspot, index: number) => (
								<ThemedView
									key={index}
									style={{
										flexDirection: 'row',
										width: '100%',
										paddingVertical: 12,
										gap: 10,
										paddingHorizontal: 10,
										justifyContent: 'space-between',
										backgroundColor:
											index % 2 === 0 ? listItemBackground : background,
										borderBottomWidth: index < hotspots.length - 1 ? 1 : 0,
										borderBottomColor: borderDark,
									}}
									lightColor={backgroundLight}
									darkColor={backgroundDark}
								>
									<ThemedText
										numberOfLines={1}
										style={{
											width: 30,
											overflow: 'hidden',
											paddingRight: 8,
										}}
										lightColor={textLight}
										darkColor={textDark}
									>
										{index + 1}
									</ThemedText>
									<ThemedText
										numberOfLines={1}
										style={styles.colInfo}
										lightColor={bim}
										darkColor={bim}
									>
										{hotspot.name}
									</ThemedText>
									<ThemedText
										numberOfLines={1}
										style={styles.colInfo}
										lightColor={textLight}
										darkColor={textDark}
									>
										{hotspot.interface}
									</ThemedText>
									<ThemedText
										numberOfLines={1}
										style={styles.colInfo}
										lightColor={textLight}
										darkColor={textDark}
									>
										{hotspot.profile}
									</ThemedText>
									<ThemedText
										numberOfLines={1}
										style={styles.colInfo}
										lightColor={textLight}
										darkColor={textDark}
									>
										{hotspot.disabled === "true" || hotspot.disabled === true ? translations[language].categories.hotspots.disabled : translations[language].categories.hotspots.enabled}
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
										<TouchableOpacity
											style={{
												backgroundColor: bim,
												paddingVertical: 6,
												paddingHorizontal: 12,
												borderRadius: 8,
											}}
											onPress={() => handleViewHotspotUsers(hotspot)}
										>
											<ThemedText lightColor={whiteLight} darkColor={whiteDark}>
												{translations[language].categories.buttons.viewDetails}
											</ThemedText>
										</TouchableOpacity>
									</ThemedView>
								</ThemedView>
							))}
						</ScrollView>
					</ThemedView>
				</ScrollView>
			</TileContainer>
		</ParallaxScrollView>
	);
}

/**
 * TODO: inside (authenticated)/routers/hotspots/details i need a dynamic route that takes hotspotId and displays hotspot details
 */

const styles = StyleSheet.create({
	statusLabel: {
		fontSize: fontSize['heading.two'],
		fontWeight: fontWeight['heading.two'],
	},
	colTitle: {
		fontSize: fontSize['text.small'],
		width: 120,
		textTransform: 'uppercase',
		paddingRight: 8,
	},
	colInfo: {
		width: 120,
		paddingRight: 8,
		overflow: 'hidden',
	},
});
