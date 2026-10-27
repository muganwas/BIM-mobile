import { useEffect, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';

import OverlayContainer from '@/components/OverlayContainer';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedInput } from '@/components/ThemedInput';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { fontSize, fontWeight } from '@/constants/Font';
import { useThemeColor } from '@/hooks/useThemeColor';
import { SharedRadiusProfile } from '@/types';

export type RadiusProfileFormValues = {
	name: string;
	price?: number;
	duration: string;
	bandwidth: string;
	devices: number;
};

type Props = {
	visible: boolean;
	fadeAnim: Animated.Value;
	toggleVisible: (show?: boolean) => void;
	mode: 'create' | 'edit';
	initial?: SharedRadiusProfile | null;
	saving?: boolean;
	onSubmit: (values: RadiusProfileFormValues) => void | Promise<void>;
};

export default function RadiusProfileForm({
	visible,
	fadeAnim,
	toggleVisible,
	mode,
	initial,
	saving,
	onSubmit,
}: Props) {
	const bg = useThemeColor({}, 'background');
	const textColor = useThemeColor({}, 'text');
	const mutedText = useThemeColor({}, 'mutedText');
	const inputBorder = useThemeColor({}, 'inputBorder');
	const buttonBg = useThemeColor({}, 'bim');
	const buttonText = useThemeColor({}, 'authButtonText');
	const chipBg = useThemeColor({}, 'listItemBackground');

	const [name, setName] = useState('');
	const [price, setPrice] = useState('');
	const [duration, setDuration] = useState('');
	const [bandwidth, setBandwidth] = useState('');
	const [devices, setDevices] = useState('1');

	useEffect(() => {
		if (!visible) return;
		setName(
			initial
				? initial.display_name || initial.name || initial.group
				: ''
		);
		setPrice(initial?.price != null ? String(initial.price) : '');
		setDuration(initial?.duration ?? '');
		setBandwidth(initial?.rate_limit ?? '');
		setDevices(initial?.devices != null ? String(initial.devices) : '1');
	}, [visible, initial]);

	const canSubmit =
		!!name.trim() &&
		!!duration.trim() &&
		!!bandwidth.trim() &&
		Number(devices) > 0 &&
		!saving;

	const submit = () => {
		if (!canSubmit) return;
		void onSubmit({
			name: name.trim(),
			price: price.trim() ? Number(price) : undefined,
			duration: duration.trim(),
			bandwidth: bandwidth.trim(),
			devices: Number(devices),
		});
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
					{mode === 'create'
						? 'Create global RADIUS profile'
						: 'Edit RADIUS profile'}
				</ThemedText>

				{mode === 'edit' && initial ? (
					<ThemedText
						style={styles.help}
						lightColor={mutedText}
						darkColor={mutedText}
					>
						Group: {initial.group}
					</ThemedText>
				) : null}

				<ThemedInput
					label={
						mode === 'create'
							? 'Profile name (RADIUS group)'
							: 'Display name'
					}
					placeholder='e.g. DAILY_1000'
					value={name}
					setValue={setName}
					style={{ borderColor: inputBorder }}
				/>

				<ThemedInput
					label='Price (UGX)'
					placeholder='e.g. 1000'
					keyboardType='number-pad'
					value={price}
					setValue={setPrice}
					style={{ borderColor: inputBorder }}
				/>

				<ThemedInput
					label='Session timeout'
					placeholder='e.g. 24h, 7d or 259200'
					value={duration}
					setValue={setDuration}
					style={{ borderColor: inputBorder }}
				/>

				<ThemedInput
					label='Rate limit'
					placeholder='e.g. 5M/5M'
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
						title={mode === 'create' ? 'Create profile' : 'Save changes'}
						onPress={submit}
						loading={saving}
						disabled={!canSubmit}
						style={{ maxWidth: '55%' }}
						lightColor={buttonBg}
						darkColor={buttonBg}
						lightTextColor={buttonText}
						darkTextColor={buttonText}
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
	help: {
		fontSize: 13,
	},
	actions: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		gap: 10,
		marginTop: 8,
	},
});
