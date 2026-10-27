import { useEffect, useState } from 'react';
import { Animated, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

import OverlayContainer from '@/components/OverlayContainer';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedInput } from '@/components/ThemedInput';
import { ThemedSwitch } from '@/components/ThemedSwitch';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { fontSize, fontWeight } from '@/constants/Font';
import { useThemeColor } from '@/hooks/useThemeColor';
import { PortalPackage, SharedRadiusProfile } from '@/types';

export type PackageFormValues = {
	label: string;
	labelTranslations: Record<string, string>;
	planMode: 'shared' | 'private';
	profileGroup?: string;
	price?: number;
	duration?: string;
	bandwidth?: string;
	devices?: number;
	isActive: boolean;
	isGlobal: boolean;
};

type Props = {
	visible: boolean;
	fadeAnim: Animated.Value;
	toggleVisible: (show?: boolean) => void;
	mode: 'create' | 'edit';
	initial?: PortalPackage | null;
	profiles: SharedRadiusProfile[];
	isAdmin: boolean;
	saving?: boolean;
	onSubmit: (values: PackageFormValues) => void | Promise<void>;
};

export default function PackageForm({
	visible,
	fadeAnim,
	toggleVisible,
	mode,
	initial,
	profiles,
	isAdmin,
	saving,
	onSubmit,
}: Props) {
	const bg = useThemeColor({}, 'background');
	const textColor = useThemeColor({}, 'text');
	const mutedText = useThemeColor({}, 'mutedText');
	const inputBorder = useThemeColor({}, 'inputBorder');
	const selectedBg = useThemeColor({}, 'bim');
	const selectedText = useThemeColor({}, 'authButtonText');
	const chipBg = useThemeColor({}, 'listItemBackground');

	const [label, setLabel] = useState('');
	const [translation, setTranslation] = useState('');
	const [planMode, setPlanMode] = useState<'shared' | 'private'>('shared');
	const [profileGroup, setProfileGroup] = useState<string | undefined>();
	const [price, setPrice] = useState('');
	const [duration, setDuration] = useState('');
	const [bandwidth, setBandwidth] = useState('');
	const [devices, setDevices] = useState('');
	const [isActive, setIsActive] = useState(true);
	const [isGlobal, setIsGlobal] = useState(false);

	useEffect(() => {
		if (!visible) return;
		setLabel(initial?.label ?? '');
		setTranslation(initial?.label_translations?.lg ?? '');
		setPlanMode(
			initial ? (initial.profile?.shared ? 'shared' : 'private') : 'shared'
		);
		setProfileGroup(
			initial?.profile?.group ?? profiles[0]?.group ?? undefined
		);
		setPrice(
			initial?.profile?.price != null ? String(initial.profile.price) : ''
		);
		setDuration(initial?.profile?.duration ?? '');
		setBandwidth(initial?.profile?.rate_limit ?? '');
		setDevices(
			initial?.profile?.devices != null ? String(initial.profile.devices) : ''
		);
		setIsActive(initial?.is_active ?? true);
		setIsGlobal(false);
	}, [visible, initial, profiles]);

	const selectedProfile = profiles.find((p) => p.group === profileGroup);
	const privateFieldsValid =
		planMode !== 'private' ||
		(!!price.trim() &&
			!!duration.trim() &&
			!!bandwidth.trim() &&
			Number(devices) > 0);
	const canSubmit =
		!!label.trim() &&
		(planMode === 'private' || !!profileGroup) &&
		privateFieldsValid &&
		!saving;

	const submit = () => {
		if (!canSubmit) return;
		const values: PackageFormValues = {
			label: label.trim(),
			labelTranslations: translation.trim() ? { lg: translation.trim() } : {},
			planMode,
			profileGroup,
			price: price.trim() ? Number(price) : undefined,
			duration: duration.trim() || undefined,
			bandwidth: bandwidth.trim() || undefined,
			devices: devices.trim() ? Number(devices) : undefined,
			isActive,
			isGlobal,
		};
		void onSubmit(values);
	};

	return (
		<OverlayContainer
			showOverlay={visible}
			fadeAnim={fadeAnim}
			position='center'
			onRequestClose={() => toggleVisible(false)}
			scrollable
			bottomPadding={16}
			centerLiftOnKeyboard
			centerLiftRatio={0.9}
		>
			<ThemedView
				style={[styles.card, { backgroundColor: bg }]}
				lightColor={bg}
				darkColor={bg}
			>
				<ThemedText
					style={styles.title}
					lightColor={textColor}
					darkColor={textColor}
				>
					{mode === 'create' ? 'Add package' : 'Edit package'}
				</ThemedText>

				<ThemedInput
					label='Label (shown on the portal)'
					placeholder='e.g. Buy 1,000 for 24 hours'
					value={label}
					setValue={setLabel}
					style={{ borderColor: inputBorder }}
				/>

				<ThemedInput
					label='Label (Luganda, optional)'
					placeholder='Optional translation for the portal'
					value={translation}
					setValue={setTranslation}
					style={{ borderColor: inputBorder }}
				/>

				{mode === 'create' ? (
					<ThemedView
						style={styles.planRow}
						lightColor='transparent'
						darkColor='transparent'
					>
						{[
							{ key: 'shared' as const, label: 'Shared plan' },
							{ key: 'private' as const, label: 'Private plan' },
						].map((option) => {
							const selected = planMode === option.key;
							return (
								<TouchableOpacity
									key={option.key}
									onPress={() => setPlanMode(option.key)}
									style={[
										styles.chip,
										{
											backgroundColor: selected ? selectedBg : chipBg,
											borderColor: selected ? selectedBg : inputBorder,
										},
									]}
								>
									<ThemedText
										style={[
											styles.chipText,
											{ color: selected ? selectedText : textColor },
										]}
										lightColor={selected ? selectedText : textColor}
										darkColor={selected ? selectedText : textColor}
									>
										{option.label}
									</ThemedText>
								</TouchableOpacity>
							);
						})}
					</ThemedView>
				) : null}

				{planMode === 'shared' ? (
					<ThemedView
						style={{ gap: 8 }}
						lightColor='transparent'
						darkColor='transparent'
					>
						<ThemedText
							style={styles.fieldLabel}
							lightColor={textColor}
							darkColor={textColor}
						>
							Shared plan
						</ThemedText>
						{mode === 'edit' ? (
							<ThemedText
								style={styles.help}
								lightColor={mutedText}
								darkColor={mutedText}
							>
								Shared-plan prices and limits are managed from the RADIUS
								profiles tab.
							</ThemedText>
						) : profiles.length === 0 ? (
							<ThemedText
								style={styles.help}
								lightColor={mutedText}
								darkColor={mutedText}
							>
								No shared RADIUS profiles are available yet.
							</ThemedText>
						) : (
							<ScrollView
								horizontal
								showsHorizontalScrollIndicator={false}
								contentContainerStyle={styles.planRow}
							>
								{profiles.map((profile) => {
									const selected = profile.group === profileGroup;
									return (
										<TouchableOpacity
											key={profile.group}
											onPress={() => setProfileGroup(profile.group)}
											style={[
												styles.chip,
												{
													backgroundColor: selected ? selectedBg : chipBg,
													borderColor: selected ? selectedBg : inputBorder,
												},
											]}
										>
											<ThemedText
												style={[
													styles.chipText,
													{
														color: selected ? selectedText : textColor,
													},
												]}
												lightColor={selected ? selectedText : textColor}
												darkColor={selected ? selectedText : textColor}
											>
												{profile.display_name} · {profile.price ?? 0}
											</ThemedText>
										</TouchableOpacity>
									);
								})}
							</ScrollView>
						)}
						{selectedProfile ? (
							<ThemedText
								style={styles.help}
								lightColor={mutedText}
								darkColor={mutedText}
							>
								{selectedProfile.duration ?? '—'} ·{' '}
								{selectedProfile.rate_limit ?? 'Open speed'} ·{' '}
								{selectedProfile.devices} device(s)
							</ThemedText>
						) : null}
						{mode === 'create' && isAdmin ? (
							<ThemedView
								style={styles.switchRow}
								lightColor='transparent'
								darkColor='transparent'
							>
								<ThemedText
									lightColor={textColor}
									darkColor={textColor}
									style={{ flex: 1 }}
								>
									Global package (visible to all accounts)
								</ThemedText>
								<ThemedSwitch value={isGlobal} onValueChange={setIsGlobal} />
							</ThemedView>
						) : null}
					</ThemedView>
				) : (
					<ThemedView
						style={{ gap: 8 }}
						lightColor='transparent'
						darkColor='transparent'
					>
						<ThemedInput
							label='Price (UGX)'
							placeholder='e.g. 1000'
							keyboardType='number-pad'
							value={price}
							setValue={setPrice}
							style={{ borderColor: inputBorder }}
						/>
						<ThemedInput
							label='Duration'
							placeholder='e.g. 24h or 7d'
							value={duration}
							setValue={setDuration}
							style={{ borderColor: inputBorder }}
						/>
						<ThemedInput
							label='Bandwidth'
							placeholder='e.g. 5M/5M; 0 = open'
							value={bandwidth}
							setValue={setBandwidth}
							style={{ borderColor: inputBorder }}
						/>
						<ThemedInput
							label='Simultaneous devices'
							placeholder='e.g. 1'
							keyboardType='number-pad'
							value={devices}
							setValue={setDevices}
							style={{ borderColor: inputBorder }}
						/>
						{mode === 'edit' ? (
							<ThemedView
								style={styles.switchRow}
								lightColor='transparent'
								darkColor='transparent'
							>
								<ThemedText
									lightColor={textColor}
									darkColor={textColor}
									style={{ flex: 1 }}
								>
									Active
								</ThemedText>
								<ThemedSwitch value={isActive} onValueChange={setIsActive} />
							</ThemedView>
						) : null}
					</ThemedView>
				)}

				<ThemedView
					style={styles.actions}
					lightColor='transparent'
					darkColor='transparent'
				>
					<ThemedButton
						title='Cancel'
						onPress={() => toggleVisible(false)}
						style={{ maxWidth: '40%' }}
						lightColor={chipBg}
						darkColor={chipBg}
						lightTextColor={textColor}
						darkTextColor={textColor}
					/>
					<ThemedButton
						title={mode === 'create' ? 'Create package' : 'Save changes'}
						onPress={submit}
						loading={saving}
						disabled={!canSubmit}
						style={{ maxWidth: '55%' }}
						lightColor={selectedBg}
						darkColor={selectedBg}
						lightTextColor={selectedText}
						darkTextColor={selectedText}
					/>
				</ThemedView>
			</ThemedView>
		</OverlayContainer>
	);
}

const styles = StyleSheet.create({
	card: {
		width: '100%',
		borderRadius: 10,
		padding: 20,
		gap: 12,
	},
	title: {
		fontSize: fontSize['heading.two'],
		fontWeight: fontWeight['heading.two'],
		marginBottom: 4,
	},
	fieldLabel: {
		fontSize: fontSize['text.medium'],
		fontWeight: fontWeight['heading.three'],
	},
	help: {
		fontSize: 13,
	},
	planRow: {
		flexDirection: 'row',
		gap: 8,
		paddingVertical: 2,
	},
	chip: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 999,
		borderWidth: 1,
	},
	chipText: {
		fontSize: 13,
		fontWeight: fontWeight['text.xsmall'],
	},
	switchRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	actions: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		gap: 10,
		marginTop: 8,
	},
});
