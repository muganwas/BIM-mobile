import { ReactElement } from 'react';
import { Animated, Platform } from 'react-native';

export type contentPosition = 'top' | 'bottom' | 'center';

export default function OverlayContainer({
	showOverlay,
	fadeAnim,
	position = 'bottom',
	children,
	onTouch = () => {},
}: {
	showOverlay: boolean;
	fadeAnim: Animated.Value;
	children: ReactElement;
	position?: contentPosition;
	onTouch?: () => void;
}) {
	return (
		<Animated.View
			onTouchStart={(e) => {
				e.stopPropagation();
				onTouch();
			}}
			style={{
				display: 'flex',
				opacity: fadeAnim,
				position: 'absolute',
				zIndex: showOverlay ? 200 : -1,
				left: 0,
				right: 0,
				bottom: 0,
				top: Platform.OS === 'android' ? -130 : -100,
				backgroundColor: 'rgba(0, 0, 0, 0.5)',
				justifyContent:
					position === 'bottom'
						? 'flex-end'
						: position === 'top'
						? 'flex-start'
						: 'center',
			}}
		>
			{children}
		</Animated.View>
	);
}
