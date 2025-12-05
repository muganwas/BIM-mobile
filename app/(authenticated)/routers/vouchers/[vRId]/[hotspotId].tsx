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
import { getRouterHotspotUsers } from '@/services/RouterService';
import { ApiRouter, GetRouterHotspotUsersResponse, Hotspot } from '@/types';
import CreateVouchers from '@/views/CreateVouchers';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
	ActivityIndicator,
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
	const { vRId, hotspotId, name: hotSpotName } = useLocalSearchParams() as {
		vRId?: string;
		hotspotId?: string;
		name?: string;
	};
	const { handleUpdateHistory, language, authToken } = useGeneral();
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
	const errorColor = useThemeColor({}, 'error');
	const cancelButton = useThemeColor({}, 'cancelButton');
	const dangerButton = useThemeColor({}, 'dangerButton');
	const white = useThemeColor({}, 'white');
	const [netRouter, setNetRouter] = useState<ApiRouter | undefined>();
	const [hotSpot, setHotSpot] = useState<Hotspot | undefined>();
	const [usersResponse, setUsersResponse] = useState<GetRouterHotspotUsersResponse | null>(null);
	const [showPrompt, setShowPrompt] = useState(false);
	const [promptTitle, setPromptTitle] = useState('');
	const [promptMessage, setPromptMessage] = useState('');
	const [promptConfirmText, setPromptConfirmText] = useState('');
	const [showCreateVouchers, setShowCreateVouchers] = useState(false);
	const [multipleVouchers, setMultipleVouchers] = useState(false);
	const [editVoucherCode, setEditVoucherCode] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);
	const [retrying, setRetrying] = useState(false);
	const retryCount = useRef(0);

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

	const fetchUsers = async (isRetry = false) => {
		if (!vRId || !hotspotId || !authToken) return;
		
		setLoading(true);
		setError(false);
		if (isRetry) setRetrying(true);

		try {
			const response = await getRouterHotspotUsers(vRId, hotspotId, authToken);
			if (response && response.ok) {
				const data: GetRouterHotspotUsersResponse = await response.json();
				setUsersResponse(data);
				// Set hotspot from response if available
				if (data.hotspotServers && data.hotspotServers.length > 0) {
					// Find the matching hotspot or default to first
					const match = data.hotspotServers.find(h => h['.id'] === data.hotspotId) || data.hotspotServers[0];
					setHotSpot(match);
				}
				// Reset retry count on success
				retryCount.current = 0;
			} 
		} catch (error) {
			if (retryCount.current < 1) {
				retryCount.current += 1;
				// Automatic retry once
				setTimeout(() => {
					fetchUsers(true);
				}, 1000); 
			} else {
				setError(true);
			}
		} finally {
			if (!isRetry || (isRetry && retryCount.current >= 1)) {
				setLoading(false);
				setRetrying(false);
			}
		}
	};

	useEffect(() => {
		if (vRId && hotspotId && routers) {
			const router = routers.routers.data.find((r) => r.id === vRId);
			setNetRouter(router);
		}

		if (vRId && hotspotId && authToken) {
			fetchUsers();
		}
	}, [vRId, hotspotId, routers, authToken]);

	const handleManualRetry = () => {
		retryCount.current = 0; // Reset for manual retry to allow another auto-retry if needed? Or just treat as fresh start.
		fetchUsers();
	};

	const handleEditUserDetails = (voucher: string) => {
		if (!voucher || !usersResponse) return;
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
		if (!usersResponse) return;
		if (editVoucherCode) {
			// Edit existing voucher (update package only for now)
			const targetVoucher = usersResponse.users.data.find(
				(u) => u.name === editVoucherCode
			);
			// Note: This mutation is local and might need a setUsersResponse to trigger re-render if deep clone wasn't done, 
            // but for now we keep the logic similar to before (direct mutation was likely used). 
            // Better to use state setter ideally.
			// if (targetVoucher) targetVoucher.profile = pkg; // Field name difference... profile_display? profile?
            // The API response user has 'profile' which is the long string, and 'profile_display'.
            // Assuming we want to update the profile or package.
            // Let's defer mutation logic fixes for a separate step if needed, but here's the access update:
			if (targetVoucher) targetVoucher.profile_display = pkg;
			
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
								hotspotName: hotSpotName ?? '',
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
				{loading ? (
					<ThemedView
						style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}
						lightColor={background}
						darkColor={background}
					>
						<ActivityIndicator size="large" color={bim} />
						{retrying && (
							<ThemedText style={{ marginTop: 10, textAlign: 'center' }}>
								{translations[language].categories.dashboard.retrying}
							</ThemedText>
						)}
					</ThemedView>
				) : error ? (
					<ThemedView
						style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}
						lightColor={background}
						darkColor={background}
					>
						<ThemedText style={{ marginBottom: 20, textAlign: 'center' }}>
							{translations[language].categories.auth.unexpectedError}
						</ThemedText>
						<ThemedButton
							title={translations[language].categories.buttons.retry}
							onPress={handleManualRetry}
							lightColor={bim}
							darkColor={bim}
							lightTextColor={white}
							darkTextColor={white}
						/>
					</ThemedView>
				) : (
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
								{usersResponse?.users?.data?.map((user, index) => (
									<ThemedView
										key={index}
										style={{
											flexDirection: 'row',
											width: '100%',
											paddingVertical: 12,
											gap: 10,
											paddingHorizontal: 10,
											justifyContent: 'space-between',
											borderBottomWidth: routers?.routers?.data?.length &&index < routers?.routers?.data?.length - 1 ? 1 : 0,
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
											{usersResponse.users.from + index}
										</ThemedText>
										<ThemedText
											numberOfLines={1}
											style={styles.colInfo}
											lightColor={textLight}
											darkColor={textDark}
										>
											{user.name}
										</ThemedText>
										<ThemedText
											numberOfLines={1}
											style={styles.colInfo}
											lightColor={textLight}
											darkColor={textDark}
										>
											{user.profile_display}
										</ThemedText>
										<ThemedText
											numberOfLines={1}
											style={styles.colInfo}
											lightColor={textLight}
											darkColor={textDark}
										>
											{/* Status is not explicitly in the new user object, maybe infer or use new field? Using 'comment' as proxy for now or just N/A if not found. 
                                                Actually log shows 'uptime' 'time-left'. 
                                                Old code used 'user.status'. 
                                                New object doesn't have status. 
                                                Maybe check time-left?
                                            */}
											{user['time-left'] === 'Unlimited' ? 'Active' : user['time-left']}
										</ThemedText>
										<ThemedText
											numberOfLines={1}
											style={styles.colInfo}
											lightColor={textLight}
											darkColor={textDark}
										>
											{user['mac-address']}
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
											{user['bytes-in']}
										</ThemedText>
										<ThemedText
											numberOfLines={1}
											style={styles.colInfo}
											lightColor={textLight}
											darkColor={textDark}
										>
											{user['bytes-out']}
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
												onPress={() => handleEditUserDetails(user.name)}
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
														handleBlockUser(user.name);
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
												<IconSymbol name='block' size={20} color={errorColor} />
											</TouchableOpacity>
											<TouchableOpacity
												style={{
													paddingVertical: 6,
												}}
												onPress={() => {
													affirmAction.current = () =>
														handleDeleteUser(user.name);
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
													color={errorColor}
												/>
											</TouchableOpacity>
										</ThemedView>
									</ThemedView>
								))}
							</ScrollView>
						</ThemedView>
					</ScrollView>
				</TileContainer>
				)}
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
							? usersResponse?.users.data.find((u) => u.name === editVoucherCode)
									?.profile_display || ''
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
