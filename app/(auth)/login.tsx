import bimTextImg from '@/assets/images/bim-text-img.png';
import Loader from '@/components/Loader';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedInput } from '@/components/ThemedInput';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { passwordRegex, phoneRegexWithSpaces } from '@/constants';
import { Colors } from '@/constants/Colors';
import { fontSize, fontWeight } from '@/constants/Font';
import translations from '@/constants/Trans';
import { useGeneral } from '@/context/GeneralContext';
import { formatPhoneNumber } from '@/helpers';
import useTrackHistory from '@/hooks/useTrackHistory';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
	Animated,
	BackHandler,
	Dimensions,
	Image,
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
	TouchableOpacity,
	useAnimatedValue,
	useColorScheme,
} from 'react-native';

const devWidth = Dimensions.get('window').width;

export default function LoginsScreen() {
	useTrackHistory('/(auth)/login');
	const router = useRouter();
	const navigation = useNavigation();
	// timeout ref
	const loginTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const loaderFadeAnim = useAnimatedValue(0);
	const colorScheme = useColorScheme() ?? 'light';
	const { handleAuthentication, language } = useGeneral(); // Get authenticate function from context
	const [phoneNumber, setPhoneNumber] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [focusedInput, setFocusedInput] = useState<string | null>(null);
	const [errors, setErrors] = useState({
		phone: false,
		password: false,
		login: false,
	});

	useFocusEffect(() => {
		const sub = () => {
			if (navigation.canGoBack()) {
				handleResetAll();
				navigation.goBack();
				return true;
			}
		};
		const backHandler = BackHandler.addEventListener('hardwareBackPress', sub);
		return () => backHandler.remove();
	});

	useEffect(() => {
		const subscription = navigation.addListener('blur', () => {
			handleResetAll();
		});
		return subscription;
	}, [navigation]);

	useEffect(() => {
		if (focusedInput) {
			setErrors((prev) => ({ ...prev, [focusedInput]: false }));
		}
	}, [focusedInput]);
	const handleSetPhone = (value: string): void => {
		const phoneNumber = formatPhoneNumber(value);
		if (!phoneNumber || !phoneRegexWithSpaces.test(phoneNumber)) {
			setErrors((prev) => ({ ...prev, phone: true }));
		} else {
			setErrors((prev) => ({ ...prev, phone: false }));
		}
		setPhoneNumber(phoneNumber);
	};

	const handleSetPassword = (value: string): void => {
		if ((passwordRegex.test(password) && password) || !password) {
			setErrors((prev) => ({ ...prev, password: false }));
		}
		setPassword(value);
	};

	const handleOnLogin = () => {
		if (
			!phoneRegexWithSpaces.test(phoneNumber) ||
			!passwordRegex.test(password)
		) {
			setErrors({
				phone: !phoneRegexWithSpaces.test(phoneNumber),
				password: !passwordRegex.test(password),
				login: true,
			});
			return;
		}
		try {
			handleToggleLoader(true);
			if (loginTimeoutRef.current) {
				clearTimeout(loginTimeoutRef.current);
			}
			loginTimeoutRef.current = setTimeout(() => {
				handleToggleLoader(false);
				// Call your signup API here
				handleAuthentication({
					number: phoneNumber,
					password,
				});
			}, 1000);
		} catch (error) {
			setErrors((prev) => ({ ...prev, signup: true }));
			console.error('Login error:', error);
		}
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

	const handleResetAll = () => {
		setPhoneNumber('');
		setPassword('');
		setFocusedInput(null);
		setErrors({
			phone: false,
			password: false,
			login: false,
		});
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
					headerBackgroundColor={{
						light: Colors[colorScheme].background,
						dark: Colors[colorScheme].background,
					}}
				>
					<ThemedView
						style={styles.container}
						lightColor={Colors[colorScheme].background}
						darkColor={Colors[colorScheme].background}
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
							style={styles.form}
							lightColor={Colors[colorScheme].background}
							darkColor={Colors[colorScheme].background}
						>
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
									{translations[language].categories.auth['signIn.title']}
								</ThemedText>
								<ThemedText
									style={{
										fontWeight: fontWeight['heading.three'],
										fontSize: fontSize['heading.three'],
										color: Colors.light.text,
										marginTop: 10,
									}}
									lightColor={Colors.light.text}
									darkColor={Colors.dark.text}
								>
									{translations[language].categories.auth['signIn.subtitle']}
								</ThemedText>
							</ThemedView>
							<ThemedView
								style={styles.formInputs}
								lightColor={Colors.light.background}
								darkColor={Colors.dark.background}
							>
								<ThemedInput
									style={[
										styles.formInput,
										{
											borderColor: errors.phone
												? Colors[colorScheme].error
												: Colors[colorScheme].inputBorder,
										},
									]}
									lightColor={Colors.light.text}
									darkColor={Colors.light.text}
									value={phoneNumber}
									setValue={handleSetPhone}
									placeholder={
										translations[language].categories.auth['phoneNumber']
									}
									placeholderTextColor={Colors[colorScheme].text}
									keyboardType='number-pad'
									onFocus={() => setFocusedInput('phoneNumber')}
									onBlur={() => setFocusedInput(null)}
								/>
								<ThemedInput
									style={[
										styles.formInput,
										{
											borderColor: errors.password
												? Colors[colorScheme].error
												: Colors[colorScheme].inputBorder,
										},
									]}
									lightColor={Colors.light.text}
									darkColor={Colors.light.text}
									value={password}
									secureTextEntry={true}
									setValue={handleSetPassword}
									placeholder={
										translations[language].categories.auth['password']
									}
									placeholderTextColor={Colors[colorScheme].text}
									keyboardType='default'
									onFocus={() => setFocusedInput('password')}
									onBlur={() => setFocusedInput(null)}
								/>
								<ThemedButton
									title={translations[language].categories.buttons[
										'signIn'
									]?.toUpperCase()}
									onPress={handleOnLogin}
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
								<ThemedView
									style={{
										flexDirection: 'row',
										marginTop: 10,
										alignItems: 'center',
										justifyContent: 'space-between',
									}}
								>
									<TouchableOpacity
										style={{
											flexDirection: 'row',
											backgroundColor: 'transparent',
											alignItems: 'center',
										}}
										onPress={() => router.push('/(auth)/login')}
									>
										<ThemedText style={{ color: Colors[colorScheme].bim }}>
											{translations[language].categories.auth['forgotPassword']}
										</ThemedText>
									</TouchableOpacity>
									<TouchableOpacity
										style={{
											flexDirection: 'row',
											backgroundColor: 'transparent',
											alignItems: 'center',
										}}
										onPress={() => router.push('/(auth)')}
									>
										<ThemedText style={{ color: Colors[colorScheme].bim }}>
											{translations[language].categories.auth['signUp']}
										</ThemedText>
									</TouchableOpacity>
								</ThemedView>
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
		fontSize: fontSize['input.large'],
		backgroundColor: Colors.light.inputBackground,
		borderRadius: 8,
		borderColor: Colors.light.inputBorder,
		borderWidth: 1,
		color: Colors.light.text,
	},
});
