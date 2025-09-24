import { ReactElement, useEffect, useState } from 'react';
import {
	Animated,
	BackHandler,
	Modal,
	Platform,
	StyleSheet,
	View,
} from 'react-native';
import { Portal } from './Portal';

export type contentPosition = 'top' | 'bottom' | 'center';

export default function OverlayContainer({
	showOverlay,
	fadeAnim,
	id,
	position = 'bottom',
	horizontalPadding = 20,
	verticalPadding = 0,
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
	/** Inner content container horizontal padding (applied around children). Default: 20 */
	horizontalPadding?: number;
	/** Inner content container vertical padding (applied around children). Default: 0 */
	verticalPadding?: number;
	onTouch?: () => void;
	/** Force using the native Modal; default is true on all platforms unless explicitly set to false */
	useNativeModal?: boolean;
	/** Optional close handler used when intercepting Android Back button in custom overlay */
	onRequestClose?: () => void;
}) {
	const isAndroid = Platform.OS === 'android';
	const shouldUseNativeModal =
		useNativeModal !== undefined ? useNativeModal : !isAndroid;
	const modalAnimation: 'none' | 'slide' | 'fade' = isAndroid ? 'none' : 'fade';
	const [mounted, setMounted] = useState(false);
	// Track whether portal should remain rendered even during fade-out
	const [rendered, setRendered] = useState(false);

	// Defer initial rendering slightly to avoid layout/focus races on Android
	useEffect(() => {
		if (!showOverlay) return;
		let t: NodeJS.Timeout | undefined;
		if (!shouldUseNativeModal && isAndroid) {
			// short delay before making the overlay interactive
			t = setTimeout(() => setMounted(true), 60);
		} else {
			setMounted(true);
		}
		// ensure portal is rendered when opening
		setRendered(true);
		return () => {
			if (t) clearTimeout(t);
		};
	}, [showOverlay, shouldUseNativeModal, isAndroid]);

	// Keep portal mounted until fade reaches 0 when closing (custom overlay only)
	useEffect(() => {
		if (shouldUseNativeModal) return;
		// When opening, ensure rendered
		if (showOverlay) {
			setRendered(true);
		}
		const id = fadeAnim?.addListener?.(({ value }: { value: number }) => {
			if (!showOverlay && (value ?? 0) <= 0.01) {
				setRendered(false);
				setMounted(false);
			}
		});
		return () => {
			if (id && fadeAnim?.removeListener) fadeAnim.removeListener(id);
		};
	}, [showOverlay, shouldUseNativeModal, fadeAnim]);

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
	}, [isAndroid, shouldUseNativeModal, showOverlay, onRequestClose, onTouch]);
	if (!shouldUseNativeModal) {
		if (!rendered) return null;
		// derive smoother backdrop and content animations from a single fade value
		const backdropColor = fadeAnim.interpolate({
			inputRange: [0, 1],
			outputRange: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.5)'],
		});
		const contentScale = fadeAnim.interpolate({
			inputRange: [0, 1],
			outputRange: [0.98, 1],
		});
		return (
			<Portal>
				{/* absorb touches behind overlay */}
				<View style={StyleSheet.absoluteFill} pointerEvents='auto'>
					{/* Backdrop fade from 0 to 0.5 */}
					<Animated.View
						style={[
							StyleSheet.absoluteFill,
							{ backgroundColor: backdropColor, zIndex: 998, elevation: 998 },
						]}
						pointerEvents='auto'
					/>

					{/* Content container with position alignment */}
					<View
						style={{
							position: 'absolute',
							left: 0,
							right: 0,
							bottom: 0,
							top: 0,
							paddingHorizontal: horizontalPadding,
							paddingVertical: verticalPadding,
							alignItems: 'center',
							justifyContent:
								position === 'bottom'
									? 'flex-end'
									: position === 'top'
									? 'flex-start'
									: 'center',
							zIndex: 999,
							elevation: 999,
						}}
						pointerEvents='box-none'
					>
						<Animated.View
							nativeID={id}
							pointerEvents={mounted ? 'auto' : 'none'}
							collapsable={false}
							style={{
								opacity: fadeAnim,
								width: '100%',
								backgroundColor: 'transparent',
								padding: 0,
								margin: 0,
								transform: [{ scale: contentScale }],
							}}
						>
							{children}
						</Animated.View>
					</View>
				</View>
			</Portal>
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
				{/* Backdrop */}
				<Animated.View
					style={[
						StyleSheet.absoluteFill,
						{
							backgroundColor: fadeAnim.interpolate({
								inputRange: [0, 1],
								outputRange: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.5)'],
							}),
							zIndex: 998,
							elevation: 998,
						},
					]}
				/>
				{/* Content container */}
				<View
					style={{
						position: 'absolute',
						left: 0,
						right: 0,
						bottom: 0,
						top: 0,
						paddingHorizontal: horizontalPadding,
						paddingVertical: verticalPadding,
						alignItems: 'center',
						justifyContent:
							position === 'bottom'
								? 'flex-end'
								: position === 'top'
								? 'flex-start'
								: 'center',
						zIndex: 999,
						elevation: 999,
					}}
				>
					<Animated.View
						nativeID={id}
						pointerEvents='auto'
						collapsable={false}
						style={{
							opacity: fadeAnim,
							transform: [
								{
									scale: fadeAnim.interpolate({
										inputRange: [0, 1],
										outputRange: [0.98, 1],
									}),
								},
							],
						}}
					>
						{children}
					</Animated.View>
				</View>
			</View>
		</Modal>
	);
}
