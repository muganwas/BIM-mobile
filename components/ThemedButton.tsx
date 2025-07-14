/** Button from TouchableOpacity */
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import {
	StyleSheet,
	TextStyle,
	TouchableOpacity,
	ViewStyle,
} from 'react-native';
import { SFSymbols6_0 } from 'sf-symbols-typescript';

export type ThemedButtonProps = {
	title: string;
	onPress: () => void;
	style?: ViewStyle;
	textStyle?: TextStyle;
	lightTextColor?: string;
	darkTextColor?: string;
	lightColor?: string;
	darkColor?: string;
	icon?: SFSymbols6_0;
	iconColor?: string;
};

export function ThemedButton({
	title,
	onPress,
	style,
	textStyle,
	lightTextColor,
	darkTextColor,
	lightColor,
	darkColor,
	icon,
	iconColor,
}: ThemedButtonProps) {
	const colorScheme = useColorScheme() ?? 'light';
	const presetBg = useThemeColor(
		{
			light: Colors[colorScheme].tint,
			dark: Colors[colorScheme].tint,
		},
		'background'
	);
	const presetTxtColor = useThemeColor(
		{
			light: Colors[colorScheme].text,
			dark: Colors[colorScheme].text,
		},
		'text'
	);
	const userSetBg = colorScheme === 'dark' ? darkColor : lightColor;
	const backgroundColor = userSetBg ? userSetBg : presetBg;

	const userSetTextColor =
		colorScheme === 'dark' ? darkTextColor : lightTextColor;
	const textColor = userSetTextColor ? userSetTextColor : presetTxtColor;

	return (
		<TouchableOpacity
			style={[styles.button, { backgroundColor }, style]}
			onPress={onPress}
		>
			<ThemedView
				style={styles.buttonContent}
				lightColor='transparent'
				darkColor='transparent'
			>
				{icon && (
					<IconSymbol name={icon} size={20} color={iconColor || textColor} />
				)}
				<ThemedText
					style={[styles.buttonText, { color: textColor }, textStyle]}
					lightColor={textColor}
					darkColor={textColor}
				>
					{title}
				</ThemedText>
			</ThemedView>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	button: {
		paddingVertical: 10,
		paddingHorizontal: 15,
		borderRadius: 5,
		alignItems: 'center',
		justifyContent: 'center',
	} as ViewStyle,
	buttonContent: {
		flexDirection: 'row',
		alignItems: 'center',
	} as ViewStyle,
	buttonText: {
		fontSize: 16,
		fontWeight: '500',
	} as TextStyle,
});
