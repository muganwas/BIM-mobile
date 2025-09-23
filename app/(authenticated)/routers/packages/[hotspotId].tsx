import ParallaxScrollView from '@/components/ParallaxScrollView';
import Prompt from '@/components/Prompt';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import TileContainer from '@/components/TileContainer';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { fontSize, fontWeight } from '@/constants/Font';
import translations from '@/constants/Trans';
import { useGeneral } from '@/context/GeneralContext';
import { useTransaction } from '@/context/TransactionContext';
import * as factories from '@/helpers/factories';
import useTrackHistory from '@/hooks/useTrackHistory';
import { InternetPackage } from '@/types';
import InternetPackageOverlay, {
	InternetPackageOverlayMode,
} from '@/views/InternetPackageOverlay';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
	Animated,
	StyleSheet,
	TouchableOpacity,
	useColorScheme,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

export default function HotspotPackagesScreen() {
	const navigation = useNavigation<any>();
	const { hotspotId } = useLocalSearchParams() as { hotspotId?: string };
	const { handleUpdateHistory, user, language } = useGeneral();
	const { packages, setPackages, fetchPackages, routers } = useTransaction();
	const colorScheme = useColorScheme() ?? 'light';

	const [hotspotName, setHotspotName] = useState<string>('');
	const [showOverlay, setShowOverlay] = useState(false);
	const [overlayMode, setOverlayMode] =
		useState<InternetPackageOverlayMode>('create');
	const [selectedPkg, setSelectedPkg] = useState<InternetPackage | undefined>(
		undefined
	);
	const overlayFadeAnim = useRef(new Animated.Value(0)).current;

	const [showPrompt, setShowPrompt] = useState(false);
	const promptFadeAnim = useRef(new Animated.Value(0)).current;

	// Build and track path
	const trackPath = useMemo(() => {
		return hotspotId
			? `/(authenticated)/routers/packages/${hotspotId}`
			: '/(authenticated)/routers/packages';
	}, [hotspotId]);
	useTrackHistory(trackPath);

	// Seed parent entry for history
	useEffect(() => {
		handleUpdateHistory('/(authenticated)/packages');
		handleUpdateHistory(trackPath);
	}, [handleUpdateHistory, trackPath]);

	useEffect(() => {
		navigation.setOptions({
			headerProps: { goback: true },
		});
	}, [navigation]);

	useEffect(() => {
		// Ensure packages are loaded
		if (user && packages.length === 0) {
			(async () => {
				await fetchPackages(user);
			})();
		}
	}, [user, packages, fetchPackages]);

	useEffect(() => {
		if (!hotspotId || !routers) return;
		// Find hotspot across all routers to display its name
		for (const r of routers) {
			const hs = r.networkInfo.hotspots.find((h) => h.id === hotspotId);
			if (hs) {
				setHotspotName(hs.ssid);
				break;
			}
		}
	}, [hotspotId, routers]);

	const t = translations[language]?.categories as any;

	const headers: {
		key: keyof InternetPackage | 'actions';
		label: string;
		width?: number;
		textAlign?: 'left' | 'center' | 'right';
	}[] = [
		{ key: 'name', label: t.dashboard.name, width: 120 },
		{ key: 'usersPerDevice', label: t.packages.usersPerDevice, width: 140 },
		{ key: 'bandwidth', label: t.packages.bandwidth, width: 140 },
		{ key: 'duration', label: t.packages.durationHours, width: 140 },
		{
			key: 'actions',
			label: t.dashboard.actions,
			width: 120,
			textAlign: 'center',
		},
	];

	const handleCreateNew = () => {
		setOverlayMode('create');
		setSelectedPkg(undefined);
		setShowOverlay(true);
	};
	const handleView = (pkg: InternetPackage) => {
		setOverlayMode('view');
		setSelectedPkg(pkg);
		setShowOverlay(true);
	};
	const handleEdit = (pkg: InternetPackage) => {
		setOverlayMode('edit');
		setSelectedPkg(pkg);
		setShowOverlay(true);
	};
	const handleDelete = (pkg: InternetPackage) => {
		setSelectedPkg(pkg);
		setShowPrompt(true);
	};

	const handleSubmitOverlay = (payload: {
		name: string;
		usersPerDevice: number;
		bandwidth: string;
		duration: number;
	}) => {
		const allowedNames = ['short', 'daily', 'weekly', 'monthly'] as const;
		type AllowedName = (typeof allowedNames)[number];
		const toPkgName = (s: string): AllowedName => {
			const v = (s || '').trim().toLowerCase() as AllowedName;
			return allowedNames.includes(v) ? v : 'short';
		};
		if (overlayMode === 'create') {
			const created = factories.generateInternetPackage({
				name: toPkgName(payload.name),
				usersPerDevice: payload.usersPerDevice,
				bandwidth: payload.bandwidth,
				duration: payload.duration,
			});
			setPackages((prev) => [created, ...prev]);
		} else if (overlayMode === 'edit' && selectedPkg) {
			setPackages((prev) =>
				prev.map((p) =>
					p.id === selectedPkg.id
						? {
								...p,
								name: toPkgName(payload.name),
								usersPerDevice: payload.usersPerDevice,
								bandwidth: payload.bandwidth,
								duration: payload.duration,
								updatedAt: new Date(),
						  }
						: p
				)
			);
		}
		setShowOverlay(false);
		setSelectedPkg(undefined);
	};

	const confirmDelete = () => {
		if (!selectedPkg) return setShowPrompt(false);
		setPackages((prev) => prev.filter((p) => p.id !== selectedPkg.id));
		setShowPrompt(false);
		setSelectedPkg(undefined);
	};

	return (
		<>
			<ParallaxScrollView
				headerBackgroundColor={{
					light: Colors.light.background,
					dark: Colors.dark.background,
				}}
				contentStyle={{ paddingHorizontal: 10 }}
				containerStyle={{ flex: 1 }}
			>
				<ThemedView
					style={{ flexDirection: 'column', gap: 10, marginBottom: 10 }}
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
							fontWeight: fontWeight['heading.one'],
						}}
					>
						{t.packages.packagesOnHotspot.replace(
							'{hotspotName}',
							hotspotName || ''
						)}
					</ThemedText>
					<ThemedView
						style={{ width: '100%', alignItems: 'flex-end' }}
						lightColor={Colors.light.background}
						darkColor={Colors.dark.background}
					>
						<ThemedButton
							title={t.buttons.createNewPackage.toUpperCase()}
							onPress={handleCreateNew}
							numberOfLines={1}
							style={{ borderRadius: 8, width: 230 }}
							darkColor={Colors.dark.actionButton}
							lightColor={Colors.light.actionButton}
							darkTextColor={Colors.dark.authButtonText}
							lightTextColor={Colors.light.authButtonText}
						/>
					</ThemedView>
				</ThemedView>

				<TileContainer
					id={hotspotId || 'hotspot-packages'}
					backgroundColor={Colors[colorScheme].background}
					style={{
						flexDirection: 'column',
						boxSizing: 'border-box',
						overflow: 'hidden',
						padding: 0,
					}}
				>
					<ScrollView
						style={{ width: '100%' }}
						horizontal
						showsHorizontalScrollIndicator
					>
						<ThemedView
							style={{ flexDirection: 'column' }}
							lightColor={Colors.light.background}
							darkColor={Colors.dark.background}
						>
							<ThemedView
								id={`hotspot-packages-header-${hotspotId}`}
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
								{headers.map((col) => (
									<ThemedText
										key={`hdr-${col.key}`}
										numberOfLines={1}
										ellipsizeMode='tail'
										style={{
											fontSize: fontSize['text.medium'],
											width: col.width ?? 120,
											textTransform: 'uppercase',
											paddingRight: 8,
											...(col.textAlign ? { textAlign: col.textAlign } : {}),
										}}
										lightColor={Colors.light.text}
										darkColor={Colors.dark.text}
									>
										{col.label}
									</ThemedText>
								))}
							</ThemedView>
							<ScrollView
								nativeID={`hotspot-packages-details-${hotspotId}`}
								style={{
									flexDirection: 'column',
									backgroundColor: Colors[colorScheme].background,
								}}
							>
								{packages.map((p, index) => (
									<ThemedView
										key={p.id ?? `${p.tag}-${index}`}
										style={{
											flexDirection: 'row',
											width: '100%',
											alignItems: 'center',
											paddingVertical: 5,
											gap: 10,
											paddingHorizontal: 10,
											justifyContent: 'space-between',
											backgroundColor:
												index % 2 === 0
													? Colors[colorScheme].listItemBackground
													: Colors[colorScheme].background,
											borderBottomWidth: index < packages.length - 1 ? 1 : 0,
											borderBottomColor: Colors[colorScheme].borderDark,
										}}
										lightColor={Colors.light.background}
										darkColor={Colors.dark.background}
									>
										<ThemedText
											numberOfLines={1}
											style={styles.colInfo}
											lightColor={Colors.light.text}
											darkColor={Colors.dark.text}
										>
											{p.name}
										</ThemedText>
										<ThemedText
											numberOfLines={1}
											style={styles.colInfo}
											lightColor={Colors.light.text}
											darkColor={Colors.dark.text}
										>
											{p.usersPerDevice}
										</ThemedText>
										<ThemedText
											numberOfLines={1}
											style={styles.colInfo}
											lightColor={Colors.light.text}
											darkColor={Colors.dark.text}
										>
											{p.bandwidth}
										</ThemedText>
										<ThemedText
											numberOfLines={1}
											style={styles.colInfo}
											lightColor={Colors.light.text}
											darkColor={Colors.dark.text}
										>
											{p.duration}
										</ThemedText>
										<ThemedView
											style={{
												flexDirection: 'row',
												justifyContent: 'space-between',
												gap: 5,
												width: 120,
											}}
											lightColor='transparent'
											darkColor='transparent'
										>
											<TouchableOpacity
												style={{ paddingVertical: 6 }}
												onPress={() => handleView(p)}
											>
												<IconSymbol
													name='eye.outline'
													size={20}
													color={Colors[colorScheme].lime}
												/>
											</TouchableOpacity>
											<TouchableOpacity
												style={{ paddingVertical: 6 }}
												onPress={() => handleEdit(p)}
											>
												<IconSymbol
													name='edit.outline'
													size={20}
													color={Colors[colorScheme].yellow}
												/>
											</TouchableOpacity>
											<TouchableOpacity
												style={{ paddingVertical: 6 }}
												onPress={() => handleDelete(p)}
											>
												<IconSymbol
													name='delete.outline'
													size={20}
													color={Colors[colorScheme].error}
												/>
											</TouchableOpacity>
										</ThemedView>
									</ThemedView>
								))}
							</ScrollView>
						</ThemedView>
					</ScrollView>
				</TileContainer>
			</ParallaxScrollView>

			<InternetPackageOverlay
				visible={showOverlay}
				fadeAnim={overlayFadeAnim}
				mode={overlayMode}
				initial={selectedPkg}
				onClose={() => {
					setShowOverlay(false);
					setSelectedPkg(undefined);
				}}
				onSubmit={handleSubmitOverlay}
			/>
			<Prompt
				id='delete-internet-package'
				fadeAnim={promptFadeAnim}
				onClose={() => setShowPrompt(false)}
				visible={showPrompt}
				title={t.dashboard.confirmDeleteTitle}
				message={t.packages.deleteMessage}
				buttons={[
					{
						title: t.buttons.cancel,
						color: Colors[colorScheme].cancelButton,
						textColor: Colors[colorScheme].white,
						action: () => setShowPrompt(false),
					},
					{
						title: t.buttons.delete,
						color: Colors[colorScheme].dangerButton,
						textColor: Colors[colorScheme].white,
						action: confirmDelete,
					},
				]}
			/>
		</>
	);
}

const styles = StyleSheet.create({
	colInfo: {
		width: 120,
		paddingRight: 8,
		overflow: 'hidden',
	},
});
