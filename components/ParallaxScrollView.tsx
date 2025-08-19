import type { PropsWithChildren, ReactElement } from 'react';
import {
	GestureResponderEvent,
	StyleProp,
	StyleSheet,
	ViewStyle,
} from 'react-native';
import Animated, {
	interpolate,
	useAnimatedRef,
	useAnimatedStyle,
	useScrollViewOffset,
} from 'react-native-reanimated';

import { ThemedView } from '@/components/ThemedView';
import { useBottomTabOverflow } from '@/components/ui/TabBarBackground';
import { useColorScheme } from '@/hooks/useColorScheme';

const HEADER_HEIGHT = 250;

type Props = PropsWithChildren<{
	headerImage?: ReactElement;
	containerStyle?: StyleProp<ViewStyle>;
	contentStyle?: StyleProp<ViewStyle>;
	headerBackgroundColor: { dark: string; light: string };
	onTouchStart?: (e: GestureResponderEvent) => void; // Optional callback for touch start events
}>;

export default function ParallaxScrollView({
	children,
	headerImage,
	containerStyle,
	contentStyle,
	onTouchStart,
	headerBackgroundColor,
}: Props) {
	const colorScheme = useColorScheme() ?? 'light';
	const scrollRef = useAnimatedRef<Animated.ScrollView>();
	const scrollOffset = useScrollViewOffset(scrollRef);
	const bottom = useBottomTabOverflow();
	const headerAnimatedStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{
					translateY: interpolate(
						scrollOffset.value,
						[-HEADER_HEIGHT, 0, HEADER_HEIGHT],
						[-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]
					),
				},
				{
					scale: interpolate(
						scrollOffset.value,
						[-HEADER_HEIGHT, 0, HEADER_HEIGHT],
						[2, 1, 1]
					),
				},
			],
		};
	});

	return (
		<ThemedView
			onTouchStart={onTouchStart}
			style={[styles.container, containerStyle]}
			lightColor={headerBackgroundColor.light}
			darkColor={headerBackgroundColor.dark}
		>
			<Animated.ScrollView
				ref={scrollRef}
				scrollEventThrottle={16}
				scrollIndicatorInsets={{ bottom }}
				contentContainerStyle={{ paddingBottom: bottom }}
				nestedScrollEnabled={true}
			>
				<Animated.View
					style={[
						styles.header,
						{
							backgroundColor: headerBackgroundColor[colorScheme],
							display: headerImage ? 'flex' : 'none',
						},
						headerAnimatedStyle,
					]}
				>
					{headerImage}
				</Animated.View>
				<ThemedView style={[styles.content, contentStyle]}>
					{children}
				</ThemedView>
			</Animated.ScrollView>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		height: HEADER_HEIGHT,
		overflow: 'hidden',
	},
	content: {
		flex: 1,
		padding: 32,
		gap: 16,
		overflow: 'hidden',
	},
});
