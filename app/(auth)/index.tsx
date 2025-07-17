import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedInput } from '@/components/ThemedInput';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { emailRegex, passwordRegex, phoneRegexWithSpaces } from '@/constants';
import { Colors } from '@/constants/Colors';
import translations from '@/constants/Trans';
import { useGeneral } from '@/context/GeneralContext';
import { formatPhoneNumber } from '@/helpers';
import { verifyToken } from '@/helpers/auth';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
	BackHandler,
	Dimensions,
	Image,
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
	TouchableOpacity,
} from 'react-native';

const devWidth = Dimensions.get('window').width;

export default function RegisterScreen() {
	const router = useRouter();
	const navigation = useNavigation();
	const colorScheme = useColorScheme() ?? 'light';
	const { language } = useGeneral();
	const [fullName, setFullName] = useState('');
	const [phoneNumber, setPhoneNumber] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [focusedInput, setFocusedInput] = useState<string | null>(null);
	const [errors, setErrors] = useState({
		phoneNumber: false,
		fullName: false,
		email: false,
		password: false,
		confirmPassword: false,
		signup: false,
	});

	useFocusEffect(() => {
		const onPressBack = () => {
			if (navigation.canGoBack()) {
				handleResetAll();
				navigation.goBack();
				return true;
			}
		};
		const subscription = BackHandler.addEventListener(
			'hardwareBackPress',
			onPressBack
		);
		return () => subscription.remove();
	});

	useEffect(() => {
		const subscription = navigation.addListener('blur', () => {
			handleResetAll();
		});
		return subscription;
	}, [navigation]);

	useEffect(() => {
		const verify = async () => {
			const token = localStorage.getItem('bim-token');
			const isValid = await verifyToken(token || '');
			if (isValid) {
				router.replace({
					pathname: '/(authenticated)/home',
					params: { token },
				});
			}
		};
		verify();
	}, [router]);

	useEffect(() => {
		if (focusedInput) {
			setErrors((prev) => ({ ...prev, [focusedInput]: false }));
		}
	}, [focusedInput]);

	const handleSetFullName = (value: string): void => {
		if (value.length >= 3) {
			setErrors((prev) => ({ ...prev, fullName: false }));
		} else {
			setErrors((prev) => ({ ...prev, fullName: true }));
		}
		setFullName(value);
	};

	const handleSetPhone = (value: string): void => {
		const phoneNumber = formatPhoneNumber(value);
		if (!phoneNumber || !phoneRegexWithSpaces.test(phoneNumber)) {
			setErrors((prev) => ({ ...prev, phoneNumber: true }));
		} else {
			setErrors((prev) => ({ ...prev, phoneNumber: false }));
		}
		setPhoneNumber(phoneNumber);
	};

	const handleSetEmail = (value: string): void => {
		if ((emailRegex.test(email) && email) || !email) {
			setErrors((prev) => ({ ...prev, email: false }));
		}
		setEmail(value);
	};

	const handleSetPassword = (value: string): void => {
		if ((passwordRegex.test(password) && password) || !password) {
			setErrors((prev) => ({ ...prev, password: false }));
		}
		setPassword(value);
	};

	const handleSetConfirmPassword = (value: string): void => {
		if (value === password) {
			setErrors((prev) => ({ ...prev, confirmPassword: false }));
		} else {
			setErrors((prev) => ({ ...prev, confirmPassword: true }));
		}
		setConfirmPassword(value);
	};

	const handleOnSignUp = async () => {
		if (
			fullName.length < 3 ||
			!phoneRegexWithSpaces.test(phoneNumber) ||
			!emailRegex.test(email) ||
			!passwordRegex.test(password) ||
			confirmPassword !== password
		) {
			setErrors({
				fullName: fullName.length < 3,
				phoneNumber: !phoneRegexWithSpaces.test(phoneNumber),
				email: !emailRegex.test(email),
				password: !passwordRegex.test(password),
				confirmPassword: !confirmPassword || confirmPassword !== password,
				signup: true,
			});
			return;
		}
		try {
			// Call your signup API here
			// If successful, redirect to the home screen
			router.replace('/(authenticated)/home');
		} catch (error) {
			setErrors((prev) => ({ ...prev, signup: true }));
			console.error('Signup error:', error);
		}
	};

	const handleResetAll = () => {
		setFullName('');
		setPhoneNumber('');
		setEmail('');
		setPassword('');
		setConfirmPassword('');
		setFocusedInput(null);
		setErrors({
			phoneNumber: false,
			fullName: false,
			email: false,
			password: false,
			confirmPassword: false,
			signup: false,
		});
	};

	return (
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
				<ThemedView style={styles.container} lightColor='#fff' darkColor='#fff'>
					<ThemedView style={styles.header} lightColor='#fff' darkColor='#fff'>
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
								{translations[language].categories.auth['signUp.title']}
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
								{translations[language].categories.auth['signUp.subtitle']}
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
										borderColor: errors.fullName
											? Colors[colorScheme].error
											: Colors[colorScheme].inputBorder,
									},
								]}
								lightColor={Colors.light.text}
								darkColor={Colors.light.text}
								value={fullName}
								setValue={handleSetFullName}
								placeholder={translations[language].categories.auth['fullName']}
								placeholderTextColor={Colors[colorScheme].text}
								keyboardType='default'
								onFocus={() => setFocusedInput('fullName')}
								onBlur={() => setFocusedInput(null)}
							/>
							<ThemedInput
								style={[
									styles.formInput,
									{
										borderColor: errors.phoneNumber
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
										borderColor: errors.email
											? Colors[colorScheme].error
											: Colors[colorScheme].inputBorder,
									},
								]}
								lightColor={Colors.light.text}
								darkColor={Colors.light.text}
								value={email}
								setValue={handleSetEmail}
								placeholder={translations[language].categories.auth['email']}
								placeholderTextColor={Colors[colorScheme].text}
								keyboardType='email-address'
								onFocus={() => setFocusedInput('email')}
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
								placeholder={translations[language].categories.auth['password']}
								placeholderTextColor={Colors[colorScheme].text}
								keyboardType='default'
								onFocus={() => setFocusedInput('password')}
								onBlur={() => setFocusedInput(null)}
							/>
							<ThemedInput
								style={[
									styles.formInput,
									{
										borderColor:
											focusedInput === 'confirmPassword'
												? Colors[colorScheme].tint
												: errors.confirmPassword
												? Colors[colorScheme].error
												: Colors[colorScheme].inputBorder,
									},
								]}
								lightColor={Colors.light.text}
								darkColor={Colors.light.text}
								value={confirmPassword}
								secureTextEntry={true}
								setValue={handleSetConfirmPassword}
								placeholder={
									translations[language].categories.auth['confirmPassword']
								}
								placeholderTextColor={Colors[colorScheme].text}
								keyboardType='default'
								onFocus={() => setFocusedInput('confirmPassword')}
								onBlur={() => setFocusedInput(null)}
							/>
							<ThemedButton
								title={translations[language].categories.auth[
									'signUp.button'
								]?.toUpperCase()}
								onPress={handleOnSignUp}
								style={{
									borderRadius: 8,
								}}
								darkColor={
									errors['signup']
										? Colors['dark'].buttonError
										: Colors['dark'].bim
								}
								lightColor={
									errors['signup']
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
									justifyContent: 'center',
								}}
							>
								<ThemedText
									style={{
										fontSize: 16,
										color: Colors[colorScheme].text,
										textAlign: 'center',
									}}
									lightColor={Colors.light.text}
									darkColor={Colors.dark.text}
								>
									{translations[language].categories.auth['haveAnAccount']}{' '}
								</ThemedText>
								<TouchableOpacity
									style={{
										flexDirection: 'row',
										backgroundColor: 'transparent',
										alignItems: 'center',
									}}
									onPress={() => router.push('/(auth)/login')}
								>
									<ThemedText style={{ color: Colors[colorScheme].bim }}>
										{translations[language].categories.auth['signIn']}
									</ThemedText>
								</TouchableOpacity>
							</ThemedView>
						</ThemedView>
					</ThemedView>
				</ThemedView>
			</ParallaxScrollView>
		</KeyboardAvoidingView>
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
