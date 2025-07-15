import { notifications } from '@/types';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from 'expo-router';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
	const navigation = useNavigation<DrawerNavigationProp<any>>();

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
		console.log('Profile toggled');
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
						color='black'
						style={{ marginRight: 10 }}
					/>
				</TouchableOpacity>
				<TouchableOpacity onPress={toggleSearchInput}>
					<IconSymbol
						name='search.outline'
						size={28}
						color={online ? 'black' : 'gray'}
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
						color={online ? 'black' : 'gray'}
						style={{ marginRight: 10 }}
					/>
				</TouchableOpacity>
				<TouchableOpacity onPress={toggleNotifications}>
					{notifications && notifications.length > 0 ? (
						<IconSymbol
							name='notifications.outline.badge'
							size={28}
							color={online ? 'black' : 'gray'}
							style={{ marginRight: 10 }}
						/>
					) : (
						<IconSymbol
							name='notifications.outline'
							size={28}
							color={online ? 'black' : 'gray'}
							style={{ marginRight: 10 }}
						/>
					)}
				</TouchableOpacity>
				<TouchableOpacity onPress={toggleProfile}>
					<Image
						source={
							dp ? { uri: dp } : require('@/assets/images/avatar-male.png')
						}
						style={{ width: 40, height: 40, borderRadius: 20 }}
					/>
				</TouchableOpacity>
			</ThemedView>
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
