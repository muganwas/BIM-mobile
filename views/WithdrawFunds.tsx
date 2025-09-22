import OverlayContainer from '@/components/OverlayContainer';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedInput } from '@/components/ThemedInput';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import translations from '@/constants/Trans';
import { useGeneral } from '@/context/GeneralContext';
import { useEffect, useState } from 'react';
import {
	KeyboardAvoidingView,
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
	const colorScheme = useColorScheme() ?? 'light';
	const { language } = useGeneral();

	const [amount, setAmount] = useState('');
	const [phone, setPhone] = useState('');
	const [narration, setNarration] = useState('');

	// Reset fields when opening/closing
	useEffect(() => {
		if (visible) {
			setAmount('');
			setPhone('');
			setNarration('');
		}
	}, [visible]);

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
			fadeAnim={undefined as any}
			position='center'
		>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
				style={styles.kbContainer}
			>
				<ThemedView
					style={styles.card}
					lightColor={Colors.light.background}
					darkColor={Colors.dark.background}
				>
					<ThemedText
						style={styles.title}
						lightColor={Colors.light.screenTitleText}
						darkColor={Colors.dark.screenTitleText}
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
							backgroundColor: Colors[colorScheme].background,
							borderColor: Colors[colorScheme].inputBorder,
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
							backgroundColor: Colors[colorScheme].background,
							borderColor: Colors[colorScheme].inputBorder,
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
							backgroundColor: Colors[colorScheme].background,
							borderColor: Colors[colorScheme].inputBorder,
							borderWidth: 1,
							height: 80,
						}}
						containerStyle={{ marginBottom: 8 }}
					/>

					<View style={styles.actions}>
						<ThemedButton
							title={toTitleCase(t.buttons?.cancel ?? 'Cancel')}
							onPress={onCancel}
							lightColor={Colors.light.cancelButton}
							darkColor={Colors.dark.cancelButton}
							lightTextColor={Colors.light.white}
							darkTextColor={Colors.dark.white}
						/>
						<ThemedButton
							title={toTitleCase(
								t.withdraw?.initiateWithdrawal ?? 'Initiate withdrawal'
							)}
							onPress={handleInitiate}
							lightColor={Colors.light.bim}
							darkColor={Colors.dark.bim}
							lightTextColor={Colors.light.white}
							darkTextColor={Colors.dark.white}
						/>
					</View>
				</ThemedView>
			</KeyboardAvoidingView>
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
