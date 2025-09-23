import OverlayContainer from '@/components/OverlayContainer';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedDropdown } from '@/components/ThemedDropdown';
import { ThemedInput } from '@/components/ThemedInput';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import translations from '@/constants/Trans';
import { useGeneral } from '@/context/GeneralContext';
import { validateIPv4 } from '@/helpers';
import { NetRouter } from '@/types';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
	Animated,
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
	useColorScheme,
	View,
} from 'react-native';

type Mode = 'add' | 'edit' | 'preview';

type Payload = {
	name: string;
	location: string;
	type: string;
	ipAddress: string;
	username: string;
	password: string;
};

type Props = {
	visible: boolean;
	mode?: Mode;
	initial?: Partial<NetRouter> & Partial<Payload>;
	onCancel: () => void;
	onSubmit: (payload: Payload) => void;
	onBack?: () => void;
	onEdit?: () => void;
};

export default function RouterOverlay({
	visible,
	mode = 'add',
	initial,
	onCancel,
	onSubmit,
	onBack,
	onEdit,
}: Props) {
	const colorScheme = useColorScheme() ?? 'light';
	const { language, isAnimatable, keyboardVisible } = useGeneral();
	const fadeAnim = useRef(new Animated.Value(0)).current;
	const ddRef = useRef<View | null>(null);

	const [name, setName] = useState(initial?.name ?? '');
	const [location, setLocation] = useState(initial?.location ?? '');
	const [type, setType] = useState(initial?.type ?? 'Mikrotik');
	const [ipAddress, setIpAddress] = useState((initial as any)?.ipAddress ?? '');
	const [username, setUsername] = useState((initial as any)?.username ?? '');
	const [password, setPassword] = useState((initial as any)?.password ?? '');
	const [opened, setOpened] = useState<string | undefined>(undefined);

	const isPreview = mode === 'preview';
	const isEditable = mode !== 'preview';

	useEffect(() => {
		if (visible) {
			setName(initial?.name ?? '');
			setLocation(initial?.location ?? '');
			setType(initial?.type ?? 'Mikrotik');
			setIpAddress((initial as any)?.ipAddress ?? '');
			setUsername((initial as any)?.username ?? '');
			setPassword((initial as any)?.password ?? '');
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 150,
				useNativeDriver: true,
			}).start();
		} else {
			Animated.timing(fadeAnim, {
				toValue: 0,
				duration: 150,
				useNativeDriver: true,
			}).start();
		}
	}, [visible, initial, fadeAnim]);

	const canSubmit = useMemo(() => {
		const ipOk = validateIPv4(ipAddress.trim());
		return (
			isEditable &&
			name.trim().length > 0 &&
			location.trim().length > 0 &&
			type.trim().length > 0 &&
			ipOk &&
			username.trim().length > 0 &&
			password.trim().length > 0
		);
	}, [isEditable, name, location, type, ipAddress, username, password]);

	const title = useMemo(() => {
		return isPreview
			? translations[language].categories.routers.title
			: mode === 'edit'
			? translations[language].categories.routers.editTitle
			: translations[language].categories.routers.newTitle;
	}, [isPreview, mode, language]);

	return (
		<OverlayContainer
			showOverlay={visible}
			fadeAnim={fadeAnim}
			position='center'
		>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
				style={styles.kbContainer}
			>
				<ThemedView
					style={styles.card}
					lightColor={Colors.light.background}
					darkColor={Colors.dark.background}
				>
					<ThemedText
						style={styles.title}
						lightColor={Colors.light.screenTitleText}
						darkColor={Colors.dark.screenTitleText}
					>
						{title}
					</ThemedText>

					<ThemedInput
						label={translations[language].categories.dashboard.routerName}
						placeholder={'eg. Router 01'}
						value={name}
						setValue={setName}
						editable={isEditable}
						style={{
							backgroundColor: Colors[colorScheme].background,
							borderColor: Colors[colorScheme].inputBorder,
							borderWidth: 1,
						}}
						containerStyle={{ marginBottom: 8 }}
					/>

					<ThemedInput
						label={translations[language].categories.dashboard.location}
						placeholder={'eg. UCU Main Campus'}
						value={location}
						setValue={setLocation}
						editable={isEditable}
						style={{
							backgroundColor: Colors[colorScheme].background,
							borderColor: Colors[colorScheme].inputBorder,
							borderWidth: 1,
						}}
						containerStyle={{ marginBottom: 8 }}
					/>

					<ThemedDropdown
						containerRef={ddRef}
						lightColor={Colors.light.background}
						darkColor={Colors.dark.background}
						placeholder={translations[language].categories.dashboard.routerType}
						value={type}
						label={translations[language].categories.routers.routerType}
						showDropdown={opened === 'router-type'}
						setShowDropdown={(v) => setOpened(v ? 'router-type' : undefined)}
						multiselect={false}
						onSelect={() =>
							setOpened((prev) =>
								prev === 'router-type' ? undefined : 'router-type'
							)
						}
						setValue={setType}
						style={{ marginBottom: 8 }}
						isAnimatable={isAnimatable}
						keyboardVisible={keyboardVisible}
						options={['Mikrotik', 'TpLink', 'LinkSys', 'Cisco']}
						active={isEditable}
					/>

					<ThemedInput
						label={translations[language].categories.dashboard.ipAddress}
						placeholder={'eg. 10.0.0.1'}
						value={ipAddress}
						setValue={setIpAddress}
						editable={isEditable}
						style={{
							backgroundColor: Colors[colorScheme].background,
							borderColor:
								ipAddress.trim().length === 0
									? Colors[colorScheme].inputBorder
									: validateIPv4(ipAddress.trim())
									? Colors[colorScheme].inputBorder
									: Colors[colorScheme].error,
							borderWidth: 1,
						}}
						containerStyle={{ marginBottom: 8 }}
					/>

					<ThemedInput
						label={translations[language].categories.dashboard.routerUsername}
						placeholder={'eg. admin'}
						value={username}
						setValue={setUsername}
						editable={isEditable}
						style={{
							backgroundColor: Colors[colorScheme].background,
							borderColor: Colors[colorScheme].inputBorder,
							borderWidth: 1,
						}}
						containerStyle={{ marginBottom: 8 }}
					/>

					<ThemedInput
						label={translations[language].categories.dashboard.routerPassword}
						placeholder={'******'}
						value={password}
						setValue={setPassword}
						secureTextEntry
						editable={isEditable}
						style={{
							backgroundColor: Colors[colorScheme].background,
							borderColor: Colors[colorScheme].inputBorder,
							borderWidth: 1,
						}}
						containerStyle={{ marginBottom: 8 }}
					/>

					<View style={styles.actions}>
						{isPreview ? (
							<>
								<ThemedButton
									title={translations[language].categories.buttons.close}
									onPress={onBack ?? onCancel}
									lightColor={Colors.light.cancelButton}
									darkColor={Colors.dark.cancelButton}
									lightTextColor={Colors.light.white}
									darkTextColor={Colors.dark.white}
								/>
								<ThemedButton
									title={translations[language].categories.buttons.save}
									onPress={onEdit ?? (() => {})}
									lightColor={Colors.light.bim}
									darkColor={Colors.dark.bim}
									lightTextColor={Colors.light.white}
									darkTextColor={Colors.dark.white}
								/>
							</>
						) : (
							<>
								<ThemedButton
									title={translations[language].categories.buttons.cancel}
									onPress={onCancel}
									lightColor={Colors.light.cancelButton}
									darkColor={Colors.dark.cancelButton}
									lightTextColor={Colors.light.white}
									darkTextColor={Colors.dark.white}
								/>
								<ThemedButton
									title={translations[language].categories.buttons.saveRouter}
									onPress={() =>
										onSubmit({
											name,
											location,
											type,
											ipAddress,
											username,
											password,
										})
									}
									disabled={!canSubmit}
									lightColor={Colors.light.bim}
									darkColor={Colors.dark.bim}
									lightTextColor={Colors.light.white}
									darkTextColor={Colors.dark.white}
								/>
							</>
						)}
					</View>
				</ThemedView>
			</KeyboardAvoidingView>
		</OverlayContainer>
	);
}

const styles = StyleSheet.create({
	kbContainer: { width: '90%' },
	card: {
		flexDirection: 'column',
		padding: 20,
		borderRadius: 10,
		width: '100%',
		gap: 12,
	},
	title: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
	actions: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		gap: 10,
		marginTop: 8,
	},
});
