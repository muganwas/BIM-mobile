import { ReactElement } from 'react';
import { Animated, Modal } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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
		<Modal transparent visible={showOverlay} animationType='fade'>
			<GestureHandlerRootView style={{ flex: 1 }}>
				<Animated.View
					id={id}
					// Let children (e.g., dropdowns with ScrollView) receive touch/scroll gestures
					pointerEvents='box-none'
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
			</GestureHandlerRootView>
		</Modal>
	);
}
