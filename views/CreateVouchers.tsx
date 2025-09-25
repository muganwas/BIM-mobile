import { useEffect, useRef, useState } from 'react';
import {
	Animated,
	findNodeHandle,
	Platform,
	TextInput as RNTextInput,
	useColorScheme,
	View,
} from 'react-native';

import OverlayContainer from '@/components/OverlayContainer';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedDropdown } from '@/components/ThemedDropdown';
import { ThemedInput } from '@/components/ThemedInput';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import translations from '@/constants/Trans';
import { useGeneral } from '@/context/GeneralContext';
import { Hotspot } from '@/types';

type Props = {
	visible: boolean;
	fadeAnim: Animated.Value;
	multiple?: boolean;
	hotspot: Hotspot;
	toggleVisible: (show?: boolean) => void;
	mode: 'create' | 'edit';
	initialPkg?: string;
	titleOverride?: string;
	primaryButtonLabelOverride?: string;
	onSubmit: (payload: {
		multiple: boolean;
		numberOfUsers: number;
		package: string;
	}) => void;
	generateVouchers: () => void;
	onRequestClose?: () => void;
};

export default function CreateVouchers({
	visible,
	fadeAnim,
	multiple = false,
	hotspot,
	toggleVisible,
	mode,
	initialPkg,
	titleOverride,
	primaryButtonLabelOverride,
	onSubmit,
	generateVouchers,
	onRequestClose,
}: Props) {
	const colorScheme = useColorScheme() ?? 'light';
	const { language, keyboardVisible } = useGeneral();

	const [numberOfUsers, setNumberOfUsers] = useState('1');
	const [pkg, setPkg] = useState(initialPkg || '');
	const [showPackageDropdown, setShowPackageDropdown] = useState(false);
	const pkgContainerRef = useRef<View>(null);
	const scrollRef = useRef<any>(null);
	const numberInputRef = useRef<RNTextInput | null>(null);

	useEffect(() => {
		if (visible) {
			setNumberOfUsers('1');
			setPkg(initialPkg || '');
		}
	}, [visible, initialPkg]);

	// no explicit keyboard listeners needed; OverlayContainer handles insets

	const packageOptions: string[] = ['short', 'daily', 'weekly', 'monthly'];

	// Titles
	const parsedCount = parseInt(numberOfUsers || '1', 10) || 1;
	const effectiveMultiple = multiple || parsedCount > 1;
	const headerTitle = titleOverride
		? titleOverride
		: mode === 'edit'
		? translations[language].categories.buttons.saveChanges
		: effectiveMultiple
		? translations[language].categories.vouchers.createHotspotVouchers
		: translations[language].categories.vouchers.createHotspotVoucher;

	const primaryButtonTitle = (
		primaryButtonLabelOverride
			? primaryButtonLabelOverride
			: mode === 'edit'
			? translations[language].categories.buttons.saveChanges
			: effectiveMultiple
			? translations[language].categories.buttons.generateUsersAndPdf
			: translations[language].categories.buttons.generateUserAndPdf
	).toUpperCase();

	const onCancel = () => toggleVisible(false);
	const onGenerate = () => {
		const payload = {
			multiple: effectiveMultiple,
			numberOfUsers: Math.max(1, parseInt(numberOfUsers || '1', 10) || 1),
			package: pkg || packageOptions[0],
		};
		onSubmit(payload);
	};

	const scrollToInput = (
		inputRef: React.RefObject<RNTextInput | null>,
		extra: number = 64
	) => {
		const doScroll = () => {
			try {
				const node = findNodeHandle(inputRef.current);
				if (!node) return;
				const responder =
					scrollRef.current?.getScrollResponder?.() ?? scrollRef.current;
				responder?.scrollResponderScrollNativeHandleToKeyboard?.(
					node,
					extra,
					true
				);
			} catch {}
		};
		doScroll();
		setTimeout(doScroll, Platform.OS === 'ios' ? 260 : 80);
		setTimeout(doScroll, Platform.OS === 'ios' ? 420 : 150);
	};

	return (
		<OverlayContainer
			showOverlay={visible}
			fadeAnim={fadeAnim}
			position='center'
			onRequestClose={onRequestClose ?? onCancel}
			scrollable
			autoKeyboardInset
			bottomPadding={16}
			keyboardGap={40}
			getScrollRef={(r) => (scrollRef.current = r)}
			centerLiftOnKeyboard
			centerLiftRatio={0.9}
		>
			<ThemedView
				style={{
					flexDirection: 'column',
					backgroundColor: 'white',
					padding: 20,
					borderRadius: 10,
					width: '100%',
					gap: 12,
				}}
				lightColor={Colors.light.background}
				darkColor={Colors.dark.background}
			>
				<ThemedText
					style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}
					lightColor={Colors.light.screenTitleText}
					darkColor={Colors.dark.screenTitleText}
				>
					{headerTitle}
				</ThemedText>

				<ThemedInput
					label={translations[language].categories.hotspots.title}
					placeholder={translations[language].categories.hotspots.title}
					value={hotspot.ssid}
					setValue={() => {}}
					editable={false}
					style={{
						backgroundColor: Colors[colorScheme].background,
						borderColor: Colors[colorScheme].inputBorder,
						borderWidth: 1,
					}}
					containerStyle={{ marginBottom: 4 }}
				/>

				<ThemedInput
					ref={numberInputRef as any}
					label={translations[language].categories.vouchers.numberOfUsers}
					placeholder={translations[language].categories.vouchers.numberOfUsers}
					keyboardType='number-pad'
					value={numberOfUsers}
					setValue={setNumberOfUsers}
					onFocus={() => scrollToInput(numberInputRef)}
					editable={true}
					style={{
						backgroundColor: Colors[colorScheme].background,
						borderColor: Colors[colorScheme].inputBorder,
						borderWidth: 1,
					}}
					containerStyle={{ marginBottom: 4 }}
				/>

				<ThemedDropdown
					label={translations[language].categories.vouchers.package}
					placeholder={translations[language].categories.vouchers.package}
					value={pkg}
					setValue={setPkg}
					options={packageOptions}
					isAnimatable={true}
					keyboardVisible={keyboardVisible}
					containerRef={pkgContainerRef}
					id={'package-select'}
					showDropdown={showPackageDropdown}
					setShowDropdown={setShowPackageDropdown}
					openDirection='down'
					style={{ marginTop: 4 }}
				/>

				<ThemedView
					style={{
						flexDirection: 'row',
						justifyContent: 'flex-end',
						gap: 10,
						marginTop: 12,
					}}
					lightColor='transparent'
					darkColor='transparent'
				>
					<ThemedButton
						title={translations[
							language
						].categories.buttons.cancel.toUpperCase()}
						onPress={onCancel}
						numberOfLines={1}
						style={{ maxWidth: '35%' }}
						lightColor={Colors.light.cancelButton}
						darkColor={Colors.dark.cancelButton}
						lightTextColor={Colors.light.white}
						darkTextColor={Colors.dark.white}
					/>
					<ThemedButton
						title={primaryButtonTitle}
						numberOfLines={1}
						style={{ maxWidth: '60%' }}
						lightColor={Colors.light.bim}
						darkColor={Colors.dark.bim}
						lightTextColor={Colors.light.white}
						darkTextColor={Colors.dark.white}
						onPress={onGenerate}
					/>
				</ThemedView>
			</ThemedView>
		</OverlayContainer>
	);
}
