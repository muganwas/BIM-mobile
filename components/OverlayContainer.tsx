import { ReactElement } from 'react';
import { Modal, Platform, View } from 'react-native';

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
	fadeAnim: any;
	children: ReactElement;
	position?: contentPosition;
	onTouch?: () => void;
}) {
	const modalAnimation: 'none' | 'slide' | 'fade' =
		Platform.OS === 'android' ? 'none' : 'fade';
	return (
		<Modal
			transparent={Platform.OS !== 'android'}
			visible={showOverlay}
			animationType={modalAnimation}
			statusBarTranslucent={Platform.OS === 'android'}
			hardwareAccelerated={true}
			onRequestClose={() => {
				/* required on Android to avoid warnings */
			}}
		>
			<View style={{ flex: 1 }}>
				<View
					nativeID={id}
					pointerEvents='box-none'
					collapsable={false}
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
				</View>
			</View>
		</Modal>
	);
}
