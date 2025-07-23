import { Drawer } from 'expo-router/drawer';
import React from 'react';

import Header from '@/components/Header';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import translations from '@/constants/Trans';
import { useGeneral } from '@/context/GeneralContext';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function DrawerLayout() {
	const { language } = useGeneral(); // Get user from context
	const colorScheme = useColorScheme();

	return (
		<Drawer
			screenOptions={{
				headerShown: true,
				drawerActiveTintColor: Colors[colorScheme ?? 'light'].tint,
				header: () => <Header />,
				drawerStyle: {
					backgroundColor: Colors[colorScheme ?? 'light'].background,
				},
			}}
		>
			<Drawer.Screen
				name='home'
				options={{
					title: translations[language].categories.navigation['home'],
					drawerIcon: ({ color }: { color: string }) => (
						<IconSymbol size={28} name='house.fill' color={color} />
					),
				}}
			/>
			<Drawer.Screen
				name='profile'
				options={{
					title: translations[language].categories.navigation['profile'],
					drawerItemStyle: {
						display: 'none',
					},
				}}
			/>
			<Drawer.Screen
				name='notifications'
				options={{
					title: translations[language].categories.navigation['notifications'],
					drawerItemStyle: {
						display: 'none',
					},
				}}
			/>
			{/* Add more drawer screens as needed */}
		</Drawer>
	);
}
