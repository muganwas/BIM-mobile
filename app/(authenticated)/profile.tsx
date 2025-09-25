import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedInput } from '@/components/ThemedInput';
import { ThemedText } from '@/components/ThemedText';
import TileContainer from '@/components/TileContainer';
import { Colors } from '@/constants/Colors';
import { fontSize, fontWeight } from '@/constants/Font';
import translations from '@/constants/Trans';
import { useGeneral } from '@/context/GeneralContext';
// avoid importing navigation types from @react-navigation/drawer which may not export them in some versions
import useTrackHistory from '@/hooks/useTrackHistory';
import { useFocusEffect, useNavigation } from 'expo-router';
import { useMemo, useState } from 'react';
import { BackHandler, useColorScheme, View } from 'react-native';

export default function ProfileScreen() {
	useTrackHistory('/(authenticated)/profile');
	const ctx = useGeneral();
	const user = ctx.user;
	const updateProfile = (ctx as any).updateProfile as
		| ((data: { name?: string; email?: string }) => void)
		| undefined;
	const colorScheme = useColorScheme() ?? 'light';
	const { language } = useGeneral();
	const navigation = useNavigation<any>();

	useFocusEffect(() => {
		const backHandler = BackHandler.addEventListener(
			'hardwareBackPress',
			() => {
				if (navigation.canGoBack()) {
					navigation.goBack();
					return true;
				}
				return false;
			}
		);
		return () => backHandler.remove();
	});

	// Tile 1: Profile details
	const [fullName, setFullName] = useState(user?.name ?? '');
	const [email, setEmail] = useState(user?.email ?? '');
	const profileChanged = useMemo(
		() => fullName !== (user?.name ?? '') || email !== (user?.email ?? ''),
		[fullName, email, user?.name, user?.email]
	);

	// Tile 2: Change password
	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');

	const passwordChangeValid = useMemo(() => {
		return (
			currentPassword.length > 0 &&
			newPassword.length > 0 &&
			newPassword === confirmPassword
		);
	}, [currentPassword, newPassword, confirmPassword]);

	// Tile 3: Delete account (confirmation handled elsewhere)

	const handleSaveProfile = () => {
		if (typeof updateProfile === 'function') {
			updateProfile({ name: fullName, email });
		}
	};

	const handleUpdatePassword = () => {
		// Implement password update flow (call API/context)
		console.log('Update password', {
			currentPassword,
			newPassword,
			confirmPassword,
		});
	};

	const handleDeleteAccount = () => {
		// Implement delete account flow (confirm modal + API call)
		console.log('Delete account');
	};

	return (
		<ParallaxScrollView
			headerBackgroundColor={{
				light: Colors.light.background,
				dark: Colors.dark.background,
			}}
			containerStyle={{ flex: 1 }}
			contentStyle={{ padding: 16 }}
		>
			{/* Tile 1: Profile Details */}
			<TileContainer
				id={'profile-details'}
				backgroundColor={Colors[colorScheme].background}
				style={{ marginBottom: 16, alignItems: 'stretch' }}
			>
				<ThemedText
					style={{
						fontSize: fontSize['heading.three'],
						fontWeight: fontWeight['heading.three'],
						color: Colors[colorScheme]['heading.one'],
					}}
					lightColor={Colors.light['heading.one']}
					darkColor={Colors.dark['heading.one']}
				>
					{translations[language].categories.auth['profile.details.title']}
				</ThemedText>

				<ThemedText
					style={{
						fontSize: fontSize['heading.one'],
						fontWeight: fontWeight['heading.one'],
						color: Colors[colorScheme].headers,
						marginTop: 4,
					}}
					lightColor={Colors.light.headers}
					darkColor={Colors.dark.headers}
				>
					{translations[language].categories.auth['profile.details.subtitle']}
				</ThemedText>

				<ThemedText style={{ color: Colors[colorScheme].text, marginTop: 8 }}>
					{
						translations[language].categories.auth[
							'profile.details.description'
						]
					}
				</ThemedText>

				<View style={{ marginTop: 12 }}>
					<ThemedInput
						label={
							translations[language].categories.auth[
								'profile.placeholder.fullName'
							]
						}
						value={fullName}
						setValue={setFullName}
						placeholder={'John Doe'}
						containerStyle={{ marginBottom: 8, width: '100%' }}
					/>
					<ThemedInput
						label={
							translations[language].categories.auth[
								'profile.placeholder.email'
							]
						}
						value={email}
						setValue={setEmail}
						placeholder={
							translations[language].categories.auth[
								'profile.placeholder.email'
							]
						}
						keyboardType='email-address'
						containerStyle={{ width: '100%' }}
					/>
				</View>

				<View style={{ marginTop: 12, alignItems: 'flex-end' }}>
					<ThemedButton
						title={
							translations[language].categories.auth['profile.details.button']
						}
						onPress={handleSaveProfile}
						lightColor={
							profileChanged ? Colors.light.bim : Colors.light.secondaryButton
						}
						darkColor={
							profileChanged ? Colors.dark.bim : Colors.dark.secondaryButton
						}
						lightTextColor={Colors.light.authButtonText}
						darkTextColor={Colors.dark.authButtonText}
						disabled={!profileChanged}
					/>
				</View>
			</TileContainer>

			{/* Tile 2: Change Password */}
			<TileContainer
				id={'change-password'}
				backgroundColor={Colors[colorScheme].background}
				style={{ marginBottom: 16, alignItems: 'stretch' }}
			>
				<ThemedText
					style={{
						fontSize: fontSize['heading.three'],
						fontWeight: fontWeight['heading.three'],
						color: Colors[colorScheme]['heading.one'],
					}}
					lightColor={Colors.light['heading.one']}
					darkColor={Colors.dark['heading.one']}
				>
					{translations[language].categories.auth['profile.password.title']}
				</ThemedText>

				<ThemedText
					style={{
						fontSize: fontSize['heading.one'],
						fontWeight: fontWeight['heading.one'],
						color: Colors[colorScheme].headers,
						marginTop: 4,
					}}
					lightColor={Colors.light.headers}
					darkColor={Colors.dark.headers}
				>
					{translations[language].categories.auth['profile.password.subtitle']}
				</ThemedText>

				<ThemedText style={{ color: Colors[colorScheme].text, marginTop: 8 }}>
					{
						translations[language].categories.auth[
							'profile.password.description'
						]
					}
				</ThemedText>

				<View style={{ marginTop: 12 }}>
					<ThemedInput
						label={
							translations[language].categories.auth[
								'profile.placeholder.currentPassword'
							]
						}
						value={currentPassword}
						setValue={setCurrentPassword}
						placeholder={'••••••••'}
						secureTextEntry
						containerStyle={{ marginBottom: 8, width: '100%' }}
					/>
					<ThemedInput
						label={
							translations[language].categories.auth[
								'profile.placeholder.newPassword'
							]
						}
						value={newPassword}
						setValue={setNewPassword}
						placeholder={'••••••••'}
						secureTextEntry
						containerStyle={{ marginBottom: 8, width: '100%' }}
					/>
					<ThemedInput
						label={
							translations[language].categories.auth[
								'profile.placeholder.confirmPassword'
							]
						}
						value={confirmPassword}
						setValue={setConfirmPassword}
						placeholder={'••••••••'}
						secureTextEntry
						containerStyle={{ width: '100%' }}
					/>
				</View>

				<View style={{ marginTop: 12, alignItems: 'flex-end' }}>
					<ThemedButton
						title={
							translations[language].categories.auth['profile.password.button']
						}
						onPress={handleUpdatePassword}
						lightColor={
							passwordChangeValid
								? Colors.light.bim
								: Colors.light.secondaryButton
						}
						darkColor={
							passwordChangeValid
								? Colors.dark.bim
								: Colors.dark.secondaryButton
						}
						lightTextColor={Colors.light.authButtonText}
						darkTextColor={Colors.dark.authButtonText}
						disabled={!passwordChangeValid}
					/>
				</View>
			</TileContainer>

			{/* Tile 3: Delete Account */}
			<TileContainer
				id={'delete-account'}
				backgroundColor={Colors[colorScheme].background}
				style={{ marginBottom: 16, alignItems: 'stretch' }}
			>
				<ThemedText
					style={{
						fontSize: fontSize['heading.three'],
						fontWeight: fontWeight['heading.three'],
						color: Colors[colorScheme]['heading.one'],
					}}
					lightColor={Colors.light['heading.one']}
					darkColor={Colors.dark['heading.one']}
				>
					{translations[language].categories.auth['profile.delete.title']}
				</ThemedText>

				<ThemedText
					style={{
						fontSize: fontSize['heading.one'],
						fontWeight: fontWeight['heading.one'],
						color: Colors[colorScheme].headers,
						marginTop: 4,
					}}
					lightColor={Colors.light.headers}
					darkColor={Colors.dark.headers}
				>
					{translations[language].categories.auth['profile.delete.subtitle']}
				</ThemedText>

				<ThemedText style={{ color: Colors[colorScheme].text, marginTop: 8 }}>
					{translations[language].categories.auth['profile.delete.description']}
				</ThemedText>

				<View style={{ marginTop: 12, alignItems: 'flex-end' }}>
					<ThemedButton
						title={
							translations[language].categories.auth['profile.delete.button']
						}
						onPress={handleDeleteAccount}
						lightColor={Colors.light.dangerButton}
						darkColor={Colors.dark.dangerButton}
						lightTextColor={Colors.light.white}
						darkTextColor={Colors.dark.white}
					/>
				</View>
			</TileContainer>
		</ParallaxScrollView>
	);
}
