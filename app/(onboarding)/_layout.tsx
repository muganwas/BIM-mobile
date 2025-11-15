import { Tabs } from 'expo-router';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
// useColorScheme not required in onboarding layout
import { useThemeColor } from '@/hooks/useThemeColor';
import useTrackHistory from '@/hooks/useTrackHistory';

export default function AuthLayout() {
	const tint = useThemeColor({}, 'tint');

	// track onboarding layout group
	useTrackHistory('/(onboarding)/_layout');

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: tint,
				headerShown: false,
				tabBarButton: HapticTab,
				tabBarBackground: TabBarBackground,
				tabBarStyle: {
					display: 'none',
				},
			}}
		></Tabs>
	);
}
