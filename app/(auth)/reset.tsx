import bimTextImg from '@/assets/images/bim-text-img.png';
import FormContainer from '@/components/FormContainer';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedInput } from '@/components/ThemedInput';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { emailRegex } from '@/constants';
import { Colors } from '@/constants/Colors';
import { fontSize, fontWeight } from '@/constants/Font';
import translations from '@/constants/Trans';
import { useGeneral } from '@/context/GeneralContext';
import useTrackHistory from '@/hooks/useTrackHistory';
import { useNavigation, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
	Image,
	Platform,
	StyleSheet,
	TouchableOpacity,
	useColorScheme,
	View,
} from 'react-native';

export default function ResetPasswordScreen() {
	useTrackHistory('/(auth)/reset');
	const router = useRouter();
	const navigation = useNavigation();

	useEffect(() => {
		// ensure native header is visible with empty title (matches login/signup)
		try {
			navigation.setOptions?.({ headerShown: true, headerTitle: '' });
		} catch {}
		return () => {};
	}, [navigation]);
	const { language } = useGeneral();
	const colorScheme = useColorScheme() ?? 'light';

	const [email, setEmail] = useState('');
	const [error, setError] = useState(false);

	const handleSendReset = () => {
		if (!emailRegex.test(email)) {
			setError(true);
			return;
		}
		setError(false);
		// Implement send reset link via API/context
		console.log('Send reset link to', email);
		// After sending, navigate back to login
		router.push('/(auth)/login');
	};

	return (
		<FormContainer
			style={{ flex: 1 }}
			behavior={Platform.OS === 'ios' ? 'position' : 'padding'}
		>
			<ParallaxScrollView
				headerBackgroundColor={{
					light: Colors.light.background,
					dark: Colors.dark.background,
				}}
			>
				<ThemedView
					style={styles.container}
					lightColor={Colors.light.background}
					darkColor={Colors.dark.background}
				>
					<ThemedView
						style={styles.header}
						lightColor={Colors[colorScheme].background}
						darkColor={Colors[colorScheme].background}
					>
						<Image
							source={bimTextImg}
							style={{ height: 35, resizeMode: 'contain' }}
						/>
					</ThemedView>

					<ThemedView
						style={styles.formHeader}
						lightColor={Colors[colorScheme].background}
						darkColor={Colors[colorScheme].background}
					>
						<ThemedText
							style={{
								fontWeight: fontWeight['heading.one'],
								fontSize: fontSize['heading.one'],
								color: Colors[colorScheme].headers,
							}}
							lightColor={Colors.light.headers}
							darkColor={Colors.dark.headers}
						>
							{translations[language].categories.auth['reset.title']}
						</ThemedText>
						<ThemedText
							style={{
								marginTop: 10,
								color: Colors[colorScheme].text,
							}}
						>
							{translations[language].categories.auth['reset.subtitle']}
						</ThemedText>
					</ThemedView>

					<ThemedView
						style={styles.formInputs}
						lightColor={Colors.light.inputContainerBackground}
						darkColor={Colors.dark.inputContainerBackground}
					>
						<ThemedInput
							value={email}
							setValue={(v) => {
								setEmail(v);
								if (error) setError(false);
							}}
							placeholder={translations[language].categories.auth.email}
							placeholderTextColor={Colors[colorScheme].text}
							keyboardType='email-address'
							containerStyle={{ width: '100%' }}
						/>

						<ThemedButton
							title={translations[language].categories.auth['reset.sendLink']}
							onPress={handleSendReset}
							style={{ borderRadius: 8 }}
							lightColor={Colors.light.bim}
							darkColor={Colors.dark.bim}
							lightTextColor={Colors.light.authButtonText}
							darkTextColor={Colors.dark.authButtonText}
							disabled={email.length === 0}
						/>

						<View
							style={{
								flexDirection: 'row',
								marginTop: 10,
								justifyContent: 'center',
							}}
						>
							<TouchableOpacity onPress={() => router.push('/(auth)/login')}>
								<ThemedView
									lightColor={Colors.light.background}
									darkColor={Colors.dark.background}
									style={{ flexDirection: 'row', alignItems: 'center' }}
								>
									<IconSymbol
										name={'chevron.left'}
										size={16}
										color={Colors[colorScheme].bim}
									/>
									<ThemedText
										style={{ color: Colors[colorScheme].bim, marginLeft: 8 }}
									>
										{
											translations[language].categories.auth[
												'reset.backToLogin'
											]
										}
									</ThemedText>
								</ThemedView>
							</TouchableOpacity>
						</View>
					</ThemedView>
				</ThemedView>
			</ParallaxScrollView>
		</FormContainer>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'flex-start',
		alignItems: 'center',
	},
	header: {
		width: '100%',
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 20,
	},
	formHeader: {
		width: '100%',
		marginTop: 24,
	},
	formInputs: {
		width: '100%',
		marginTop: 24,
		gap: 12,
	},
});
