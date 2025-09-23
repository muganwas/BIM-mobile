import { ThemedButton } from '@/components/ThemedButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import TileContainer from '@/components/TileContainer';
import { Colors } from '@/constants/Colors';
import { fontSize, fontWeight } from '@/constants/Font';
import translations from '@/constants/Trans';
import { useGeneral } from '@/context/GeneralContext';
import { useTransaction } from '@/context/TransactionContext';
import useTrackHistory from '@/hooks/useTrackHistory';
import { NetRouter } from '@/types';
import {
	useFocusEffect,
	useLocalSearchParams,
	useNavigation,
	useRouter,
} from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

export default function VouchersHotspotScreen() {
	const colorScheme = useColorScheme() ?? 'light';
	const navigation = useNavigation();
	const router = useRouter();
	const { vRId } = useLocalSearchParams() as { vRId?: string };
	// memoize the path so useTrackHistory doesn't receive a new string each render
	const trackPath = useMemo(() => {
		return vRId ? '/(authenticated)/routers/vouchers/' + vRId : undefined;
	}, [vRId]);
	useTrackHistory(trackPath);
	const { packages, fetchPackages, routers } = useTransaction();
	const { user, language, handleUpdateHistory } = useGeneral();
	const [currentRouter, setCurrentRouter] = React.useState<NetRouter>();

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

	useEffect(() => {
		if (user && packages.length === 0) {
			(async () => {
				await fetchPackages(user);
			})();
		}
	}, [user, packages, fetchPackages]);

	useEffect(() => {
		if (vRId && routers) {
			const found = routers.find((r) => r.id === vRId);
			setCurrentRouter(found);
		}
	}, [vRId, routers]);

	return (
		<ThemedView
			lightColor={Colors.light.background}
			darkColor={Colors.dark.background}
			style={styles.container}
		>
			<ThemedView
				style={{ flexDirection: 'column', gap: 5, marginBottom: 10 }}
				lightColor={Colors.light.background}
				darkColor={Colors.dark.background}
			>
				<ThemedText
					lightColor={Colors.light.text}
					darkColor={Colors.dark.text}
					style={{
						width: '100%',
						textTransform: 'capitalize',
						fontSize: fontSize['heading.one'],
						fontWeight: fontWeight['heading.three'],
					}}
				>
					{translations[language].categories.hotspots.title}
					<ThemedText
						lightColor={Colors.light.text}
						darkColor={Colors.dark.text}
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
				backgroundColor={Colors[colorScheme].background}
				style={{
					flexDirection: 'column',
					overflow: 'hidden',
					boxSizing: 'border-box',
				}}
			>
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
							id={packageRouterHotspotsListHeaderId.current}
							style={{
								flexDirection: 'row',
								justifyContent: 'space-between',
								gap: 10,
								paddingHorizontal: 5,
								paddingVertical: 10,
								borderBottomWidth: 1,
								borderBottomColor: Colors[colorScheme].borderDark,
							}}
							lightColor={Colors.light.background}
							darkColor={Colors.dark.background}
						>
							<ThemedText
								style={{
									fontSize: fontSize['text.medium'],
									width: 120,
									textTransform: 'uppercase',
									paddingRight: 8,
								}}
								lightColor={Colors.light.text}
								darkColor={Colors.dark.text}
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
								lightColor={Colors.light.text}
								darkColor={Colors.dark.text}
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
								lightColor={Colors.light.text}
								darkColor={Colors.dark.text}
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
								lightColor={Colors.light.text}
								darkColor={Colors.dark.text}
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
								lightColor={Colors.light.text}
								darkColor={Colors.dark.text}
							>
								{translations[language].categories.dashboard.actions}
							</ThemedText>
						</ThemedView>
						<ScrollView
							id={packageRouterHotspotsListDetailsId.current}
							style={{
								flexDirection: 'column',
								backgroundColor: Colors[colorScheme].background,
							}}
						>
							<ThemedView
								style={{ flexDirection: 'column', gap: 5 }}
								lightColor={Colors.light.background}
								darkColor={Colors.dark.background}
							>
								{currentRouter?.networkInfo.hotspots.map((hotspot, index) => (
									<ThemedView
										key={index}
										style={{
											flexDirection: 'row',
											width: '100%',
											alignItems: 'center',
											paddingVertical: 5,
											paddingHorizontal: 5,
											backgroundColor:
												index % 2 === 0
													? Colors[colorScheme].listItemBackground
													: Colors[colorScheme].background,
											justifyContent: 'space-between',
										}}
										lightColor={Colors.light.background}
										darkColor={Colors.dark.background}
									>
										<ThemedText
											numberOfLines={1}
											style={{
												width: 120,
												paddingRight: 8,
												overflow: 'hidden',
											}}
											lightColor={Colors.light.bim}
											darkColor={Colors.dark.bim}
										>
											{hotspot.ssid.toUpperCase()}
										</ThemedText>
										<ThemedText
											numberOfLines={1}
											style={{
												paddingRight: 8,
												width: 120,
											}}
											lightColor={Colors.light.text}
											darkColor={Colors.dark.text}
										>
											{hotspot.interface}
										</ThemedText>
										<ThemedText
											numberOfLines={1}
											style={{
												paddingRight: 8,
												width: 120,
											}}
											lightColor={Colors.light.text}
											darkColor={Colors.dark.text}
										>
											{hotspot.profile}
										</ThemedText>
										<ThemedText
											numberOfLines={1}
											style={{
												paddingRight: 8,
												width: 120,
											}}
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
											<ThemedButton
												title={translations[
													language
												].categories.buttons.viewVouchers.toUpperCase()}
												numberOfLines={1}
												onPress={() =>
													router.push(
														`/(authenticated)/routers/vouchers/${vRId}/${hotspot.id}`
													)
												}
												lightColor={Colors.light.bim}
												darkColor={Colors.dark.bim}
												darkTextColor={Colors.dark.white}
												lightTextColor={Colors.light.white}
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
		</ThemedView>
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
