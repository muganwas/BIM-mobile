import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useGeneral } from '@/context/GeneralContext';
// avoid importing navigation types from @react-navigation/drawer which may not export them in some versions
import useTrackHistory from '@/hooks/useTrackHistory';
import { useFocusEffect, useNavigation } from 'expo-router';
import { BackHandler, useColorScheme } from 'react-native';

export default function ProfileScreen() {
	useTrackHistory('/(authenticated)/profile');
	const { user } = useGeneral(); // Get user from context
	const colorScheme = useColorScheme() ?? 'light';
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

	return (
		<ParallaxScrollView
			headerBackgroundColor={{
				light: Colors.light.background,
				dark: Colors.dark.background,
			}}
			containerStyle={{ flex: 1 }}
			contentStyle={{ padding: 16 }}
		>
			<ThemedText style={{ color: Colors[colorScheme].text }}>
				Welcome, {user?.name || 'User'}!
			</ThemedText>
			{/* Add more profile related components here */}
		</ParallaxScrollView>
	);
}
