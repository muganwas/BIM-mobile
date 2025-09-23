import { ReactElement } from 'react';
import { Animated, Modal, Platform, View } from 'react-native';

export type contentPosition = 'top' | 'bottom' | 'center';

export default function OverlayContainer({
	showOverlay,
	fadeAnim,
	id,
	position = 'bottom',
	children,
	onTouch = () => {},
}: {
	id?: string;
	showOverlay: boolean;
	fadeAnim: Animated.Value;
	children: ReactElement;
	position?: contentPosition;
	onTouch?: () => void;
}) {
	return (
		<Modal
			transparent
			visible={showOverlay}
			animationType='fade'
			statusBarTranslucent={Platform.OS === 'android'}
		>
			<View style={{ flex: 1 }}>
				<Animated.View
					id={id}
					pointerEvents='auto'
					style={{
						display: 'flex',
						position: 'absolute',
						zIndex: showOverlay ? 999 : -1,
						elevation: showOverlay ? 999 : -1,
						left: 0,
						right: 0,
						bottom: 0,
						top: 0,
						paddingTop: 30,
						backgroundColor: 'rgba(0, 0, 0, 0.5)',
						alignItems: 'center',
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
			</View>
		</Modal>
	);
}
