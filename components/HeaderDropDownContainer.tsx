import { Colors } from '@/constants/Colors';
import { Animated, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DropdownContainer({
	children,
	visible,
	fadeAnim,
}: {
	children: React.ReactNode;
	visible: boolean;
	fadeAnim: Animated.Value;
}) {
	const insets = useSafeAreaInsets();
	const colorScheme = useColorScheme() ?? 'light';
	return (
		<Animated.View
			id='test-id-header-profile'
			style={{
				position: 'absolute',
				flexDirection: 'column',
				display: visible ? 'flex' : 'none',
				transform: [{ scaleY: fadeAnim }],
				left: 10,
				right: 10,
				top: 60 + insets.top,
				backgroundColor: Colors[colorScheme].background,
				padding: 10,
				borderRadius: 10,
				shadowColor: '#000',
				shadowOffset: { width: 0, height: 2 },
				shadowOpacity: 0.25,
				shadowRadius: 3.84,
				elevation: 5,
				zIndex: 1000, // Ensure it appears above other content
				maxHeight: 300, // Limit height for better UX
				overflow: 'hidden',
			}}
		>
			{children}
		</Animated.View>
	);
}
