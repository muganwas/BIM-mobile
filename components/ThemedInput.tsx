import {
	StyleSheet,
	TextInput,
	TextStyle,
	TouchableOpacity,
	View,
	ViewStyle,
	type TextInputProps,
} from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useState } from 'react';
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
	const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
	const [showPassword, setShowPassword] = useState(false);
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
			<TextInput
				allowFontScaling={false}
				style={[
					styles.input,
					secureTextEntry && {
						paddingRight: 40, // Adjust padding for the icon
					},
					{ color },
					fontFamily ? { fontFamily } : undefined,
					style,
				]}
				onChangeText={setValue}
				value={value} // Use 'text' for normal input, 'password' for secure input
				placeholder={placeholder}
				secureTextEntry={secureTextEntry && !showPassword}
				keyboardType={keyboardType}
				placeholderTextColor={'#333333'}
				{...rest}
			/>
			<TouchableOpacity
				style={{
					display: secureTextEntry ? 'flex' : 'none',
					position: 'absolute',
					right: 10,
					top: 15,
					zIndex: 1,
					backgroundColor: 'transparent',
				}}
				activeOpacity={0.7}
				onPress={() => setShowPassword((prev) => !prev)} // Clear input on icon press
			>
				<IconSymbol
					name={showPassword ? 'password.off.outline' : 'password.outline'}
					size={20}
					color={color}
					style={{ marginRight: 10 }}
				/>
			</TouchableOpacity>
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
