import { Colors } from '@/constants/Colors';
import { fontSize } from '@/constants/Font';
import translations from '@/constants/Trans';
import { useGeneral } from '@/context/GeneralContext';
import { notifications } from '@/types';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation, useRouter } from 'expo-router';
import { useState } from 'react';
import {
	Animated,
	Image,
	StyleSheet,
	TouchableOpacity,
	useAnimatedValue,
	useColorScheme,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HeaderDropDownContainer from './HeaderDropDownContainer';
import { ThemedInput } from './ThemedInput';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { IconSymbol } from './ui/IconSymbol';

export default function Header({
	dp,
	notifications,
	online,
}: {
	dp?: string;
	notifications?: notifications[];
	online: boolean;
}) {
	const insets = useSafeAreaInsets();
	const colorScheme = useColorScheme() ?? 'light';
	const router = useRouter();
	const profileAnimValue = useAnimatedValue(0);
	const searchAnimValue = useAnimatedValue(0);
	const notificationsAnimValue = useAnimatedValue(0);
	const { user, handleLogout, language } = useGeneral(); // Get user from context
	const navigation = useNavigation<DrawerNavigationProp<any>>();
	const [searchValue, setSearchValue] = useState('');
	const [showSearchInput, setShowSearchInput] = useState(false);
	const [showLanguageSelection, setShowLanguageSelection] = useState(false);
	const [showNotifications, setShowNotifications] = useState(false);
	const [showProfile, setShowProfile] = useState(false);

	const toggleDrawer = () => {
		navigation.toggleDrawer();
	};

	const toggleSearchInput = () => {
		setShowSearchInput((prev) => {
			if (!prev) {
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
			return !prev;
		});
	};

	const toggleLanguageSelection = () => {
		console.log('Language selection toggled');
	};

	const toggleNotifications = () => {
		setShowNotifications((prev) => {
			if (!prev) {
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
			return !prev;
		});
	};

	const toggleProfile = () => {
		setShowProfile((prev) => {
			if (!prev) {
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
			return !prev;
		});
	};

	return (
		<ThemedView
			lightColor={Colors[colorScheme].headerBackgroung}
			darkColor={Colors[colorScheme].headerBackgroung}
			style={[styles.container, { paddingTop: insets.top + 10 }]}
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
				<TouchableOpacity onPress={toggleSearchInput}>
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
						fontSize: fontSize['text.medium'],
						height: 40,
						paddingVertical: 0,
						backgroundColor: Colors[colorScheme].inputBackground,
					}}
					value={searchValue}
					setValue={setSearchValue}
				/>
			</Animated.View>
			<ThemedView
				lightColor={Colors[colorScheme].headerBackgroung}
				darkColor={Colors[colorScheme].headerBackgroung}
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'flex-end',
					gap: 10,
					paddingRight: 10,
					flex: 3,
				}}
			>
				<TouchableOpacity onPress={toggleLanguageSelection}>
					<IconSymbol
						name='translate'
						size={24}
						color={Colors[colorScheme].headerIcons}
						style={{ marginRight: 10 }}
					/>
				</TouchableOpacity>
				<TouchableOpacity onPress={toggleNotifications}>
					{notifications && notifications.length > 0 ? (
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
					onPress={toggleProfile}
				>
					<Image
						source={
							dp ? { uri: dp } : require('@/assets/images/avatar-male.png')
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
				visible={showNotifications}
				fadeAnim={notificationsAnimValue}
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
							backgroundColor: Colors[colorScheme].notificationsCountBackground,
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
			</HeaderDropDownContainer>
			<HeaderDropDownContainer
				visible={showProfile}
				fadeAnim={profileAnimValue}
			>
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
								dp ? { uri: dp } : require('@/assets/images/avatar-male.png')
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
							setShowProfile(false);
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
						onPress={handleLogout}
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
			</HeaderDropDownContainer>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center', // Add this for vertical centering
		height: 70,
		width: '100%',
		paddingHorizontal: 16,
		zIndex: 10, // Ensure it's above other content
	},
});
