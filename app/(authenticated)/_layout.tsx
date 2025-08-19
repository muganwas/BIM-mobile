import { Drawer } from 'expo-router/drawer';
import React from 'react';

import DrawerHeader from '@/components/DrawerHeader';
import Header from '@/components/Header';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { fontSize, fontWeight } from '@/constants/Font';
import translations from '@/constants/Trans';
import { useGeneral } from '@/context/GeneralContext';
import { TransactionProvider } from '@/context/TransactionContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { Platform, TouchableOpacity, View } from 'react-native';

function CustomDrawerContent(props: any) {
	const colorScheme = useColorScheme() ?? 'light';
	const { state, descriptors, navigation } = props;
	const activeIndex = state.index;

	return (
		<DrawerContentScrollView
			contentContainerStyle={{ padding: 0 }}
			style={{ padding: 0 }}
			{...props}
		>
			<View
				style={{
					paddingVertical: 5,
					backgroundColor: Colors[colorScheme].drawerBackground,
				}}
			>
				<DrawerHeader navigation={navigation} />
			</View>

			{state.routes.map((route: any, i: number) => {
				const { options } = descriptors[route.key];
				const showItem = options.drawerItemStyle?.display !== 'none';
				const label = options.drawerLabel ?? options.title ?? route.name;
				const isActive = i === activeIndex;
				const activeBg =
					options.drawerActiveBackgroundColor ??
					Colors[colorScheme].drawerActiveBackground;
				const inactiveBg =
					options.drawerInactiveBackgroundColor ??
					Colors[colorScheme].drawerButtonBackground;
				const icon = options.drawerIcon
					? options.drawerIcon({
							focused: isActive,
							color: isActive
								? options.drawerActiveTintColor ??
								  Colors[colorScheme].drawerItem
								: options.drawerInactiveTintColor ??
								  Colors[colorScheme].drawerInactiveItem,
					  })
					: null;
				if (!showItem) {
					return null;
				}
				return (
					<TouchableOpacity
						key={route.key}
						style={{
							backgroundColor: isActive ? activeBg : inactiveBg,
							borderRadius: 5,
							margin: 0,
							padding: 0,
						}}
						onPress={() => navigation.navigate(route.name)}
					>
						<ThemedView
							style={{
								flexDirection: 'row',
								alignItems: 'center',
								padding: 16,
							}}
							lightColor='transparent'
							darkColor='transparent'
						>
							{icon}
							<ThemedView
								style={{ marginLeft: 16 }}
								lightColor='transparent'
								darkColor='transparent'
							>
								{typeof label === 'string' ? (
									<ThemedText
										style={{
											color: isActive
												? options.drawerActiveTintColor ??
												  Colors[colorScheme].drawerItem
												: options.drawerInactiveTintColor ??
												  Colors[colorScheme].drawerInactiveItem,
											fontWeight: isActive
												? options.drawerActiveFontWeight ??
												  fontWeight['heading.one']
												: options.drawerInactiveFontWeight ??
												  fontWeight['heading.three'],
										}}
										lightColor={
											isActive
												? options.drawerActiveTintColor ??
												  Colors[colorScheme].drawerItem
												: options.drawerInactiveTintColor ??
												  Colors[colorScheme].drawerInactiveItem
										}
										darkColor={
											isActive
												? options.drawerActiveTintColor ??
												  Colors[colorScheme].drawerItem
												: options.drawerInactiveTintColor ??
												  Colors[colorScheme].drawerInactiveItem
										}
									>
										{label}
									</ThemedText>
								) : (
									label
								)}
							</ThemedView>
						</ThemedView>
					</TouchableOpacity>
				);
			})}
		</DrawerContentScrollView>
	);
}

export default function DrawerLayout() {
	const { language } = useGeneral();
	const colorScheme = useColorScheme() ?? 'light'; // Default to light mode if color scheme is not set

	return (
		<TransactionProvider>
			<Drawer
				drawerContent={(props) => <CustomDrawerContent {...props} />}
				screenOptions={{
					headerShown: true,
					drawerActiveTintColor: Colors[colorScheme].drawerItem,
					drawerInactiveTintColor: Colors[colorScheme].drawerInactiveItem,
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
					sceneStyle: {
						marginBottom: Platform.OS === 'android' ? 50 : 5,
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
