import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import TileContainer from '@/components/TileContainer';
import { Colors } from '@/constants/Colors';
import { fontSize, fontWeight } from '@/constants/Font';
import translations from '@/constants/Trans';
import { useGeneral } from '@/context/GeneralContext';
import { useTransaction } from '@/context/TransactionContext';
import { generateRandomInt, msToHms } from '@/helpers';
import useTrackHistory from '@/hooks/useTrackHistory';
import { NetRouter } from '@/types';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

export default function RouterDetailsScreen() {
	const navigation = useNavigation<any>();
	const router = useRouter();
	const { routerId } = useLocalSearchParams() as { routerId?: string };
	const { handleUpdateHistory, language } = useGeneral();
	const { routers } = useTransaction();
	const colorScheme = useColorScheme() ?? 'light';
	const [netRouter, setNetRouter] = useState<NetRouter | undefined>();

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

	useEffect(() => {
		if (routerId && routers) {
			const router = routers.find((r) => r.id === routerId);
			setNetRouter(router);
		}
	}, [routerId, routers]);

	const handleViewHotspotUsers = (hotspotId: string) => {
		if (!hotspotId) return;
		router.push(`/routers/vouchers/${routerId}/${hotspotId}`);
	};
	return (
		<ParallaxScrollView
			headerBackgroundColor={{
				light: Colors.light.background,
				dark: Colors.dark.background,
			}}
			contentStyle={{
				paddingHorizontal: 10,
			}}
			containerStyle={{ flex: 1 }}
		>
			<TileContainer
				id={routerId || 'new-router'}
				backgroundColor={Colors[colorScheme].background}
				style={{
					flexDirection: 'column',
					boxSizing: 'border-box',
					overflow: 'hidden',
					paddingBottom: 10,
					marginHorizontal: 20,
				}}
			>
				<ThemedView
					lightColor={Colors.light.background}
					darkColor={Colors.dark.background}
					style={{ flexDirection: 'column' }}
				>
					<ThemedText
						style={{
							fontSize: fontSize['heading.one'],
							fontWeight: fontWeight['heading.two'],
							marginBottom: 10,
						}}
						lightColor={Colors.light['heading.one']}
						darkColor={Colors.dark['heading.one']}
					>
						{translations[language].categories.routers.routerHash}
					</ThemedText>
					<ThemedText>{netRouter?.networkInfo.routerHash}</ThemedText>
				</ThemedView>
			</TileContainer>
			<TileContainer
				id={routerId || 'new-router-' + generateRandomInt(1000, 9999)}
				backgroundColor={Colors[colorScheme].background}
				style={{
					flexDirection: 'column',
					boxSizing: 'border-box',
					overflow: 'hidden',
					padding: 0,
					marginHorizontal: 20,
				}}
			>
				<ThemedView
					lightColor={Colors.light.background}
					darkColor={Colors.dark.background}
					style={{ flexDirection: 'column', padding: 10 }}
				>
					<ThemedText
						style={{
							fontSize: fontSize['heading.one'],
							fontWeight: fontWeight['heading.two'],
							marginBottom: 10,
						}}
						lightColor={Colors.light['heading.one']}
						darkColor={Colors.dark['heading.one']}
					>
						{translations[language].categories.routers.routerStatus}
					</ThemedText>
					<ThemedView
						lightColor={Colors.light.background}
						darkColor={Colors.dark.background}
						style={{ flexDirection: 'row', alignItems: 'center' }}
					>
						<ThemedText
							lightColor={Colors.light.text}
							darkColor={Colors.dark.text}
							style={styles.statusLabel}
						>
							{`${translations[language].categories.routers.uptime}:`}
						</ThemedText>
						<ThemedText style={{ marginLeft: 10 }}>
							{netRouter?.networkInfo.uptime &&
								msToHms(parseInt(netRouter.networkInfo.uptime))}
						</ThemedText>
					</ThemedView>
					<ThemedView
						lightColor={Colors.light.background}
						darkColor={Colors.dark.background}
						style={{ flexDirection: 'row', alignItems: 'center' }}
					>
						<ThemedText
							lightColor={Colors.light.text}
							darkColor={Colors.dark.text}
							style={styles.statusLabel}
						>
							{`${translations[language].categories.routers.routerOS}:`}
						</ThemedText>
						<ThemedText style={{ marginLeft: 10 }}>
							{netRouter?.hardwareInfo.routerOsVersion}
						</ThemedText>
					</ThemedView>
					<ThemedView
						lightColor={Colors.light.background}
						darkColor={Colors.dark.background}
						style={{ flexDirection: 'row', alignItems: 'center' }}
					>
						<ThemedText
							lightColor={Colors.light.text}
							darkColor={Colors.dark.text}
							style={styles.statusLabel}
						>
							{`${translations[language].categories.routers.freeMemory}:`}
						</ThemedText>
						<ThemedText style={{ marginLeft: 10 }}>
							{netRouter?.hardwareInfo.freeMemory}
						</ThemedText>
					</ThemedView>
					<ThemedView
						lightColor={Colors.light.background}
						darkColor={Colors.dark.background}
						style={{ flexDirection: 'row', alignItems: 'center' }}
					>
						<ThemedText
							lightColor={Colors.light.text}
							darkColor={Colors.dark.text}
							style={styles.statusLabel}
						>
							{`${translations[language].categories.routers.totalMemory}:`}
						</ThemedText>
						<ThemedText style={{ marginLeft: 10 }}>
							{netRouter?.hardwareInfo.totalMemory}
						</ThemedText>
					</ThemedView>
					<ThemedView
						lightColor={Colors.light.background}
						darkColor={Colors.dark.background}
						style={{ flexDirection: 'row', alignItems: 'center' }}
					>
						<ThemedText
							lightColor={Colors.light.text}
							darkColor={Colors.dark.text}
							style={styles.statusLabel}
						>
							{`${translations[language].categories.routers.cpuFrequency}:`}
						</ThemedText>
						<ThemedText style={{ marginLeft: 10 }}>
							{netRouter?.hardwareInfo.cpuFrequency}
						</ThemedText>
					</ThemedView>
					<ThemedView
						lightColor={Colors.light.background}
						darkColor={Colors.dark.background}
						style={{ flexDirection: 'row', alignItems: 'center' }}
					>
						<ThemedText
							lightColor={Colors.light.text}
							darkColor={Colors.dark.text}
							style={styles.statusLabel}
						>
							{`${translations[language].categories.routers.cpuLoad}:`}
						</ThemedText>
						<ThemedText style={{ marginLeft: 10 }}>
							{netRouter?.hardwareInfo.cpuLoad}
						</ThemedText>
					</ThemedView>
				</ThemedView>
			</TileContainer>
			<TileContainer
				id={routerId || 'new-router-' + generateRandomInt(1000, 9999)}
				backgroundColor={Colors[colorScheme].background}
				style={{
					flexDirection: 'column',
					boxSizing: 'border-box',
					overflow: 'hidden',
					padding: 0,
					marginHorizontal: 20,
				}}
			>
				<ThemedView
					lightColor={Colors.light.background}
					darkColor={Colors.dark.background}
					style={{
						flexDirection: 'row',
						paddingHorizontal: 10,
						paddingTop: 10,
					}}
				>
					<ThemedText
						lightColor={Colors.light.text}
						darkColor={Colors.dark.text}
						numberOfLines={1}
					>
						<ThemedText
							lightColor={Colors.light.text}
							darkColor={Colors.dark.text}
							style={{
								fontWeight: fontWeight['heading.three'],
								fontSize: fontSize['heading.two'],
							}}
						>
							{`${translations[language].categories.routers.hotspotsTitle}: `}
						</ThemedText>
						<ThemedText
							lightColor={Colors.light.text}
							darkColor={Colors.dark.text}
							style={{
								fontWeight: fontWeight['heading.two'],
								fontSize: fontSize['heading.two'],
							}}
						>
							{netRouter?.name}
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
						lightColor={Colors.light.background}
						darkColor={Colors.dark.background}
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
								borderBottomColor: Colors[colorScheme].borderDark,
							}}
							lightColor={Colors.light.titleBg}
							darkColor={Colors.dark.titleBg}
						>
							<ThemedText
								style={{ width: 30 }}
								lightColor={Colors.light.text}
								darkColor={Colors.dark.text}
							>
								{translations[language].categories.routers.id}
							</ThemedText>
							<ThemedText
								numberOfLines={1}
								ellipsizeMode='tail'
								style={styles.colTitle}
								lightColor={Colors.light.text}
								darkColor={Colors.dark.text}
							>
								{translations[language].categories.routers.hotspotName}
							</ThemedText>
							<ThemedText
								numberOfLines={1}
								ellipsizeMode='tail'
								style={styles.colTitle}
								lightColor={Colors.light.text}
								darkColor={Colors.dark.text}
							>
								{translations[language].categories.routers.interface}
							</ThemedText>
							<ThemedText
								numberOfLines={1}
								ellipsizeMode='tail'
								style={styles.colTitle}
								lightColor={Colors.light.text}
								darkColor={Colors.dark.text}
							>
								{translations[language].categories.routers.profile}
							</ThemedText>
							<ThemedText
								numberOfLines={1}
								ellipsizeMode='tail'
								style={styles.colTitle}
								lightColor={Colors.light.text}
								darkColor={Colors.dark.text}
							>
								{translations[language].categories.routers.status}
							</ThemedText>
							<ThemedText
								numberOfLines={1}
								ellipsizeMode='tail'
								style={[styles.colTitle, { textAlign: 'center' }]}
								lightColor={Colors.light.text}
								darkColor={Colors.dark.text}
							>
								{translations[language].categories.routers.actions}
							</ThemedText>
						</ThemedView>
						<ScrollView
							nativeID={`hotspot-list-details-${routerId}`}
							style={{
								flexDirection: 'column',
								backgroundColor: Colors[colorScheme].background,
							}}
						>
							{netRouter?.networkInfo.hotspots.map((hotspot, index) => (
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
											index % 2 === 0
												? Colors[colorScheme].listItemBackground
												: Colors[colorScheme].background,
										borderBottomWidth: index < routers.length - 1 ? 1 : 0,
										borderBottomColor: Colors[colorScheme].borderDark,
									}}
									lightColor={Colors.light.background}
									darkColor={Colors.dark.background}
								>
									<ThemedText
										numberOfLines={1}
										style={{
											width: 30,
											overflow: 'hidden',
											paddingRight: 8,
										}}
										lightColor={Colors.light.text}
										darkColor={Colors.dark.text}
									>
										{index + 1}
									</ThemedText>
									<ThemedText
										numberOfLines={1}
										style={styles.colInfo}
										lightColor={Colors.light.bim}
										darkColor={Colors.dark.bim}
									>
										{hotspot.ssid}
									</ThemedText>
									<ThemedText
										numberOfLines={1}
										style={styles.colInfo}
										lightColor={Colors.light.text}
										darkColor={Colors.dark.text}
									>
										{hotspot.interface}
									</ThemedText>
									<ThemedText
										numberOfLines={1}
										style={styles.colInfo}
										lightColor={Colors.light.text}
										darkColor={Colors.dark.text}
									>
										{hotspot.profile}
									</ThemedText>
									<ThemedText
										numberOfLines={1}
										style={styles.colInfo}
										lightColor={Colors.light.text}
										darkColor={Colors.dark.text}
									>
										{hotspot.status}
									</ThemedText>
									<ThemedView
										style={{
											flexDirection: 'row',
											justifyContent: 'space-between',
											gap: 5,
											width: 120,
										}}
										lightColor={Colors.light.background}
										darkColor={Colors.dark.background}
									>
										<TouchableOpacity
											style={{
												backgroundColor: Colors[colorScheme].bim,
												paddingVertical: 6,
												paddingHorizontal: 12,
												borderRadius: 8,
											}}
											onPress={() => handleViewHotspotUsers(hotspot.id)}
										>
											<ThemedText
												lightColor={Colors.light.white}
												darkColor={Colors.dark.white}
											>
												{translations[language].categories.buttons.viewUsers}
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
