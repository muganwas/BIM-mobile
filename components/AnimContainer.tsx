import { useGeneral } from '@/context/GeneralContext';
import { Animated, ViewProps, ViewStyle } from 'react-native';
import { ThemedView, ThemedViewProps } from './ThemedView';

export type AnimContainerProps = {
	animValue?: Animated.Value;
	children: React.ReactNode;
	animStyle?: Animated.AnimatedProps<ViewProps>['style'];
	staticStyle?: ViewStyle;
	generalStyle?: ViewStyle;
} & Partial<ThemedViewProps> &
	Animated.AnimatedProps<ViewProps>;

const AnimContainer = ({
	children,
	generalStyle,
	animValue,
	animStyle,
	staticStyle,
	...props
}: AnimContainerProps) => {
	const { isAnimatable } = useGeneral();
	const Container = isAnimatable && animValue ? Animated.View : ThemedView;
	return (
		<Container
			{...props}
			style={[
				generalStyle,
				isAnimatable && animValue !== undefined && animStyle
					? (animStyle as any[])
					: staticStyle ?? {},
			]}
		>
			{children}
		</Container>
	);
};

export default AnimContainer;
