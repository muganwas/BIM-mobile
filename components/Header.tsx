import { Colors } from '@/constants/Colors';
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
	const AnimValue = useAnimatedValue(0);
	const { user, handleLogout } = useGeneral(); // Get user from context
	const navigation = useNavigation<DrawerNavigationProp<any>>();
	const [showSearchInput, setShowSearchInput] = useState(false);
	const [showLanguageSelection, setShowLanguageSelection] = useState(false);
	const [showNotifications, setShowNotifications] = useState(false);
	const [showProfile, setShowProfile] = useState(false);

	const toggleDrawer = () => {
		navigation.toggleDrawer();
	};

	const toggleSearchInput = () => {
		// Implement search input toggle logic here
		console.log('Search input toggled');
	};

	const toggleLanguageSelection = () => {
		console.log('Language selection toggled');
	};

	const toggleNotifications = () => {
		console.log('Notifications toggled');
	};

	const toggleProfile = () => {
		setShowProfile((prev) => {
			if (!prev) {
				Animated.timing(AnimValue, {
					toValue: 1, // Example animation value change
					duration: 200,
					useNativeDriver: true,
				}).start();
			} else {
				Animated.timing(AnimValue, {
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
			lightColor='#fff'
			darkColor='#fff'
			style={[styles.container, { paddingTop: insets.top + 10 }]}
		>
			<ThemedView
				lightColor='#fff'
				darkColor='#fff'
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
						size={28}
						color={Colors[colorScheme].text}
						style={{ marginRight: 10 }}
					/>
				</TouchableOpacity>
				<TouchableOpacity onPress={toggleSearchInput}>
					<IconSymbol
						name='search.outline'
						size={28}
						color={Colors[colorScheme].headerIcons}
						style={{ marginRight: 10 }}
					/>
				</TouchableOpacity>
			</ThemedView>
			<ThemedView
				lightColor='#fff'
				darkColor='#fff'
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
						size={28}
						color={Colors[colorScheme].headerIcons}
						style={{ marginRight: 10 }}
					/>
				</TouchableOpacity>
				<TouchableOpacity onPress={toggleNotifications}>
					{notifications && notifications.length > 0 ? (
						<IconSymbol
							name='notifications.outline.badge'
							size={28}
							color={Colors[colorScheme].headerIcons}
							style={{ marginRight: 10 }}
						/>
					) : (
						<IconSymbol
							name='notifications.outline'
							size={28}
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
			<Animated.View
				id='test-id-header-profile'
				style={{
					position: 'absolute',
					flexDirection: 'column',
					display: showProfile ? 'flex' : 'none',
					transform: [{ scaleY: AnimValue }],
					left: 10,
					right: 10,
					top: 60 + insets.top,
					backgroundColor: Colors[colorScheme].background,
					padding: 10,
					borderRadius: 10,
					shadowColor: '#000',
					shadowOffset: { width: 0, height: 2 },
					shadowOpacity: 0.25,
					shadowRadius: 3.84,
					elevation: 5,
					zIndex: 1000, // Ensure it appears above other content
					maxHeight: 300, // Limit height for better UX
					overflow: 'hidden',
				}}
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
							style={{ fontSize: 16, color: Colors[colorScheme].text }}
						>
							{user?.name || 'User Name'}
						</ThemedText>
						<ThemedText
							style={{ fontSize: 14, color: Colors[colorScheme].text }}
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
								fontSize: 14,
							}}
						>
							My Profile
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
								fontSize: 14,
							}}
						>
							Logout
						</ThemedText>
					</TouchableOpacity>
				</ThemedView>
			</Animated.View>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: 'white',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center', // Add this for vertical centering
		height: 70,
		width: '100%',
		paddingHorizontal: 16,
		zIndex: 10, // Ensure it's above other content
	},
});
