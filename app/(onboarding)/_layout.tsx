import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import useTrackHistory from '@/hooks/useTrackHistory';

export default function AuthLayout() {
	const colorScheme = useColorScheme();

	// track onboarding layout group
	useTrackHistory('/(onboarding)/_layout');

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
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
