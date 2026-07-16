import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import TileContainer from '@/components/TileContainer';
import { fontSize, fontWeight } from '@/constants/Font';
import translations from '@/constants/Trans';
import { useGeneral } from '@/context/GeneralContext';
import { useSecurity } from '@/context/SecurityContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import useTrackHistory from '@/hooks/useTrackHistory';
import GenerateWireguardKey from '@/views/GenerateWireguardKey';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Animated, GestureResponderEvent, RefreshControl, StyleSheet, useAnimatedValue } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SFSymbols6_0 } from 'sf-symbols-typescript';

export default function ConnectorLayout() {
	useTrackHistory('/(authenticated)/connector');
	const fadeAnim = useAnimatedValue(0);
	const { user, language, authToken } = useGeneral();
	const bg = useThemeColor({}, 'background');
	const backgroundLight = useThemeColor({}, 'background', 'light');
	const backgroundDark = useThemeColor({}, 'background', 'dark');
	const textColor = useThemeColor({}, 'text');
	const titleBg = useThemeColor({}, 'titleBg');
	const white = useThemeColor({}, 'white');
	const bim = useThemeColor({}, 'bim');
	const error = useThemeColor({}, 'error');
	const lime = useThemeColor({}, 'lime');
	const listItemBackground = useThemeColor({}, 'listItemBackground');
	const borderDark = useThemeColor({}, 'borderDark');
	const { wireguardKeys, loading, setLoading, fetchWireguardKeys, createWireguardKey, deleteWireguardKey } = useSecurity();

	const [showGenerateKeyModal, setShowGenerateKeyModal] = useState(false);

	const handleRefresh = useCallback(async () => {
		setLoading(true);
		try {
			await fetchWireguardKeys();
		} catch (e) {
			console.error('[WireguardKeysScreen] refresh failed', e);
		} finally {
			setLoading(false);
		}
	}, [fetchWireguardKeys, setLoading]);

	const wireguardKeyListDetailsId = useRef(
		`wireguard-key-list-details-${Math.random().toString(36).slice(2)}`
	);

	const wireguardKeyListId = useRef(
		`wireguard-key-list-${Math.random().toString(36).slice(2)}`
	);
	const wireguardKeyListHeaderId = useRef(
		`wireguard-key-list-header-${Math.random().toString(36).slice(2)}`
	);
	const connectorsHeader = useMemo(
		() => [
			{
				key: 'id',
				label: translations[language].categories.connector.id,
				width: 50,
			},
			{
				key: 'keyName',
				label: translations[language].categories.connector.keyName,
				width: 120,
			},
			{
				key: 'routerPublicKey',
				label: translations[language].categories.connector.routerPublicKey,
				width: 120,
			},
			{
				key: 'serverPublicKey',
				label: translations[language].categories.connector.serverPublicKey,
				width: 120,
			},
			{
				key: 'endpointPort',
				label: translations[language].categories.connector.endpointPort,
				width: 120,
				textAlign: 'center' as const,
			},
			{
				key: 'ipAddress',
				label: translations[language].categories.connector.ipAddress,
				width: 120,
			},
			{
				key: 'status',
				label: translations[language].categories.connector.status,
				width: 120,
				textAlign: 'center' as const,
			},
			{
				key: 'actions',
				label: translations[language].categories.connector.actions,
				width: 240,
				textAlign: 'center' as const,
			}
		],
		[language]
	);

	const toggleGenerateKeyModal = (v?: boolean) => {
		// use fadeAnim to animate the modal in/out
		if (v === undefined) {
			Animated.timing(fadeAnim, {
				toValue: showGenerateKeyModal ? 0 : 1,
				duration: 300,
				useNativeDriver: true,
			}).start(() => {
				setShowGenerateKeyModal(!showGenerateKeyModal);
			});
		} else {
			setShowGenerateKeyModal(v);
			Animated.timing(fadeAnim, {
				toValue: v ? 1 : 0,
				duration: 300,
				useNativeDriver: true,
			}).start();
		}
	}

	const handleGenerateKey = async (keyName: string, address?: string, port?: number) => {
		setLoading(true);
		try {
			await createWireguardKey(keyName, address, port);
		} catch (e) {
			console.error('handleGenerateKey: failed', e);
		} finally {
			setLoading(false);
		}
	}

	const onRefresh = async () => {
		setLoading(true);
		try {
			await fetchWireguardKeys();
		} catch (e) {
			console.error('[ConnectorLayout] refresh failed', e);
		} finally {
			setLoading(false);
		}
	}

	const onDeleteKey = async (id: string) => {
		setLoading(true);
		try {
			await deleteWireguardKey(id);
		} catch (e) {
			console.error('[ConnectorLayout] delete key failed', e);
		} finally {
			setLoading(false);
		}
	}

	return (
		<>
			<ParallaxScrollView
				onRefresh={onRefresh}
				refreshing={loading}
				headerBackgroundColor={{
					light: backgroundLight,
					dark: backgroundDark,
				}}
				containerStyle={styles.container}
				contentStyle={{ paddingHorizontal: 10 }}
				onTouchStart={(e: GestureResponderEvent) => {
					e.stopPropagation(); // Prevent touch events from propagating to the drawer
				}}
			>
				<ThemedView
					style={{ flexDirection: 'column', gap: 5, marginBottom: 10 }}
					lightColor={bg}
					darkColor={bg}
				>
					<ThemedText
						lightColor={textColor}
						darkColor={textColor}
						style={{
							fontSize: fontSize['heading.two'],
							fontWeight: fontWeight['heading.three'],
							marginBottom: 8,
						}}
					>
						{translations[language].categories.connector.title}
					</ThemedText>
				</ThemedView>
				<ThemedView style={{
					flexDirection: 'row',
					justifyContent: 'flex-end',
					marginBottom: 10,
				}}>
					<ThemedButton
						title={translations[language].categories.connector.newKeyButton.toUpperCase()}
						onPress={() => toggleGenerateKeyModal()}
						lightColor={bim}
						darkColor={bim}
						darkTextColor={white}
						lightTextColor={white}
						icon={'plus' as SFSymbols6_0}
					/>
				</ThemedView>
				<TileContainer
					id={wireguardKeyListId.current}
					backgroundColor={bg}
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
							lightColor={bg}
							darkColor={bg}
						>
							<ThemedView
								id={wireguardKeyListHeaderId.current}
								style={{
									flexDirection: 'row',
									justifyContent: 'space-between',
									gap: 10,
									paddingHorizontal: 10,
									paddingVertical: 10,
									borderBottomWidth: 1,
									borderBottomColor: borderDark,
								}}
								lightColor={titleBg}
								darkColor={titleBg}
							>
								{connectorsHeader.map((col) => (
									<ThemedText
										key={`hdr-${col.key}`}
										numberOfLines={1}
										ellipsizeMode='tail'
										style={{
											fontSize: fontSize['text.medium'],
											width: col.width,
											textTransform: 'uppercase',
											paddingRight: 8,
											...(col.textAlign ? { textAlign: col.textAlign } : {}),
										}}
										lightColor={textColor}
										darkColor={textColor}
									>
										{col.label}
									</ThemedText>
								))}
							</ThemedView>
							<ScrollView
								id={wireguardKeyListDetailsId.current}
								style={{
									flexDirection: 'column',
									backgroundColor: bg,
								}}
								refreshControl={<RefreshControl refreshing={loading} onRefresh={handleRefresh} />}
							>
								{wireguardKeys.map((key, index) => (
									<ThemedView
										key={index}
										style={{
											flexDirection: 'row',
											width: '100%',
											alignItems: 'center',
											paddingVertical: 5,
											paddingHorizontal: 10,
											backgroundColor: index % 2 === 0 ? listItemBackground : bg,
											justifyContent: 'space-between',
											borderBottomWidth: index < wireguardKeys.length - 1 ? 1 : 0,
											borderBottomColor: borderDark,
										}}
										lightColor={bg}
										darkColor={bg}
									>
										<ThemedText
											numberOfLines={1}
											style={{
												width: 50,
												paddingRight: 8,
												overflow: 'hidden',
											}}
											lightColor={textColor}
											darkColor={textColor}
										>
											{key.id}
										</ThemedText>
										<ThemedText
											numberOfLines={1}
											style={{
												width: 120,
												paddingRight: 8,
												overflow: 'hidden',
											}}
											lightColor={textColor}
											darkColor={textColor}
										>
											{key.key_name}
										</ThemedText>
										<ThemedText
											numberOfLines={1}
											style={{
												width: 120,
												paddingRight: 8,
												overflow: 'hidden',
											}}
											lightColor={textColor}
											darkColor={textColor}
										>
											{key.router_public_key}
										</ThemedText>
										<ThemedText
											numberOfLines={1}
											style={{
												width: 120,
												paddingRight: 8,
												overflow: 'hidden',
											}}
											lightColor={textColor}
											darkColor={textColor}
										>
											{key.server_public_key}
										</ThemedText>
										<ThemedText
											numberOfLines={1}
											style={{
												width: 120,
												paddingRight: 8,
												overflow: 'hidden',
												textAlign: 'center',
											}}
											lightColor={textColor}
											darkColor={textColor}
										>
											{key.endpoint_port}
										</ThemedText>
										<ThemedText
											numberOfLines={1}
											style={{
												width: 120,
												paddingRight: 8,
												overflow: 'hidden',
											}}
											lightColor={textColor}
											darkColor={textColor}
										>
											{key.ip_address}
										</ThemedText>
										<ThemedView
											style={{
												width: 120,
												paddingRight: 8,
												justifyContent: 'center',
												alignItems: 'center',
											}}
											lightColor='transparent'
											darkColor='transparent'
										>
											<ThemedText
												numberOfLines={1}
												style={{
													overflow: 'hidden',
													textAlign: 'center',
													paddingVertical: 5,
													paddingHorizontal: 5,
													borderRadius: 5,
													fontWeight: 'bold',
													backgroundColor: key.status === 'active' ? lime : key.status === 'inactive' || key.status === 'pending' ? error : bim,
												}}
												lightColor={white}
												darkColor={white}
											>
												{key.status}
											</ThemedText>
										</ThemedView>

										<ThemedView
											style={{
												flexDirection: 'row',
												justifyContent: 'space-between',
												gap: 5,
												width: 240,
											}}
											lightColor='transparent'
											darkColor='transparent'
										>
											<ThemedButton
												title={translations[
													language
												].categories.connector.view.toUpperCase()}
												onPress={() => { }}
												lightColor={white}
												darkColor={white}
												darkTextColor={bim}
												lightTextColor={bim}
												style={{ flex: 1, borderWidth: 2, borderColor: titleBg, borderRadius: 5 }}
												icon={'eye.fill' as SFSymbols6_0}
											/>
											<ThemedButton
												title={translations[
													language
												].categories.connector.delete.toUpperCase()}
												onPress={() => onDeleteKey(key.id)}
												lightColor={white}
												darkColor={white}
												darkTextColor={error}
												lightTextColor={error}
												style={{ flex: 1, borderWidth: 1, borderColor: error, borderRadius: 5 }}
												icon={'delete.fill' as SFSymbols6_0}
											/>
										</ThemedView>
									</ThemedView>
								))}
							</ScrollView>
						</ThemedView>
					</ScrollView>
				</TileContainer>
			</ParallaxScrollView>
			<GenerateWireguardKey
				fadeAnim={fadeAnim}
				toggleVisible={toggleGenerateKeyModal}
				generateWireguardKeys={({ name, endpointAddress, endpointPort }) => handleGenerateKey(name, endpointAddress, endpointPort)}
				visible={showGenerateKeyModal}
			/>
		</>
	)
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
