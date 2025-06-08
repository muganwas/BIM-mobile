import { useNetInfo } from '@react-native-community/netinfo';
import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { Text, View } from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const netInfo = useNetInfo();
	const [online, setOnline] = useState<boolean>(true);
	const [loaded] = useFonts({
		SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
	});

	useEffect(() => {
		const check = async () => {
			if (
				netInfo.isConnected === true &&
				netInfo.isInternetReachable !== false
			) {
				try {
					const res = await fetch('https://clients3.google.com/generate_204');
					setOnline(res.status === 204);
				} catch {
					setOnline(false);
				}
			} else {
				setOnline(false);
			}
		};
		check();
	}, [netInfo]);

	useEffect(() => {
		if (loaded) {
			SplashScreen.hideAsync();
		}
	}, [loaded]);

	if (!loaded) {
		// Async font loading only occurs in development.
		return null;
	}

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
				{!online && (
					<View
						style={{
							position: 'absolute',
							top: 0,
							left: 0,
							right: 0,
							backgroundColor: '#ff3333',
							height: 70,
							paddingTop: 20,
							alignItems: 'center',
							justifyContent: 'center',
							zIndex: 999,
						}}
					>
						<Text style={{ color: '#fff', fontWeight: 'bold' }}>
							You are offline
						</Text>
					</View>
				)}
				<Stack>
					<Stack.Screen name='(tabs)' options={{ headerShown: false }} />
					<Stack.Screen name='(onboarding)' options={{ headerShown: false }} />
					<Stack.Screen name='(auth)' options={{ headerShown: false }} />
					<Stack.Screen name='+not-found' />
				</Stack>
				<StatusBar style='auto' />
			</ThemeProvider>
		</GestureHandlerRootView>
	);
}
