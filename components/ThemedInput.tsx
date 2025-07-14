import {
	StyleSheet,
	TextInput,
	View,
	ViewStyle,
	type TextInputProps,
} from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedInputProps = TextInputProps & {
	lightColor?: string;
	darkColor?: string;
	fontFamily?: string;
	lines?: number;
	showCount?: boolean;
	numberInWords?: string;
	numberToWords?: boolean;
	containerStyle?: ViewStyle;
	countStyle?: ViewStyle;
	numberInWordsStyle?: ViewStyle;
	setValue: (value: string) => void;
};

export function ThemedInput({
	style,
	lightColor,
	darkColor,
	fontFamily,
	value,
	setValue,
	placeholder,
	showCount,
	numberToWords,
	numberInWords,
	keyboardType,
	countStyle,
	numberInWordsStyle,
	containerStyle,
	...rest
}: ThemedInputProps) {
	const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

	return (
		<View
			style={[
				{ position: 'relative', flexDirection: 'column' },
				containerStyle,
			]}
		>
			<TextInput
				style={[
					styles.input,
					{ color },
					fontFamily ? { fontFamily } : undefined,
					style,
				]}
				onChangeText={setValue}
				value={value} // Use 'text' for normal input, 'password' for secure input
				placeholder={placeholder}
				keyboardType={keyboardType}
				placeholderTextColor={'#333333'}
				{...rest}
			/>
			<ThemedView
				style={[
					{
						display: showCount ? 'flex' : 'none',
						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'flex-end',
					},
					countStyle,
				]}
				lightColor='transparent'
				darkColor='transparent'
			>
				<ThemedText
					style={[{ fontSize: 12 }]}
					lightColor={'#333333B2'}
					darkColor={'#333333B2'}
				>
					{`${value?.length ?? '0'}/500 words`}
				</ThemedText>
			</ThemedView>
			<ThemedView
				style={[
					{
						display: numberToWords ? 'flex' : 'none',
						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'flex-end',
					},
					numberInWordsStyle,
				]}
				lightColor='transparent'
				darkColor='transparent'
			>
				<ThemedText
					style={[{ fontSize: 12 }]}
					lightColor={'#333333B2'}
					darkColor={'#333333B2'}
				>
					{numberInWords}
				</ThemedText>
			</ThemedView>
		</View>
	);
}

const styles = StyleSheet.create({
	input: {
		boxSizing: 'border-box',
		padding: 16,
		backgroundColor: '#2C414F26',
		width: '100%',
		height: 51,
		borderRadius: 5,
		letterSpacing: 0.25,
		fontSize: 14,
	},
});
