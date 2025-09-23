import { Drawer } from 'expo-router/drawer';
import React from 'react';
// avoid importing fragile navigation types from @react-navigation/drawer which can differ by version
// allow importing DrawerContentScrollView at runtime; suppress type errors if the package's types differ
// @ts-ignore
import { DrawerContentScrollView } from '@react-navigation/drawer';

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
// use a runtime require to access DrawerContentScrollView to avoid missing type exports
import { Platform, TouchableOpacity, View } from 'react-native';

function CustomDrawerContent(props: any) {
	const colorScheme = useColorScheme() ?? 'light';
	const { language } = useGeneral();
	const { state, descriptors, navigation } = props;
	const activeIndex = state.index;

	// Allowlist of routes to show in the drawer. Only routes listed here will render.
	// Edit this set to control which routes appear as links in the drawer.
	const allowedRoutes = React.useMemo(
		() =>
			new Set<string>([
				'home',
				'routers',
				'packages',
				'vouchers',
				'transactions',
				'withdraw',
				'banks',
				'documents',
			]),
		[]
	);

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
				// Skip routes that are not explicitly allowed
				if (!allowedRoutes.has(route.name)) return null;
				// Derive a label: prefer explicit option, otherwise use translations by route name, fallback to route.name
				const translatedNav = translations[language]?.categories
					?.navigation as Record<string, string>;
				const label =
					options.drawerLabel ??
					options.title ??
					translatedNav?.[route.name] ??
					route.name;
				const isActive = i === activeIndex;
				const activeBg =
					options.drawerActiveBackgroundColor ??
					Colors[colorScheme].drawerActiveBackground;
				const inactiveBg =
					options.drawerInactiveBackgroundColor ??
					Colors[colorScheme].drawerButtonBackground;
				const iconColor = isActive
					? options.drawerActiveTintColor ?? Colors[colorScheme].drawerItem
					: options.drawerInactiveTintColor ??
					  Colors[colorScheme].drawerInactiveItem;
				let icon: React.ReactNode = null;
				switch (route.name) {
					case 'home':
						icon = (
							<IconSymbol size={24} name='home.outline' color={iconColor} />
						);
						break;
					case 'routers':
						icon = (
							<IconSymbol size={24} name='routers.outline' color={iconColor} />
						);
						break;
					case 'packages':
						icon = <IconSymbol size={24} name='packages' color={iconColor} />;
						break;
					case 'vouchers':
						icon = <IconSymbol size={24} name='vouchers' color={iconColor} />;
						break;
					case 'transactions':
						icon = (
							<IconSymbol size={24} name='transactions' color={iconColor} />
						);
						break;
					case 'withdraw':
						icon = <IconSymbol size={24} name='withdrawal' color={iconColor} />;
						break;
					case 'banks':
						icon = <IconSymbol size={24} name='bank' color={iconColor} />;
						break;
					case 'documents':
						icon = <IconSymbol size={24} name='documents' color={iconColor} />;
						break;
					default:
						icon = null;
				}
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
	const {
		user,
		handleLogout,
		language,
		setLanguage,
		notifications,
		setNotifications,
		selectedOption,
		setSelectedOption,
		online,
		handleGoBack,
	} = useGeneral();
	const colorScheme = useColorScheme() ?? 'light'; // Default to light mode if color scheme is not set

	return (
		<TransactionProvider>
			<Drawer
				drawerContent={(props: any) => <CustomDrawerContent {...props} />}
				screenOptions={{
					headerShown: true,
					drawerActiveTintColor: Colors[colorScheme].drawerItem,
					drawerInactiveTintColor: Colors[colorScheme].drawerInactiveItem,
					drawerActiveBackgroundColor:
						Colors[colorScheme].drawerActiveBackground,
					header: (props: any) => {
						// allow screens to pass a custom goback via options.headerProps?.goback
						// fallback to the navigation back object when available
						const goback = props.options?.headerProps?.goback ?? !!props.back;
						return (
							<Header
								goback={goback}
								user={user}
								handleLogout={handleLogout}
								language={language}
								setLanguage={setLanguage}
								notifications={notifications}
								setNotifications={setNotifications}
								selectedOption={selectedOption}
								setSelectedOption={setSelectedOption}
								online={online}
								handleGoBack={
									props.options?.headerProps?.handleGoBack ?? handleGoBack
								}
								{...props}
							/>
						);
					},
					drawerStyle: {
						backgroundColor: Colors[colorScheme].drawerBackground,
					},
					drawerItemStyle: {
						backgroundColor: Colors[colorScheme].drawerButtonBackground,
						borderRadius: 0,
						marginLeft: -10,
					},
					sceneStyle: {
						zIndex: 1,
						marginBottom: Platform.OS === 'android' ? 50 : 5,
					},
					drawerLabelStyle: {
						fontSize: fontSize['text.large'],
						fontWeight: fontWeight['text.xsmall'],
					},
				}}
			>
				<Drawer.Screen name='home' />
				<Drawer.Screen name='routers' />
				<Drawer.Screen name='packages' />
				<Drawer.Screen name='vouchers' />
				<Drawer.Screen name='transactions' />
				<Drawer.Screen name='withdraw' />
				<Drawer.Screen name='banks' />
				<Drawer.Screen name='documents' />
				<Drawer.Screen name='profile' />
				<Drawer.Screen name='notifications' />
				{/* Add more drawer screens as needed */}
			</Drawer>
		</TransactionProvider>
	);
}
