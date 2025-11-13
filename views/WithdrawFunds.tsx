import FormContainer from '@/components/FormContainer';
import OverlayContainer from '@/components/OverlayContainer';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedInput } from '@/components/ThemedInput';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import translations from '@/constants/Trans';
import { useGeneral } from '@/context/GeneralContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useEffect, useRef, useState } from 'react';
import {
	Animated,
	Platform,
	StyleSheet,
	useColorScheme,
	View,
} from 'react-native';

type Props = {
	visible: boolean;
	routerName: string;
	currency: string; // e.g., UGX, KES
	onCancel: () => void;
	onInitiate: (payload: {
		amount: string;
		phone: string;
		narration?: string;
	}) => void;
};

export default function WithdrawFunds({
	visible,
	routerName,
	currency,
	onCancel,
	onInitiate,
}: Props) {
	useColorScheme();
	const { language } = useGeneral();
	const bg = useThemeColor({}, 'background');
	const screenTitleText = useThemeColor({}, 'screenTitleText');
	const inputBorder = useThemeColor({}, 'inputBorder');
	const cancelButton = useThemeColor({}, 'cancelButton');
	const bim = useThemeColor({}, 'bim');
	const white = useThemeColor({}, 'white');

	const [amount, setAmount] = useState('');
	const [phone, setPhone] = useState('');
	const [narration, setNarration] = useState('');

	// Provide a real Animated.Value for overlay
	const fadeAnim = useRef(new Animated.Value(0)).current;

	// Reset fields when opening/closing
	useEffect(() => {
		if (visible) {
			setAmount('');
			setPhone('');
			setNarration('');
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 150,
				useNativeDriver: true,
			}).start();
		} else {
			Animated.timing(fadeAnim, {
				toValue: 0,
				duration: 150,
				useNativeDriver: true,
			}).start();
		}
	}, [visible, fadeAnim]);

	const t = translations[language]?.categories ?? ({} as any);
	const toTitleCase = (s: string) =>
		s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));
	const title = `${toTitleCase(
		t.withdraw?.withdrawFundsFromRouter ?? 'withdraw funds from router'
	)}: ${routerName}`;

	const handleInitiate = () => {
		onInitiate({
			amount,
			phone,
			narration: narration?.trim() ? narration : undefined,
		});
	};

	return (
		<OverlayContainer
			showOverlay={visible}
			fadeAnim={fadeAnim}
			position='center'
		>
			<FormContainer
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
				style={styles.kbContainer}
			>
				<ThemedView style={styles.card} lightColor={bg} darkColor={bg}>
					<ThemedText
						style={styles.title}
						lightColor={screenTitleText}
						darkColor={screenTitleText}
					>
						{title}
					</ThemedText>

					<ThemedInput
						label={`${toTitleCase(
							t.withdraw?.withdrawAmount ?? 'Withdraw amount'
						)} (${currency})`}
						placeholder={`${toTitleCase(
							t.withdraw?.withdrawAmount ?? 'Withdraw amount'
						)} (${currency})`}
						keyboardType='numeric'
						value={amount}
						setValue={setAmount}
						style={{
							backgroundColor: bg,
							borderColor: inputBorder,
							borderWidth: 1,
						}}
						containerStyle={{ marginBottom: 8 }}
					/>

					<ThemedInput
						label={toTitleCase(
							t.withdraw?.mobileMoneyPhone ?? 'Mobile money phone number'
						)}
						placeholder={toTitleCase(
							t.withdraw?.mobileMoneyPhone ?? 'Mobile money phone number'
						)}
						keyboardType='phone-pad'
						value={phone}
						setValue={setPhone}
						style={{
							backgroundColor: bg,
							borderColor: inputBorder,
							borderWidth: 1,
						}}
						containerStyle={{ marginBottom: 8 }}
					/>

					<ThemedInput
						label={toTitleCase(
							t.withdraw?.narrationOptional ?? 'Narration (optional)'
						)}
						placeholder={toTitleCase(
							t.withdraw?.narrationOptional ?? 'Narration (optional)'
						)}
						value={narration}
						setValue={setNarration}
						multiline
						style={{
							backgroundColor: bg,
							borderColor: inputBorder,
							borderWidth: 1,
							height: 80,
						}}
						containerStyle={{ marginBottom: 8 }}
					/>

					<View style={styles.actions}>
						<ThemedButton
							title={toTitleCase(t.buttons?.cancel ?? 'Cancel')}
							onPress={onCancel}
							lightColor={cancelButton}
							darkColor={cancelButton}
							lightTextColor={white}
							darkTextColor={white}
						/>
						<ThemedButton
							title={toTitleCase(
								t.withdraw?.initiateWithdrawal ?? 'Initiate withdrawal'
							)}
							onPress={handleInitiate}
							lightColor={bim}
							darkColor={bim}
							lightTextColor={white}
							darkTextColor={white}
						/>
					</View>
				</ThemedView>
			</FormContainer>
		</OverlayContainer>
	);
}

const styles = StyleSheet.create({
	kbContainer: { width: '90%' },
	card: {
		flexDirection: 'column',
		padding: 20,
		borderRadius: 10,
		width: '100%',
		gap: 12,
	},
	title: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
	actions: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		gap: 10,
		marginTop: 8,
	},
});
