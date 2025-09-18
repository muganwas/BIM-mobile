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
import { generateRandomInt, translateWithVariables } from '@/helpers';
import useTrackHistory from '@/hooks/useTrackHistory';
import { Hotspot, NetRouter } from '@/types';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
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
	const affirmAction = useRef<() => void | null>(null);
	const navigation = useNavigation<any>();
	const router = useRouter();
	const { vRId, hotspotId } = useLocalSearchParams() as {
		vRId?: string;
		hotspotId?: string;
	};
	const { handleUpdateHistory, language } = useGeneral();
	const { routers } = useTransaction();
	const colorScheme = useColorScheme() ?? 'light';
	const [netRouter, setNetRouter] = useState<NetRouter | undefined>();
	const [hotSpot, setHotSpot] = useState<Hotspot | undefined>();
	const [showPrompt, setShowPrompt] = useState(false);
	const [promptTitle, setPromptTitle] = useState('');
	const [promptMessage, setPromptMessage] = useState('');
	const [promptConfirmText, setPromptConfirmText] = useState('');

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
		if (!voucher) return;
		return router.push(
			`/(authenticated)/routers/vouchers/${vRId}/${hotspotId}/${voucher}`
		);
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

	return (
		<>
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
				<ThemedView
					style={{
						flexDirection: 'column',
						gap: 20,
						marginBottom: 10,
						marginHorizontal: 20,
					}}
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
						lightColor={Colors.light.background}
						darkColor={Colors.dark.background}
					>
						<ThemedButton
							style={{ flex: 1 }}
							lightColor={Colors.light.bim}
							darkColor={Colors.dark.bim}
							lightTextColor={Colors.light.white}
							darkTextColor={Colors.dark.white}
							title={translations[
								language
							].categories.buttons.createSingleVoucher.toUpperCase()}
							onPress={() => {}}
						/>
						<ThemedButton
							style={{ flex: 1 }}
							lightColor={Colors.light.lime}
							darkColor={Colors.dark.lime}
							lightTextColor={Colors.light.white}
							darkTextColor={Colors.dark.white}
							title={translations[
								language
							].categories.buttons.createBulkVouchers.toUpperCase()}
							onPress={() => {}}
						/>
					</ThemedView>
				</ThemedView>
				<TileContainer
					id={vRId || 'new-router-' + generateRandomInt(1000, 9999)}
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
						style={{ flexDirection: 'row' }}
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
								id='hotspot-list-header'
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
									style={{ width: 30 }}
									lightColor={Colors.light.text}
									darkColor={Colors.dark.text}
								>
									#
								</ThemedText>
								<ThemedText
									style={styles.colTitle}
									lightColor={Colors.light.text}
									darkColor={Colors.dark.text}
								>
									{translations[language].categories.vouchers.vouchers}
								</ThemedText>
								<ThemedText
									numberOfLines={1}
									ellipsizeMode='tail'
									style={styles.colTitle}
									lightColor={Colors.light.text}
									darkColor={Colors.dark.text}
								>
									{translations[language].categories.vouchers.package}
								</ThemedText>
								<ThemedText
									numberOfLines={1}
									ellipsizeMode='tail'
									style={styles.colTitle}
									lightColor={Colors.light.text}
									darkColor={Colors.dark.text}
								>
									{translations[language].categories.vouchers.status}
								</ThemedText>
								<ThemedText
									numberOfLines={1}
									ellipsizeMode='tail'
									style={styles.colTitle}
									lightColor={Colors.light.text}
									darkColor={Colors.dark.text}
								>
									{translations[language].categories.vouchers.macAddress}
								</ThemedText>
								<ThemedText
									numberOfLines={1}
									ellipsizeMode='tail'
									style={styles.colTitle}
									lightColor={Colors.light.text}
									darkColor={Colors.dark.text}
								>
									{translations[language].categories.vouchers.uptime}
								</ThemedText>
								<ThemedText
									numberOfLines={1}
									ellipsizeMode='tail'
									style={styles.colTitle}
									lightColor={Colors.light.text}
									darkColor={Colors.dark.text}
								>
									{translations[language].categories.vouchers.bytesIn}
								</ThemedText>
								<ThemedText
									numberOfLines={1}
									ellipsizeMode='tail'
									style={styles.colTitle}
									lightColor={Colors.light.text}
									darkColor={Colors.dark.text}
								>
									{translations[language].categories.vouchers.bytesOut}
								</ThemedText>

								<ThemedText
									numberOfLines={1}
									ellipsizeMode='tail'
									style={[styles.colTitle, { width: 120, textAlign: 'center' }]}
									lightColor={Colors.light.text}
									darkColor={Colors.dark.text}
								>
									{translations[language].categories.vouchers.actions}
								</ThemedText>
							</ThemedView>
							<ScrollView
								nativeID={`hotspot-list-details-${hotspotId}`}
								style={{
									flexDirection: 'column',
									backgroundColor: Colors[colorScheme].background,
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
											paddingHorizontal: 5,
											justifyContent: 'space-between',
											borderBottomWidth: index < routers.length - 1 ? 1 : 0,
											borderBottomColor: Colors[colorScheme].borderDark,
										}}
										lightColor={Colors.light.background}
										darkColor={Colors.dark.background}
									>
										<ThemedText
											numberOfLines={1}
											style={{ width: 30 }}
											lightColor={Colors.light.text}
											darkColor={Colors.dark.text}
										>
											{index + 1}
										</ThemedText>
										<ThemedText
											numberOfLines={1}
											style={styles.colInfo}
											lightColor={Colors.light.text}
											darkColor={Colors.dark.text}
										>
											{user.voucherCode}
										</ThemedText>
										<ThemedText
											numberOfLines={1}
											style={styles.colInfo}
											lightColor={Colors.light.text}
											darkColor={Colors.dark.text}
										>
											{user.package}
										</ThemedText>
										<ThemedText
											numberOfLines={1}
											style={styles.colInfo}
											lightColor={Colors.light.text}
											darkColor={Colors.dark.text}
										>
											{user.status}
										</ThemedText>
										<ThemedText
											numberOfLines={1}
											style={styles.colInfo}
											lightColor={Colors.light.text}
											darkColor={Colors.dark.text}
										>
											{user.macAddress}
										</ThemedText>
										<ThemedText
											numberOfLines={1}
											style={styles.colInfo}
											lightColor={Colors.light.text}
											darkColor={Colors.dark.text}
										>
											{user.uptime}
										</ThemedText>
										<ThemedText
											numberOfLines={1}
											style={styles.colInfo}
											lightColor={Colors.light.text}
											darkColor={Colors.dark.text}
										>
											{user.bytesIn}
										</ThemedText>
										<ThemedText
											numberOfLines={1}
											style={styles.colInfo}
											lightColor={Colors.light.text}
											darkColor={Colors.dark.text}
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
											lightColor={Colors.light.background}
											darkColor={Colors.dark.background}
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
													color={Colors[colorScheme].yellow}
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
												<IconSymbol
													name='block'
													size={20}
													color={Colors[colorScheme].error}
												/>
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
						color: Colors[colorScheme].cancelButton,
						textColor: Colors[colorScheme].white,
						action: () => toggleShowPrompt(false),
					},
					{
						title:
							promptConfirmText ||
							translations[language].categories.buttons.confirm,
						color: Colors[colorScheme].dangerButton,
						textColor: Colors[colorScheme].white,
						action: affirmAction.current || (() => toggleShowPrompt(false)),
					},
				]}
			/>
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
