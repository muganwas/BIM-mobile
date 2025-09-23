import {
	StyleSheet,
	TextInput,
	TextStyle,
	TouchableOpacity,
	View,
	ViewStyle,
	useColorScheme,
	type TextInputProps,
} from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useCallback, useState } from 'react';
import { IconSymbol } from './ui/IconSymbol';

export type ThemedInputProps = TextInputProps & {
	lightColor?: string;
	darkColor?: string;
	fontFamily?: string;
	label?: string;
	labelStyle?: TextStyle;
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
	labelStyle,
	label,
	numberInWordsStyle,
	containerStyle,
	secureTextEntry,
	...rest
}: ThemedInputProps) {
	const colorScheme = useColorScheme() ?? 'light';
	const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
	const placeholderColor =
		rest.placeholderTextColor ?? Colors[colorScheme].mutedText;
	const [showPassword, setShowPassword] = useState(false);
	const [focused, setFocused] = useState(false);
	const onFocus = useCallback(() => setFocused(true), []);
	const onBlur = useCallback(() => setFocused(false), []);
	// Normalize value to a string for stability across platforms (Android focus edge cases)
	const normalizedValue =
		typeof value === 'string'
			? value
			: value === undefined || value === null
			? ''
			: String(value);
	const countLength = normalizedValue.length;
	return (
		<View
			style={[
				{ position: 'relative', flexDirection: 'column' },
				containerStyle,
			]}
		>
			{label && (
				<ThemedText
					lightColor={Colors.light.text}
					darkColor={Colors.dark.text}
					style={[{ marginBottom: 8, textAlign: 'left' }, labelStyle]}
				>
					{label}
				</ThemedText>
			)}
			<View style={{ position: 'relative' }}>
				<TextInput
					allowFontScaling={false}
					style={[
						styles.input,
						{
							// Default theming for ALL inputs across the app
							backgroundColor: Colors[colorScheme].inputBackground,
							borderColor: focused
								? Colors[colorScheme].focusedInput
								: Colors[colorScheme].inputBorder,
							borderWidth: 1,
						},
						secureTextEntry && {
							paddingRight: 40, // Adjust padding for the icon
						},
						{ color },
						fontFamily ? { fontFamily } : undefined,
						style,
					]}
					onChangeText={(t) => setValue(t ?? '')}
					value={normalizedValue}
					placeholder={placeholder ?? ''}
					secureTextEntry={secureTextEntry && !showPassword}
					keyboardType={keyboardType}
					placeholderTextColor={placeholderColor}
					onFocus={onFocus}
					onBlur={onBlur}
					{...rest}
				/>
				{secureTextEntry && (
					<TouchableOpacity
						style={{
							position: 'absolute',
							right: 10,
							top: 0,
							bottom: 0,
							justifyContent: 'center',
							zIndex: 1,
							backgroundColor: 'transparent',
						}}
						activeOpacity={0.7}
						onPress={() => setShowPassword((prev) => !prev)}
					>
						<IconSymbol
							name={showPassword ? 'password.off.outline' : 'password.outline'}
							size={20}
							color={color}
							style={{ marginRight: 10 }}
						/>
					</TouchableOpacity>
				)}
			</View>
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
					allowFontScaling={false}
					style={[{ fontSize: 12 }]}
					lightColor={'#333333B2'}
					darkColor={'#333333B2'}
				>
					{`${countLength}/500 words`}
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
					allowFontScaling={false}
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
		padding: 16,
		width: '100%',
		height: 51,
		borderRadius: 5,
		fontSize: 14,
	},
});
