import Loader from '@/components/Loader';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedInput } from '@/components/ThemedInput';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import translations from '@/constants/Trans';
import { useGeneral } from '@/context/GeneralContext';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
	Animated,
	Dimensions,
	Image,
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
	useAnimatedValue,
	useColorScheme,
} from 'react-native';

const devWidth = Dimensions.get('window').width;

export default function VerifyTokenScreen() {
	const colorScheme = useColorScheme() ?? 'light';
	const router = useRouter();
	// timeout ref
	const otpTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const loaderFadeAnim = useAnimatedValue(0);
	const { language } = useGeneral(); // Get language from context
	const [code, setCode] = useState('');
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState({
		code: false,
		login: false,
	});

	// Clean up on unmount
	useEffect(() => {
		return () => {
			if (otpTimeoutRef.current) {
				clearTimeout(otpTimeoutRef.current);
			}
		};
	}, []);

	const handleSetCode = (value: string) => {
		if (value.length > 6) return; // Limit input to 6 characters
		if (value.length === 6) {
			setErrors((prev) => ({ ...prev, code: false }));
		} else {
			setErrors((prev) => ({ ...prev, code: true }));
		}
		if (value.length <= 6 && !isNaN(Number(value))) setCode(value);
	};

	const handleToggleLoader = (show?: boolean) => {
		const toValue = show ?? !loading;
		setLoading(toValue);
		if (toValue) {
			Animated.timing(loaderFadeAnim, {
				toValue: 1,
				duration: 300,
				useNativeDriver: true,
			}).start();
		} else {
			Animated.timing(loaderFadeAnim, {
				toValue: 0,
				duration: 300,
				useNativeDriver: true,
			}).start();
		}
	};

	const handleVerifyCode = () => {
		handleToggleLoader(true);
		if (otpTimeoutRef.current) {
			clearTimeout(otpTimeoutRef.current);
		}
		if (code.length !== 6) {
			setErrors((prev) => ({ ...prev, code: true }));
			return handleToggleLoader(false);
		}
		// Simulate verification process
		otpTimeoutRef.current = setTimeout(() => {
			// If verification is successful, redirect to home screen
			setCode('');
			handleToggleLoader(false);
			router.push('/(authenticated)/home'); // Uncomment when ready
		}, 1000);
	};
	return (
		<>
			<KeyboardAvoidingView
				style={{
					flex: 1,
					minWidth: devWidth,
					minHeight: '100%',
					padding: 0,
					margin: 0,
				}}
				behavior={Platform.OS === 'ios' ? 'position' : 'padding'}
			>
				<ParallaxScrollView
					headerBackgroundColor={{ light: '#fff', dark: '#fff' }}
				>
					<ThemedView
						style={styles.container}
						lightColor='#fff'
						darkColor='#fff'
					>
						<ThemedView
							style={styles.header}
							lightColor='#fff'
							darkColor='#fff'
						>
							<Image
								source={require('@/assets/images/bim-text-img.png')}
								style={{ height: 35, resizeMode: 'contain' }}
							/>
						</ThemedView>
						<ThemedView style={styles.form} lightColor='#fff' darkColor='#fff'>
							<ThemedView
								style={styles.formHeader}
								lightColor='#fff'
								darkColor='#fff'
							>
								<ThemedText
									style={{
										fontWeight: 500,
										fontSize: 22,
										color: Colors[colorScheme].headers,
									}}
									lightColor={Colors.light.headers}
									darkColor={Colors.dark.headers}
								>
									{translations[language].categories.auth['verify.title']}
								</ThemedText>
								<ThemedText
									style={{
										fontWeight: 400,
										fontSize: 16,
										color: Colors.light.text,
										marginTop: 10,
									}}
									lightColor={Colors.light.text}
									darkColor={Colors.dark.text}
								>
									{translations[language].categories.auth['verify.subtitle']}
								</ThemedText>
							</ThemedView>
							<ThemedView
								style={styles.formInputs}
								lightColor='#fff'
								darkColor='#fff'
							>
								<ThemedInput
									style={[
										styles.formInput,
										{
											borderColor: errors.code
												? Colors[colorScheme].error
												: Colors[colorScheme].inputBorder,
										},
									]}
									lightColor={Colors.light.text}
									darkColor={Colors.light.text}
									value={code}
									setValue={handleSetCode}
									placeholder={
										translations[language].categories.auth['enterOTP']
									}
									placeholderTextColor={Colors[colorScheme].text}
									keyboardType='number-pad'
								/>
								<ThemedButton
									title={translations[language].categories.auth[
										'verify.button'
									]?.toUpperCase()}
									onPress={handleVerifyCode}
									style={{
										borderRadius: 8,
									}}
									darkColor={
										errors['login']
											? Colors['dark'].buttonError
											: Colors['dark'].bim
									}
									lightColor={
										errors['login']
											? Colors['light'].buttonError
											: Colors['light'].bim
									}
									darkTextColor={Colors['dark'].authButtonText}
									lightTextColor={Colors['light'].authButtonText}
								/>
							</ThemedView>
						</ThemedView>
					</ThemedView>
				</ParallaxScrollView>
			</KeyboardAvoidingView>
			<Loader
				showOverlay={loading}
				fadeAnim={loaderFadeAnim}
				toggleShowOverlay={handleToggleLoader}
			/>
		</>
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
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 20,
	},
	form: {
		flex: 1,
		flexDirection: 'column',
		width: '100%',
		alignItems: 'flex-start',
		paddingVertical: 20,
	},
	formHeader: {
		flexDirection: 'column',
	},
	formInputs: {
		flexDirection: 'column',
		width: '100%',
		marginVertical: 50,
		backgroundColor: Colors.light.inputContainerBackground,
		gap: 15,
	},
	formInput: {
		width: '100%',
		fontSize: 16,
		backgroundColor: Colors.light.inputBackground,
		borderRadius: 8,
		borderColor: Colors.light.inputBorder,
		borderWidth: 1,
		color: Colors.light.text,
	},
});
