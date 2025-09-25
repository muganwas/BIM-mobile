/** Button from TouchableOpacity */
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';
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
	numberOfLines?: number;
	icon?: SFSymbols6_0;
	iconColor?: string;
	disabled?: boolean;
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
	numberOfLines,
	disabled,
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
			style={[
				styles.button,
				{
					backgroundColor,
					maxWidth: '100%',
					flexShrink: 0,
					opacity: disabled ? 0.6 : 1,
				},
				style,
			]}
			onPress={onPress}
			disabled={!!disabled}
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
					numberOfLines={numberOfLines}
					style={[
						styles.buttonText,
						{ color: textColor, textTransform: 'uppercase' },
						textStyle,
					]}
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
		paddingHorizontal: 16,
		borderRadius: 5,
		overflow: 'hidden',
		alignItems: 'center',
		justifyContent: 'center',
	},
	buttonContent: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	buttonText: {
		fontSize: 16,
		fontWeight: '500',
	},
});
