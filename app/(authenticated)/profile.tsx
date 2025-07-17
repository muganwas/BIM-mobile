import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useGeneral } from '@/context/GeneralContext';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useFocusEffect, useNavigation } from 'expo-router';
import { BackHandler, useColorScheme } from 'react-native';

export default function ProfileScreen() {
	const { user } = useGeneral(); // Get user from context
	const colorScheme = useColorScheme() ?? 'light';
	const navigation = useNavigation<DrawerNavigationProp<any>>();

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

	return (
		<ThemedView style={{ flex: 1, padding: 16 }}>
			<ThemedText style={{ color: Colors[colorScheme].text }}>
				Welcome, {user?.name || 'User'}!
			</ThemedText>
			{/* Add more profile related components here */}
		</ThemedView>
	);
}
