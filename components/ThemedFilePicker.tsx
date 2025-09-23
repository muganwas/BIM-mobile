import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import translations from '@/constants/Trans';
import { useGeneral } from '@/context/GeneralContext';
import * as DocumentPicker from 'expo-document-picker';
import { useMemo, useState } from 'react';
import {
	GestureResponderEvent,
	StyleProp,
	StyleSheet,
	TouchableOpacity,
	View,
	ViewStyle,
	useColorScheme,
} from 'react-native';
import { IconSymbol } from './ui/IconSymbol';

type AcceptKind = 'pdf' | 'png' | 'jpg';

export type ThemedFilePickerProps = {
	label?: string;
	placeholder?: string; // shown when no file selected
	value?: string; // selected file URI
	fileName?: string; // optional display name
	setValue: (uri: string) => void;
	setFileName?: (name: string) => void;
	accept?: AcceptKind[]; // defaults to ['pdf','png','jpg']
	disabled?: boolean;
	containerStyle?: StyleProp<ViewStyle>;
	style?: StyleProp<ViewStyle>; // input box style
	onPressLeft?: (e: GestureResponderEvent) => void; // optional extra handler
	lightColor?: string;
	darkColor?: string;
	active?: boolean; // whether user can pick a file
};

export default function ThemedFilePicker({
	label,
	placeholder = 'No file chosen',
	value,
	fileName,
	setValue,
	setFileName,
	accept = ['pdf', 'png', 'jpg'],
	disabled,
	containerStyle,
	style,
	onPressLeft,
	lightColor,
	darkColor,
	active = true,
}: ThemedFilePickerProps) {
	const colorScheme = useColorScheme() ?? 'light';
	const [busy, setBusy] = useState(false);
	const { language } = useGeneral();

	const tAttach =
		translations[language]?.categories?.documents?.attach || 'Attach';
	const tNoFile =
		translations[language]?.categories?.documents?.noFileChosen ||
		'No file chosen';
	const tSelecting =
		translations[language]?.categories?.documents?.selecting || 'Selecting…';

	const mimes = useMemo(() => {
		const map: Record<AcceptKind, string> = {
			pdf: 'application/pdf',
			png: 'image/png',
			jpg: 'image/jpeg',
		};
		return accept.map((k) => map[k]);
	}, [accept]);

	const doPick = async () => {
		if (!active || disabled) return;
		try {
			setBusy(true);
			const res = await DocumentPicker.getDocumentAsync({
				copyToCacheDirectory: true,
				multiple: false,
				type: mimes,
			});
			if (!res.canceled) {
				const asset: any = (res as any)?.assets?.[0] ?? (res as any);
				const uri: string | undefined = asset?.uri;
				const name: string | undefined = asset?.name;
				if (uri) setValue(uri);
				if (name && setFileName) setFileName(name);
			}
		} catch (e) {
			console.warn('File pick error:', e);
		} finally {
			setBusy(false);
		}
	};

	const display = fileName || value || '';

	return (
		<View style={[{ flexDirection: 'column' }, containerStyle]}>
			{label ? (
				<ThemedText
					lightColor={Colors.light.text}
					darkColor={Colors.dark.text}
					style={{ marginBottom: 8, textAlign: 'left' }}
				>
					{label}
				</ThemedText>
			) : null}

			<ThemedView
				lightColor={lightColor ?? Colors[colorScheme].background}
				darkColor={darkColor ?? Colors[colorScheme].background}
				style={[
					styles.input,
					{
						backgroundColor: Colors[colorScheme].inputBackground,
						borderColor: Colors[colorScheme].inputBorder,
						borderWidth: 1,
					},
					style,
				]}
			>
				{/* Left embedded button */}
				<TouchableOpacity
					onPress={(e) => {
						onPressLeft?.(e);
						doPick();
					}}
					activeOpacity={0.8}
					disabled={!active || disabled || busy}
					style={[
						styles.leftBtn,
						{ backgroundColor: Colors[colorScheme].titleBg },
					]}
				>
					<IconSymbol
						name={'attachFile'}
						color={Colors[colorScheme].text}
						size={16}
					/>
					<ThemedText
						style={{ marginLeft: 6, fontSize: 13 }}
						lightColor={Colors.light.text}
						darkColor={Colors.dark.text}
					>
						{busy ? tSelecting : tAttach}
					</ThemedText>
				</TouchableOpacity>

				{/* Filename / placeholder */}
				<ThemedText
					numberOfLines={1}
					ellipsizeMode='middle'
					style={{ flex: 1, fontSize: 14 }}
					lightColor={display ? Colors.light.text : Colors.light.mutedText}
					darkColor={display ? Colors.dark.text : Colors.dark.mutedText}
				>
					{display || placeholder || tNoFile}
				</ThemedText>
			</ThemedView>
		</View>
	);
}

const styles = StyleSheet.create({
	input: {
		boxSizing: 'border-box',
		padding: 0,
		paddingRight: 12,
		width: '100%',
		height: 51,
		borderRadius: 5,
		letterSpacing: 0.25,
		alignItems: 'center',
		flexDirection: 'row',
		gap: 10,
	},
	leftBtn: {
		height: 35,
		paddingHorizontal: 10,
		borderRadius: 6,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
});
