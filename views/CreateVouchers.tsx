import React, { useEffect, useRef, useState } from 'react';
import {
	Animated,
	KeyboardAvoidingView,
	Platform,
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
import { useTransaction } from '@/context/TransactionContext';
import { Hotspot } from '@/types';

type Props = {
	visible: boolean;
	fadeAnim: Animated.Value;
	multiple: boolean;
	hotspot: Hotspot;
	toggleVisible: (v?: boolean) => void;
	generateVouchers: () => void;
};

export default function CreateVouchers({
	visible,
	fadeAnim,
	multiple,
	hotspot,
	toggleVisible,
	generateVouchers,
}: Props) {
	const { language, handleGoBack, isAnimatable, keyboardVisible } =
		useGeneral();
	const colorScheme = useColorScheme() ?? 'light';
	const { packages } = useTransaction();
	const [numberOfUsers, setNumberOfUsers] = useState('1');
	const [pkg, setPkg] = useState('');
	const [showPackageDropdown, setShowPackageDropdown] = useState(false);
	const pkgContainerRef = useRef<View | null>(null);

	// Build dropdown options from available packages; fallback to common set
	const packageOptions = (packages || []).map((p) => p.name).filter(Boolean);

	// Keep numberOfUsers enforced based on `multiple`
	useEffect(() => {
		if (!multiple) setNumberOfUsers('1');
	}, [multiple]);

	const onCancel = () =>
		toggleVisible ? toggleVisible(false) : handleGoBack();

	const onGenerate = () => generateVouchers();

	return (
		<OverlayContainer
			showOverlay={visible}
			fadeAnim={fadeAnim}
			position='center'
		>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
				style={{ width: '90%' }}
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
						{multiple
							? translations[language].categories.vouchers.createHotspotVouchers
							: translations[language].categories.vouchers.createHotspotVoucher}
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
						label={translations[language].categories.vouchers.numberOfUsers}
						placeholder={
							translations[language].categories.vouchers.numberOfUsers
						}
						keyboardType='number-pad'
						value={numberOfUsers}
						setValue={setNumberOfUsers}
						editable={multiple}
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
						options={
							packageOptions.length
								? packageOptions
								: ['short', 'daily', 'weekly', 'monthly']
						}
						isAnimatable={isAnimatable}
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
							lightColor={Colors.light.cancelButton}
							darkColor={Colors.dark.cancelButton}
							lightTextColor={Colors.light.white}
							darkTextColor={Colors.dark.white}
						/>
						<ThemedButton
							title={translations[
								language
							].categories.buttons.generateUsersAndPdf.toUpperCase()}
							lightColor={Colors.light.bim}
							darkColor={Colors.dark.bim}
							lightTextColor={Colors.light.white}
							darkTextColor={Colors.dark.white}
							onPress={onGenerate}
						/>
					</ThemedView>
				</ThemedView>
			</KeyboardAvoidingView>
		</OverlayContainer>
	);
}
