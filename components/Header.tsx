import { Colors } from '@/constants/Colors';
import { fontSize } from '@/constants/Font';
import translations from '@/constants/Trans';
import { useGeneral } from '@/context/GeneralContext';
import { langCode } from '@/types';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
	Animated,
	Image,
	Platform,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	useAnimatedValue,
	useColorScheme,
	View,
} from 'react-native';
import HeaderDropDownContainer from './HeaderDropDownContainer';
import { ThemedButton } from './ThemedButton';
import { ThemedInput } from './ThemedInput';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { IconSymbol } from './ui/IconSymbol';

export default function Header() {
	const colorScheme = useColorScheme() ?? 'light';
	const router = useRouter();
	const profileAnimValue = useAnimatedValue(0);
	const searchAnimValue = useAnimatedValue(0);
	const notificationsAnimValue = useAnimatedValue(0);
	const languageAnimValue = useAnimatedValue(0);
	const {
		user,
		handleLogout,
		language,
		setLanguage,
		notifications,
		setNotifications,
		selectedOption,
		setSelectedOption,
		online,
	} = useGeneral(); // Get user from context
	const navigation = useNavigation<DrawerNavigationProp<any>>();
	const [searchValue, setSearchValue] = useState('');
	const [showSearchInput, setShowSearchInput] = useState(false);
	const [showLanguageSelection, setShowLanguageSelection] = useState(false);
	const [showNotifications, setShowNotifications] = useState(false);
	const [showProfile, setShowProfile] = useState(false);

	const toggleDrawer = () => {
		setSelectedOption(undefined);
		navigation.toggleDrawer();
	};

	const toggleLanguageSelection = useCallback(
		(v?: boolean) => {
			setShowLanguageSelection((prev) => {
				const newvalue = v ?? !prev;
				if (newvalue) {
					Animated.timing(languageAnimValue, {
						toValue: 1, // Example animation value change
						duration: 200,
						useNativeDriver: false,
					}).start();
				} else {
					Animated.timing(languageAnimValue, {
						toValue: 0, // Reset animation value
						duration: 150,
						useNativeDriver: false,
					}).start();
				}
				return newvalue;
			});
		},
		[languageAnimValue]
	);

	const toggleSearchInput = useCallback(
		(v?: boolean) => {
			setShowSearchInput((prev) => {
				const newvalue = v ?? !prev;
				if (newvalue) {
					Animated.timing(searchAnimValue, {
						toValue: 1, // Example animation value change
						duration: 200,
						useNativeDriver: true,
					}).start();
				} else {
					Animated.timing(searchAnimValue, {
						toValue: 0, // Reset animation value
						duration: 150,
						useNativeDriver: true,
					}).start();
				}
				return newvalue;
			});
		},
		[searchAnimValue]
	);

	const toggleNotifications = useCallback(
		(v?: boolean) => {
			setShowNotifications((prev) => {
				const newvalue = v ?? !prev;
				if (newvalue) {
					Animated.timing(notificationsAnimValue, {
						toValue: 1, // Example animation value change
						duration: 200,
						useNativeDriver: true,
					}).start();
				} else {
					Animated.timing(notificationsAnimValue, {
						toValue: 0, // Reset animation value
						duration: 150,
						useNativeDriver: true,
					}).start();
				}
				return newvalue;
			});
		},
		[notificationsAnimValue]
	);

	const toggleProfile = useCallback(
		(v?: boolean) => {
			setShowProfile((prev) => {
				const newvalue = v ?? !prev;
				if (newvalue) {
					Animated.timing(profileAnimValue, {
						toValue: 1, // Example animation value change
						duration: 200,
						useNativeDriver: true,
					}).start();
				} else {
					Animated.timing(profileAnimValue, {
						toValue: 0, // Reset animation value
						duration: 150,
						useNativeDriver: true,
					}).start();
				}
				return newvalue;
			});
		},
		[profileAnimValue]
	);

	useEffect(() => {
		if (!selectedOption) {
			toggleLanguageSelection(false);
			toggleSearchInput(false);
			toggleNotifications(false);
			toggleProfile(false);
		} else if (selectedOption === 'notifications') {
			toggleLanguageSelection(false);
			toggleSearchInput(false);
			toggleProfile(false);
			toggleNotifications(true);
		} else if (selectedOption === 'profile') {
			toggleLanguageSelection(false);
			toggleSearchInput(false);
			toggleNotifications(false);
			toggleProfile(true);
		} else if (selectedOption === 'language') {
			toggleSearchInput(false);
			toggleNotifications(false);
			toggleProfile(false);
			toggleLanguageSelection(true);
		} else if (selectedOption === 'search') {
			toggleLanguageSelection(false);
			toggleNotifications(false);
			toggleProfile(false);
			toggleSearchInput(true);
		}
	}, [
		selectedOption,
		toggleNotifications,
		toggleProfile,
		toggleLanguageSelection,
		toggleSearchInput,
	]);

	return (
		<ThemedView
			lightColor={Colors[colorScheme].headerBackground}
			darkColor={Colors[colorScheme].headerBackground}
			style={[styles.container]}
		>
			<Animated.View
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'space-between',
					flex: 1,
				}}
			>
				<TouchableOpacity onPress={toggleDrawer}>
					<IconSymbol
						name='menu'
						size={24}
						color={Colors[colorScheme].text}
						style={{ marginRight: 10 }}
					/>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={() =>
						selectedOption === 'search'
							? setSelectedOption(undefined)
							: setSelectedOption('search')
					}
				>
					<IconSymbol
						name='search.outline'
						size={24}
						color={Colors[colorScheme].headerIcons}
						style={{ marginRight: 10 }}
					/>
				</TouchableOpacity>
			</Animated.View>
			<Animated.View
				id='test-id-header-search'
				style={{
					opacity: searchAnimValue,
					transform: [{ scaleX: searchAnimValue }],
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'center',
					flex: 2,
				}}
			>
				<ThemedInput
					lightColor={Colors[colorScheme].text}
					darkColor={Colors[colorScheme].text}
					containerStyle={{ height: 40, flex: 1, marginLeft: 10 }}
					style={{
						display: showSearchInput ? 'flex' : 'none',
						fontSize: fontSize['text.medium'],
						height: 40,
						paddingVertical: 0,
						backgroundColor: Colors[colorScheme].inputBackground,
					}}
					placeholder='Search...'
					value={searchValue}
					setValue={setSearchValue}
				/>
			</Animated.View>
			<ThemedView
				lightColor={Colors[colorScheme].headerBackground}
				darkColor={Colors[colorScheme].headerBackground}
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'flex-end',
					gap: 10,
					flex: 3,
				}}
			>
				<TouchableOpacity
					onPress={() =>
						selectedOption === 'language'
							? setSelectedOption(undefined)
							: setSelectedOption('language')
					}
				>
					<IconSymbol
						name='translate'
						size={24}
						color={Colors[colorScheme].headerIcons}
						style={{ marginRight: 10 }}
					/>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={() =>
						selectedOption === 'notifications'
							? setSelectedOption(undefined)
							: setSelectedOption('notifications')
					}
				>
					{notifications &&
					notifications.length > 0 &&
					notifications.filter((n) => !n.isRead).length > 0 ? (
						<IconSymbol
							name='notifications.outline.badge'
							size={24}
							color={Colors[colorScheme].headerIcons}
							style={{ marginRight: 10 }}
						/>
					) : (
						<IconSymbol
							name='notifications.outline'
							size={24}
							color={Colors[colorScheme].headerIcons}
							style={{ marginRight: 10 }}
						/>
					)}
				</TouchableOpacity>
				<TouchableOpacity
					style={{
						position: 'relative',
						height: 40,
					}}
					onPress={() =>
						selectedOption === 'profile'
							? setSelectedOption(undefined)
							: setSelectedOption('profile')
					}
				>
					<Image
						source={
							user?.avatarUrl
								? { uri: user.avatarUrl }
								: require('@/assets/images/avatar-male.png')
						}
						style={{ width: 40, height: 40, borderRadius: 20 }}
					/>
					<View
						style={{
							position: 'absolute',
							bottom: 0,
							right: 0,
							backgroundColor: online ? '#72e128' : 'red',
							width: 10,
							height: 10,
							borderWidth: 2,
							borderColor: '#fff',
							borderRadius: 5,
						}}
					/>
				</TouchableOpacity>
			</ThemedView>
			<HeaderDropDownContainer
				id='header-language'
				visible={showLanguageSelection}
				fadeAnim={languageAnimValue}
			>
				<ScrollView
					style={{
						maxHeight: 200,
						gap: 5,
						backgroundColor: Colors[colorScheme].headerDropdownBackground,
					}}
					contentContainerStyle={{
						flexGrow: 1,
					}}
					keyboardShouldPersistTaps='handled'
					keyboardDismissMode={'on-drag'}
					showsVerticalScrollIndicator={true}
					nestedScrollEnabled={true}
					scrollEnabled={true}
					onScroll={() => console.log('scrolling')}
				>
					{Object.entries(translations).map(([key, value]) => (
						<TouchableOpacity
							key={key}
							onPress={() => {
								if (value.active) {
									setLanguage(key as langCode);
								}
								setSelectedOption(undefined);
							}}
							style={{
								display: value.active ? 'flex' : 'none',
								borderBottomColor: Colors[colorScheme].border,
								borderTopColor: Colors[colorScheme].border,
								backgroundColor: Colors[colorScheme].languageButtonBackground,
								borderTopWidth: 1,
								paddingVertical: 10,
								paddingHorizontal: 5,
							}}
							activeOpacity={0.7}
						>
							<ThemedText
								style={{
									fontSize: fontSize['text.medium'],
								}}
								lightColor={Colors[colorScheme].text}
								darkColor={Colors[colorScheme].text}
							>
								{value.name}
							</ThemedText>
						</TouchableOpacity>
					))}
				</ScrollView>
			</HeaderDropDownContainer>
			<HeaderDropDownContainer
				id='header-notifications'
				visible={showNotifications}
				fadeAnim={notificationsAnimValue}
			>
				<ThemedView
					style={{
						flexDirection: 'column',
						gap: 10,
					}}
					lightColor={Colors[colorScheme].headerDropdownBackground}
					darkColor={Colors[colorScheme].headerDropdownBackground}
				>
					<ThemedView
						style={{
							flexDirection: 'row',
							justifyContent: 'space-between',
							alignItems: 'center',
						}}
						lightColor={Colors[colorScheme].headerDropdownBackground}
						darkColor={Colors[colorScheme].headerDropdownBackground}
					>
						<ThemedText
							lightColor={Colors.light['heading.one']}
							darkColor={Colors.dark['heading.one']}
							style={{
								fontSize: fontSize['text.medium'],
							}}
						>
							{translations[language].categories.notifications.title}
						</ThemedText>
						<View
							style={{
								boxSizing: 'border-box',
								flexDirection: 'row',
								paddingHorizontal: 6.5,
								alignItems: 'center',
								justifyContent: 'center',
								borderRadius: 80,
								backgroundColor:
									Colors[colorScheme].notificationsCountBackground,
							}}
						>
							<ThemedText
								style={{
									fontSize: fontSize['text.xsmall'],
									fontWeight: 500,
									padding: 0,
									margin: 0,
								}}
								lightColor={Colors[colorScheme].notificationsCount}
								darkColor={Colors[colorScheme].notificationsCount}
							>
								{notifications &&
								notifications.length > 0 &&
								notifications.filter((n) => !n.isRead).length > 0
									? notifications.filter((n) => !n.isRead).length
									: '0'}{' '}
								New
							</ThemedText>
						</View>
					</ThemedView>
					<ThemedView
						style={{
							paddingBottom: 3,
						}}
						lightColor={Colors[colorScheme].headerBackground}
						darkColor={Colors[colorScheme].headerBackground}
					>
						{/* Display notifications here last 5 */}
						{notifications && notifications.length > 0 ? (
							notifications.slice(0, 5).map((notification, index) => (
								<TouchableOpacity
									key={index}
									onPress={() => {
										const isRead = notification.isRead;
										if (!isRead) {
											const currentNotifications = notifications.map((n) =>
												n.id === notification.id ? { ...n, isRead: true } : n
											);
											setNotifications(currentNotifications);
										}
										router.push({
											pathname: '/(authenticated)/notifications',
											params: { notificationId: notification.id },
										});
										setSelectedOption(undefined);
									}}
									style={{
										borderBottomColor: Colors[colorScheme].border,
										borderTopColor: Colors[colorScheme].border,
										backgroundColor: Colors[colorScheme].listItemBackground,
										borderTopWidth: index === 0 ? 1 : 0,
										paddingVertical: 0,
										paddingHorizontal: 5,
										borderBottomWidth: 1,
									}}
									activeOpacity={0.7}
								>
									<ThemedText
										key={index}
										style={{
											fontSize: fontSize['text.small'],
										}}
									>
										{notification.message}
									</ThemedText>
								</TouchableOpacity>
							))
						) : (
							<ThemedText
								lightColor={Colors[colorScheme].text}
								darkColor={Colors[colorScheme].text}
								style={{
									fontSize: fontSize['text.small'],
									padding: 10,
								}}
							>
								{
									translations[language].categories.notifications[
										'no.notifications'
									]
								}
							</ThemedText>
						)}
					</ThemedView>
					<ThemedView
						style={{
							flexDirection: 'row',
							justifyContent: 'flex-end',
							paddingTop: 10,
							borderTopColor: Colors[colorScheme].inputBorder,
							borderTopWidth: 1,
						}}
						lightColor={Colors[colorScheme].headerDropdownBackground}
						darkColor={Colors[colorScheme].headerDropdownBackground}
					>
						<ThemedButton
							title={translations[language].categories.notifications[
								'seeAll'
							]?.toUpperCase()}
							onPress={() => {
								router.push('/(authenticated)/notifications');
								setSelectedOption(undefined);
							}}
							style={{
								borderRadius: 8,
								width: '100%',
							}}
							darkColor={Colors['dark'].bim}
							lightColor={Colors['light'].bim}
							darkTextColor={Colors['dark'].authButtonText}
							lightTextColor={Colors['light'].authButtonText}
						/>
					</ThemedView>
				</ThemedView>
			</HeaderDropDownContainer>
			<HeaderDropDownContainer
				id='header-profile'
				visible={showProfile}
				fadeAnim={profileAnimValue}
			>
				<>
					<ThemedView
						style={{
							backgroundColor: Colors[colorScheme].background,
							flexDirection: 'row',
							justifyContent: 'flex-start',
							borderBottomColor: Colors[colorScheme].border,
							borderBottomWidth: 1,
							paddingBottom: 10,
							gap: 10,
						}}
					>
						<ThemedView style={{ height: 40, position: 'relative' }}>
							<Image
								source={
									user?.avatarUrl
										? { uri: user.avatarUrl }
										: require('@/assets/images/avatar-male.png')
								}
								style={{ width: 40, height: 40, borderRadius: 20 }}
							/>
							<View
								style={{
									position: 'absolute',
									bottom: 0,
									right: 0,
									backgroundColor: online ? '#72e128' : 'red',
									width: 10,
									height: 10,
									borderWidth: 2,
									borderColor: '#fff',
									borderRadius: 5,
								}}
							/>
						</ThemedView>
						<ThemedView
							style={{
								flexDirection: 'column',
								justifyContent: 'center',
								marginLeft: 10,
							}}
						>
							<ThemedText
								style={{
									fontSize: fontSize['text.large'],
									color: Colors[colorScheme].text,
								}}
							>
								{user?.name || 'John Doe'}
							</ThemedText>
							<ThemedText
								style={{
									fontSize: fontSize['text.medium'],
									color: Colors[colorScheme].text,
								}}
							>
								{user?.email || 'jd@mail.com'}
							</ThemedText>
						</ThemedView>
					</ThemedView>
					<ThemedView
						style={{
							marginTop: 10,
							flexDirection: 'column',
							gap: 10,
						}}
					>
						<TouchableOpacity
							style={{
								flexDirection: 'row',
								alignItems: 'center',
								justifyContent: 'flex-start',
							}}
							onPress={() => {
								router.push('/(authenticated)/profile');
								setSelectedOption(undefined);
							}}
						>
							<IconSymbol
								name='account'
								size={18}
								color={Colors[colorScheme].text}
								style={{ marginRight: 10 }}
							/>
							<ThemedText
								style={{
									color: Colors[colorScheme].text,
									fontSize: fontSize['text.medium'],
								}}
							>
								{translations[language].categories.navigation['profile']}
							</ThemedText>
						</TouchableOpacity>
						<TouchableOpacity
							style={{
								flexDirection: 'row',
								alignItems: 'center',
								justifyContent: 'flex-start',
							}}
							onPress={() => {
								setSelectedOption(undefined);
								handleLogout();
							}}
						>
							<IconSymbol
								name='logout'
								size={18}
								color={Colors[colorScheme].text}
								style={{ marginRight: 10 }}
							/>
							<ThemedText
								style={{
									color: Colors[colorScheme].text,
									fontSize: fontSize['text.medium'],
								}}
							>
								{translations[language].categories.navigation['logout']}
							</ThemedText>
						</TouchableOpacity>
					</ThemedView>
				</>
			</HeaderDropDownContainer>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		position: 'relative',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center', // Add this for vertical centering
		height: 60,
		marginTop: Platform.OS === 'ios' ? 50 : 40,
		width: '100%',
		paddingHorizontal: 10,
		zIndex: 10, // Ensure it's above other content
	},
});
