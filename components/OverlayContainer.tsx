import React, { ReactElement, useEffect } from 'react';
import { BackHandler, Modal, Platform, StyleSheet, View } from 'react-native';

export type contentPosition = 'top' | 'bottom' | 'center';

export default function OverlayContainer({
	showOverlay,
	fadeAnim,
	id,
	position = 'bottom',
	children,
	onTouch = () => {},
	useNativeModal,
	onRequestClose,
}: {
	id?: string;
	showOverlay: boolean;
	fadeAnim: any;
	children: ReactElement;
	position?: contentPosition;
	onTouch?: () => void;
	/** Force using the native Modal; default is false on Android and true elsewhere */
	useNativeModal?: boolean;
	/** Optional close handler used when intercepting Android Back button in custom overlay */
	onRequestClose?: () => void;
}) {
	const isAndroid = Platform.OS === 'android';
	const shouldUseNativeModal =
		useNativeModal !== undefined ? useNativeModal : !isAndroid;
	const modalAnimation: 'none' | 'slide' | 'fade' = isAndroid ? 'none' : 'fade';

	// Intercept Android back button when using custom overlay
	useEffect(() => {
		if (!isAndroid || shouldUseNativeModal || !showOverlay) return;
		const sub = BackHandler.addEventListener('hardwareBackPress', () => {
			try {
				onRequestClose?.();
				onTouch?.();
			} catch {}
			return true;
		});
		return () => sub.remove();
		// Dependencies deliberately include the toggles that change modal mode
	}, [isAndroid, shouldUseNativeModal, showOverlay, onRequestClose, onTouch]);

	if (!shouldUseNativeModal) {
		if (!showOverlay) return null;
		return (
			<View style={StyleSheet.absoluteFill} pointerEvents='box-none'>
				<View
					nativeID={id}
					pointerEvents='box-none'
					collapsable={false}
					style={{
						display: 'flex',
						position: 'absolute',
						zIndex: 999,
						elevation: 999,
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
		);
	}

	return (
		<Modal
			transparent={Platform.OS !== 'android'}
			visible={showOverlay}
			animationType={modalAnimation}
			statusBarTranslucent={Platform.OS === 'android'}
			hardwareAccelerated={true}
			onRequestClose={() => {
				// required on Android to avoid warnings
				onRequestClose?.();
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
