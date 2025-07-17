import { Drawer } from 'expo-router/drawer';
import React from 'react';

import Header from '@/components/Header';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useGeneral } from '@/context/GeneralContext';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function DrawerLayout() {
	const { user, notifications, online } = useGeneral(); // Get user from context
	const colorScheme = useColorScheme();

	return (
		<Drawer
			screenOptions={{
				headerShown: true,
				drawerActiveTintColor: Colors[colorScheme ?? 'light'].tint,
				header: () => (
					<Header
						online={online}
						dp={user?.avatarUrl}
						notifications={notifications}
					/>
				),
				drawerStyle: {
					backgroundColor: Colors[colorScheme ?? 'light'].background,
				},
			}}
		>
			<Drawer.Screen
				name='home'
				options={{
					title: 'Home',
					drawerIcon: ({ color }: { color: string }) => (
						<IconSymbol size={28} name='house.fill' color={color} />
					),
				}}
			/>
			{/* Add more drawer screens as needed */}
		</Drawer>
	);
}
