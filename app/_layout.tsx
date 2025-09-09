import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { GeneralProvider, useGeneral } from '@/context/GeneralContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import useTrackHistory from '@/hooks/useTrackHistory';
import { Animated, Text, useAnimatedValue } from 'react-native';

SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
	const colorScheme = useColorScheme();
	const Anim = useAnimatedValue(0); // Example of using an animated value
	const { online } = useGeneral(); // Get online status from context
	const [loaded] = useFonts({
		SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
	});

	// record navigation history across the app
	useTrackHistory();

	useEffect(() => {
		if (online)
			Animated.timing(Anim, {
				toValue: 0,
				duration: 150,
				useNativeDriver: true,
			}).start();
		else
			Animated.timing(Anim, {
				toValue: 1,
				duration: 150,
				useNativeDriver: true,
			}).start();
	}, [online, Anim]); // Example effect using animated value

	useEffect(() => {
		if (loaded) {
			SplashScreen.hideAsync();
		}
	}, [loaded]);

	if (!loaded) {
		return null;
	}

	return (
		<ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
			{!online && (
				<Animated.View
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						height: 70,
						backgroundColor: '#ff3333',
						transform: [{ scaleY: Anim }],
						paddingTop: 20,
						alignItems: 'center',
						justifyContent: 'center',
						zIndex: 999,
					}}
				>
					<Text style={{ color: '#fff', fontWeight: 'bold' }}>
						You are offline
					</Text>
				</Animated.View>
			)}
			<Stack>
				<Stack.Screen name='(auth)' options={{ headerShown: false }} />
				<Stack.Screen name='(onboarding)' options={{ headerShown: false }} />
				<Stack.Screen name='(authenticated)' options={{ headerShown: false }} />
				<Stack.Screen name='+not-found' />
			</Stack>
			<StatusBar style='auto' />
		</ThemeProvider>
	);
}

export default function RootLayout() {
	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<GeneralProvider>
				<RootLayoutContent />
			</GeneralProvider>
		</GestureHandlerRootView>
	);
}
