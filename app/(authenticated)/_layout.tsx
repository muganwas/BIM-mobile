import { Drawer } from 'expo-router/drawer';
import React from 'react';

import DrawerHeader from '@/components/DrawerHeader';
import Header from '@/components/Header';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { fontSize, fontWeight } from '@/constants/Font';
import translations from '@/constants/Trans';
import { useGeneral } from '@/context/GeneralContext';
import { TransactionProvider } from '@/context/TransactionContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import {
	DrawerContentScrollView,
	DrawerItemList,
} from '@react-navigation/drawer';
import { View } from 'react-native';

// Custom drawer content with header
function CustomDrawerContent(props: any) {
	return (
		<DrawerContentScrollView
			contentContainerStyle={{
				padding: 0,
			}}
			style={{
				padding: 0,
			}}
			{...props}
		>
			{/* Add your custom header here */}
			<View
				style={{
					paddingVertical: 5,
				}}
			>
				<DrawerHeader navigation={props.navigation} />
			</View>

			{/* Default drawer items */}
			<DrawerItemList
				itemStyle={{
					margin: 0,
					padding: 0,
				}}
				{...props}
			/>
		</DrawerContentScrollView>
	);
}

export default function DrawerLayout() {
	const { language } = useGeneral(); // Get user from context
	const colorScheme = useColorScheme() ?? 'light'; // Default to light mode if color scheme is not set

	return (
		<TransactionProvider>
			<Drawer
				drawerContent={(props) => <CustomDrawerContent {...props} />}
				screenOptions={{
					headerShown: true,
					drawerActiveTintColor: Colors[colorScheme].drawerItem,
					drawerActiveBackgroundColor:
						Colors[colorScheme].drawerActiveBackground,
					header: () => <Header />,
					drawerStyle: {
						backgroundColor: Colors[colorScheme].drawerBackground,
					},
					drawerItemStyle: {
						backgroundColor: Colors[colorScheme].drawerButtonBackground,
						borderRadius: 0,
						marginLeft: -10,
					},
					drawerLabelStyle: {
						fontSize: fontSize['text.large'],
						fontWeight: fontWeight['text.xsmall'],
					},
				}}
			>
				<Drawer.Screen
					name='home'
					options={{
						title: translations[language].categories.navigation['home'],
						drawerIcon: ({ color }: { color: string }) => (
							<IconSymbol size={24} name='home.outline' color={color} />
						),
					}}
				/>
				<Drawer.Screen
					name='routers'
					options={{
						title: translations[language].categories.navigation['routers'],
						drawerIcon: ({ color }: { color: string }) => (
							<IconSymbol size={24} name='routers.outline' color={color} />
						),
					}}
				/>
				<Drawer.Screen
					name='packages'
					options={{
						title: translations[language].categories.navigation['packages'],
						drawerIcon: ({ color }: { color: string }) => (
							<IconSymbol size={24} name='packages' color={color} />
						),
					}}
				/>
				<Drawer.Screen
					name='vouchers'
					options={{
						title: translations[language].categories.navigation['vouchers'],
						drawerIcon: ({ color }: { color: string }) => (
							<IconSymbol size={24} name='vouchers' color={color} />
						),
					}}
				/>
				<Drawer.Screen
					name='transactions'
					options={{
						title: translations[language].categories.navigation['transactions'],
						drawerIcon: ({ color }: { color: string }) => (
							<IconSymbol size={24} name='transactions' color={color} />
						),
					}}
				/>
				<Drawer.Screen
					name='withdraw'
					options={{
						title: translations[language].categories.navigation['withdraw'],
						drawerIcon: ({ color }: { color: string }) => (
							<IconSymbol size={24} name='withdrawal' color={color} />
						),
					}}
				/>
				<Drawer.Screen
					name='banks'
					options={{
						title: translations[language].categories.navigation['banks'],
						drawerIcon: ({ color }: { color: string }) => (
							<IconSymbol size={24} name='bank' color={color} />
						),
					}}
				/>
				<Drawer.Screen
					name='documents'
					options={{
						title: translations[language].categories.navigation['documents'],
						drawerIcon: ({ color }: { color: string }) => (
							<IconSymbol size={24} name='documents' color={color} />
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
						title:
							translations[language].categories.navigation['notifications'],
						drawerItemStyle: {
							display: 'none',
						},
					}}
				/>
				{/* Add more drawer screens as needed */}
			</Drawer>
		</TransactionProvider>
	);
}
