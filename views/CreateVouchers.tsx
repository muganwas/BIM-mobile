import { useEffect, useRef, useState } from 'react';
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
	/**
	 * Unified submit handler. When in create mode, this should generate vouchers.
	 * When in edit mode, this should update the selected voucher.
	 */
	onSubmit?: (payload: {
		multiple: boolean;
		numberOfUsers: number;
		package: string;
	}) => void;
	/** Optional legacy callback; if provided and onSubmit is not set, it will be used. */
	generateVouchers?: () => void;
	/** Optional explicit mode; defaults to 'create' */
	mode?: 'create' | 'edit';
	/** Pre-select package when editing */
	initialPkg?: string;
	/** Override header title */
	titleOverride?: string;
	/** Override primary button label */
	primaryButtonLabelOverride?: string;
};

export default function CreateVouchers({
	visible,
	fadeAnim,
	multiple,
	hotspot,
	toggleVisible,
	onSubmit,
	generateVouchers,
	mode = 'create',
	initialPkg,
	titleOverride,
	primaryButtonLabelOverride,
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

	// Keep numberOfUsers enforced to 1 when not in multiple mode initially (user can edit later)
	useEffect(() => {
		if (!multiple) setNumberOfUsers('1');
	}, [multiple]);

	// Initialize the package when provided (e.g., in edit mode)
	useEffect(() => {
		if (visible && initialPkg) setPkg(initialPkg);
	}, [visible, initialPkg]);

	// Close any open UI affordances when hiding to avoid lingering visuals
	useEffect(() => {
		if (!visible) {
			setShowPackageDropdown(false);
		}
	}, [visible]);

	const onCancel = () =>
		toggleVisible ? toggleVisible(false) : handleGoBack();

	const onGenerate = () => {
		const count = parseInt(numberOfUsers || '1', 10) || 1;
		const effectiveMultiple = multiple || count > 1;
		if (onSubmit)
			return onSubmit({
				multiple: effectiveMultiple,
				numberOfUsers: count,
				package: pkg,
			});
		if (generateVouchers) return generateVouchers();
	};

	return (
		<OverlayContainer
			showOverlay={visible}
			fadeAnim={fadeAnim}
			position='center'
		>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
						{(() => {
							const count = parseInt(numberOfUsers || '1', 10) || 1;
							const effectiveMultiple = multiple || count > 1;
							if (titleOverride) return titleOverride;
							if (mode === 'edit')
								return translations[language].categories.buttons.saveChanges;
							return effectiveMultiple
								? translations[language].categories.vouchers
										.createHotspotVouchers
								: translations[language].categories.vouchers
										.createHotspotVoucher;
						})()}
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
							title={(primaryButtonLabelOverride
								? primaryButtonLabelOverride
								: mode === 'edit'
								? translations[language].categories.buttons.saveChanges
								: (() => {
										const count = parseInt(numberOfUsers || '1', 10) || 1;
										const effectiveMultiple = multiple || count > 1;
										return effectiveMultiple
											? translations[language].categories.buttons
													.generateUsersAndPdf
											: translations[language].categories.buttons
													.generateUserAndPdf || 'Generate user and pdf';
								  })()
							).toUpperCase()}
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
