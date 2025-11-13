import ParallaxScrollView from '@/components/ParallaxScrollView';
import Prompt from '@/components/Prompt';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import TileContainer from '@/components/TileContainer';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { fontSize, fontWeight } from '@/constants/Font';
import translations from '@/constants/Trans';
import { useGeneral } from '@/context/GeneralContext';
import { useTransaction } from '@/context/TransactionContext';
import { generateRandomInt, translateWithVariables } from '@/helpers';
import { useThemeColor } from '@/hooks/useThemeColor';
import useTrackHistory from '@/hooks/useTrackHistory';
import { Hotspot, NetRouter } from '@/types';
import CreateVouchers from '@/views/CreateVouchers';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
	Animated,
	StyleSheet,
	TouchableOpacity,
	useAnimatedValue,
	useColorScheme,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

export default function HotspotVouchersScreen() {
	const promptFadeAnim = useAnimatedValue(0);
	const createVouchersFadeAnim = useAnimatedValue(0);
	const affirmAction = useRef<() => void | null>(null);
	const navigation = useNavigation<any>();
	const { vRId, hotspotId } = useLocalSearchParams() as {
		vRId?: string;
		hotspotId?: string;
	};
	const { handleUpdateHistory, language } = useGeneral();
	const { routers } = useTransaction();
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
	const lime = useThemeColor({}, 'lime');
	const yellow = useThemeColor({}, 'yellow');
	const error = useThemeColor({}, 'error');
	const cancelButton = useThemeColor({}, 'cancelButton');
	const dangerButton = useThemeColor({}, 'dangerButton');
	const white = useThemeColor({}, 'white');
	const [netRouter, setNetRouter] = useState<NetRouter | undefined>();
	const [hotSpot, setHotSpot] = useState<Hotspot | undefined>();
	const [showPrompt, setShowPrompt] = useState(false);
	const [promptTitle, setPromptTitle] = useState('');
	const [promptMessage, setPromptMessage] = useState('');
	const [promptConfirmText, setPromptConfirmText] = useState('');
	const [showCreateVouchers, setShowCreateVouchers] = useState(false);
	const [multipleVouchers, setMultipleVouchers] = useState(false);
	const [editVoucherCode, setEditVoucherCode] = useState<string | null>(null);

	// Seed parent immediately on mount to guarantee ordering before current route push
	useEffect(() => {
		if (!vRId) return;
		handleUpdateHistory('/(authenticated)/routers/vouchers/' + vRId);
	}, [handleUpdateHistory, vRId]);

	// Track current route after parent seeding is registered
	useTrackHistory(
		hotspotId && vRId
			? `/(authenticated)/routers/vouchers/${vRId}/${hotspotId}`
			: '/(authenticated)/routers/vouchers'
	);

	useEffect(() => {
		navigation.setOptions({
			headerProps: {
				goback: true,
			},
		});
	}, [navigation]);

	useEffect(() => {
		if (vRId && hotspotId && routers) {
			const router = routers.find((r) => r.id === vRId);
			setNetRouter(router);
			const hotspot = router?.networkInfo.hotspots.find(
				(h) => h.id === hotspotId
			);
			setHotSpot(hotspot);
		}
	}, [vRId, hotspotId, routers]);

	const handleEditUserDetails = (voucher: string) => {
		if (!voucher || !hotSpot) return;
		// Always reset to single-voucher mode for edits
		setMultipleVouchers(false);
		setEditVoucherCode(voucher);
		toggleShowCreateVouchers(true);
	};

	const handleDeleteUser = (v: string) => {
		if (!v) return;
		// Update router logic here
	};

	const handleBlockUser = (v: string) => {
		if (!v) return;
		// Update router logic here
	};

	const toggleShowPrompt = (show?: boolean) => {
		const toValue = show ?? !showPrompt;
		if (toValue) {
			Animated.timing(promptFadeAnim, {
				toValue: 1,
				duration: 300,
				useNativeDriver: true,
			}).start(() => {
				setShowPrompt(true);
			});
		} else {
			Animated.timing(promptFadeAnim, {
				toValue: 0,
				duration: 300,
				useNativeDriver: true,
			}).start(() => {
				setShowPrompt(false);
			});
		}
	};

	const toggleShowCreateVouchers = (show?: boolean) => {
		const toValue = show ?? !showCreateVouchers;
		if (toValue) {
			Animated.timing(createVouchersFadeAnim, {
				toValue: 1,
				duration: 300,
				useNativeDriver: true,
			}).start(() => {
				setShowCreateVouchers(true);
			});
		} else {
			Animated.timing(createVouchersFadeAnim, {
				toValue: 0,
				duration: 300,
				useNativeDriver: true,
			}).start(() => {
				setShowCreateVouchers(false);
				setEditVoucherCode(null);
				setMultipleVouchers(false);
			});
		}
	};

	const handleCreateVouchers = () => {
		// Generate vouchers logic
		setTimeout(() => {
			toggleShowCreateVouchers(false);
		}, 300);
	};

	const handleSubmitVoucherOverlay = ({
		multiple,
		numberOfUsers,
		package: pkg,
	}: {
		multiple: boolean;
		numberOfUsers: number;
		package: string;
	}) => {
		if (!hotSpot) return;
		if (editVoucherCode) {
			// Edit existing voucher (update package only for now)
			const targetVoucher = hotSpot.users?.find(
				(u) => u.voucherCode === editVoucherCode
			);
			if (targetVoucher) targetVoucher.package = pkg;
			setEditVoucherCode(null);
			toggleShowCreateVouchers(false);
			return;
		}
		// Else create (existing logic can be invoked)
		handleCreateVouchers();
	};

	return (
		<>
			<ParallaxScrollView
				headerBackgroundColor={{
					light: backgroundLight,
					dark: backgroundDark,
				}}
				contentStyle={{
					paddingHorizontal: 10,
				}}
				containerStyle={{ flex: 1 }}
			>
				<ThemedView
					style={{
						flexDirection: 'column',
						gap: 20,
						marginBottom: 10,
						paddingHorizontal: 10,
					}}
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
							fontWeight: fontWeight['heading.one'],
						}}
					>
						{translateWithVariables(
							translations[language].categories.vouchers.vouchersSubtitle,
							{
								hotspotName: hotSpot?.ssid ?? '',
								routerName: netRouter?.name ?? '',
							}
						)}
					</ThemedText>
					<ThemedView
						style={{
							flexDirection: 'row',
							gap: 10,
						}}
						lightColor={backgroundLight}
						darkColor={backgroundDark}
					>
						<ThemedButton
							style={{ flex: 1 }}
							lightColor={bim}
							darkColor={bim}
							numberOfLines={1}
							lightTextColor={white}
							darkTextColor={white}
							title={translations[
								language
							].categories.buttons.createSingleVoucher.toUpperCase()}
							onPress={() => {
								setMultipleVouchers(false);
								toggleShowCreateVouchers(true);
							}}
						/>
						<ThemedButton
							style={{ flex: 1 }}
							lightColor={lime}
							darkColor={lime}
							numberOfLines={1}
							lightTextColor={white}
							darkTextColor={white}
							title={translations[
								language
							].categories.buttons.createBulkVouchers.toUpperCase()}
							onPress={() => {
								setMultipleVouchers(true);
								toggleShowCreateVouchers(true);
							}}
						/>
					</ThemedView>
				</ThemedView>
				<TileContainer
					id={vRId || 'new-router-' + generateRandomInt(1000, 9999)}
					backgroundColor={background}
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
						showsHorizontalScrollIndicator={true}
					>
						<ThemedView
							style={{ flexDirection: 'column' }}
							lightColor={backgroundLight}
							darkColor={backgroundDark}
						>
							<ThemedView
								id='hotspot-list-header'
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
									#
								</ThemedText>
								<ThemedText
									style={styles.colTitle}
									lightColor={textLight}
									darkColor={textDark}
								>
									{translations[language].categories.vouchers.vouchers}
								</ThemedText>
								<ThemedText
									numberOfLines={1}
									ellipsizeMode='tail'
									style={styles.colTitle}
									lightColor={textLight}
									darkColor={textDark}
								>
									{translations[language].categories.vouchers.package}
								</ThemedText>
								<ThemedText
									numberOfLines={1}
									ellipsizeMode='tail'
									style={styles.colTitle}
									lightColor={textLight}
									darkColor={textDark}
								>
									{translations[language].categories.vouchers.status}
								</ThemedText>
								<ThemedText
									numberOfLines={1}
									ellipsizeMode='tail'
									style={styles.colTitle}
									lightColor={textLight}
									darkColor={textDark}
								>
									{translations[language].categories.vouchers.macAddress}
								</ThemedText>
								<ThemedText
									numberOfLines={1}
									ellipsizeMode='tail'
									style={styles.colTitle}
									lightColor={textLight}
									darkColor={textDark}
								>
									{translations[language].categories.vouchers.uptime}
								</ThemedText>
								<ThemedText
									numberOfLines={1}
									ellipsizeMode='tail'
									style={styles.colTitle}
									lightColor={textLight}
									darkColor={textDark}
								>
									{translations[language].categories.vouchers.bytesIn}
								</ThemedText>
								<ThemedText
									numberOfLines={1}
									ellipsizeMode='tail'
									style={styles.colTitle}
									lightColor={textLight}
									darkColor={textDark}
								>
									{translations[language].categories.vouchers.bytesOut}
								</ThemedText>

								<ThemedText
									numberOfLines={1}
									ellipsizeMode='tail'
									style={[styles.colTitle, { width: 120, textAlign: 'center' }]}
									lightColor={textLight}
									darkColor={textDark}
								>
									{translations[language].categories.vouchers.actions}
								</ThemedText>
							</ThemedView>
							<ScrollView
								nativeID={`hotspot-list-details-${hotspotId}`}
								style={{
									flexDirection: 'column',
									backgroundColor: background,
								}}
							>
								{hotSpot?.users?.map((user, index) => (
									<ThemedView
										key={index}
										style={{
											flexDirection: 'row',
											width: '100%',
											paddingVertical: 12,
											gap: 10,
											paddingHorizontal: 10,
											justifyContent: 'space-between',
											borderBottomWidth: index < routers.length - 1 ? 1 : 0,
											borderBottomColor: borderDark,
											backgroundColor:
												index % 2 === 0 ? listItemBackground : background,
										}}
										lightColor={backgroundLight}
										darkColor={backgroundDark}
									>
										<ThemedText
											numberOfLines={1}
											style={{ width: 30 }}
											lightColor={textLight}
											darkColor={textDark}
										>
											{index + 1}
										</ThemedText>
										<ThemedText
											numberOfLines={1}
											style={styles.colInfo}
											lightColor={textLight}
											darkColor={textDark}
										>
											{user.voucherCode}
										</ThemedText>
										<ThemedText
											numberOfLines={1}
											style={styles.colInfo}
											lightColor={textLight}
											darkColor={textDark}
										>
											{user.package}
										</ThemedText>
										<ThemedText
											numberOfLines={1}
											style={styles.colInfo}
											lightColor={textLight}
											darkColor={textDark}
										>
											{user.status}
										</ThemedText>
										<ThemedText
											numberOfLines={1}
											style={styles.colInfo}
											lightColor={textLight}
											darkColor={textDark}
										>
											{user.macAddress}
										</ThemedText>
										<ThemedText
											numberOfLines={1}
											style={styles.colInfo}
											lightColor={textLight}
											darkColor={textDark}
										>
											{user.uptime}
										</ThemedText>
										<ThemedText
											numberOfLines={1}
											style={styles.colInfo}
											lightColor={textLight}
											darkColor={textDark}
										>
											{user.bytesIn}
										</ThemedText>
										<ThemedText
											numberOfLines={1}
											style={styles.colInfo}
											lightColor={textLight}
											darkColor={textDark}
										>
											{user.bytesOut}
										</ThemedText>
										<ThemedView
											style={[
												styles.colInfo,
												{
													flexDirection: 'row',
													justifyContent: 'space-between',
													gap: 5,
													width: 120,
												},
											]}
											lightColor='transparent'
											darkColor='transparent'
										>
											<TouchableOpacity
												style={{
													paddingVertical: 6,
												}}
												onPress={() => handleEditUserDetails(user.voucherCode)}
											>
												<IconSymbol
													name='edit.outline'
													size={20}
													color={yellow}
												/>
											</TouchableOpacity>
											<TouchableOpacity
												style={{
													paddingVertical: 6,
												}}
												onPress={() => {
													affirmAction.current = () =>
														handleBlockUser(user.voucherCode);
													setPromptTitle(
														translations[language].categories.vouchers
															.confirmBlockTitle
													);
													setPromptMessage(
														translations[language].categories.vouchers
															.blockMessage
													);
													setPromptConfirmText(
														translations[language].categories.buttons.block
													);
													toggleShowPrompt(true);
												}}
											>
												<IconSymbol name='block' size={20} color={error} />
											</TouchableOpacity>
											<TouchableOpacity
												style={{
													paddingVertical: 6,
												}}
												onPress={() => {
													affirmAction.current = () =>
														handleDeleteUser(user.voucherCode);
													setPromptTitle(
														translations[language].categories.vouchers
															.confirmDeleteTitle
													);
													setPromptMessage(
														translations[language].categories.vouchers
															.deleteMessage
													);
													setPromptConfirmText(
														translations[language].categories.buttons.delete
													);
													toggleShowPrompt(true);
												}}
											>
												<IconSymbol
													name='delete.outline'
													size={20}
													color={error}
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
			<Prompt
				id='confirm-block-delete-voucher'
				fadeAnim={promptFadeAnim}
				onClose={() => toggleShowPrompt(false)}
				visible={showPrompt}
				title={promptTitle}
				message={promptMessage}
				buttons={[
					{
						title: translations[language].categories.buttons.cancel,
						color: cancelButton,
						textColor: white,
						action: () => toggleShowPrompt(false),
					},
					{
						title:
							promptConfirmText ||
							translations[language].categories.buttons.confirm,
						color: dangerButton,
						textColor: white,
						action: affirmAction.current || (() => toggleShowPrompt(false)),
					},
				]}
			/>
			{showCreateVouchers && hotSpot && (
				<CreateVouchers
					visible={showCreateVouchers}
					fadeAnim={createVouchersFadeAnim}
					multiple={multipleVouchers}
					hotspot={hotSpot}
					toggleVisible={(v) => {
						toggleShowCreateVouchers(v);
					}}
					mode={editVoucherCode ? 'edit' : 'create'}
					initialPkg={
						editVoucherCode
							? hotSpot.users?.find((u) => u.voucherCode === editVoucherCode)
									?.package || ''
							: undefined
					}
					titleOverride={
						editVoucherCode
							? translations[language].categories.vouchers.editVoucherTitle
							: undefined
					}
					primaryButtonLabelOverride={
						editVoucherCode
							? translations[language].categories.buttons.saveChanges
							: undefined
					}
					onSubmit={handleSubmitVoucherOverlay}
					generateVouchers={handleCreateVouchers}
				/>
			)}
		</>
	);
}

const styles = StyleSheet.create({
	statusLabel: {
		fontSize: fontSize['heading.two'],
		fontWeight: fontWeight['heading.two'],
	},
	colTitle: {
		fontSize: fontSize['text.small'],
		width: 100,
		textTransform: 'uppercase',
		paddingRight: 8,
	},
	colInfo: {
		width: 100,
		paddingRight: 8,
		overflow: 'hidden',
	},
});
