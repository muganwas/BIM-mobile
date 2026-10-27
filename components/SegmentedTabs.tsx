import { ScrollView, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { IconSymbol, IconSymbolName } from '@/components/ui/IconSymbol';
import { fontSize, fontWeight } from '@/constants/Font';
import { useThemeColor } from '@/hooks/useThemeColor';

export type SegmentedTab = {
	key: string;
	label: string;
	icon?: IconSymbolName;
};

type Props = {
	tabs: SegmentedTab[];
	activeKey: string;
	onChange: (key: string) => void;
	style?: ViewStyle;
};

export function SegmentedTabs({ tabs, activeKey, onChange, style }: Props) {
	const bg = useThemeColor({}, 'listItemBackground');
	const activeBg = useThemeColor({}, 'bim');
	const activeText = useThemeColor({}, 'authButtonText');
	const textColor = useThemeColor({}, 'text');
	const border = useThemeColor({}, 'borderDark');

	return (
		<ScrollView
			horizontal
			showsHorizontalScrollIndicator={false}
			contentContainerStyle={[styles.content, style]}
			accessibilityRole='tablist'
		>
			{tabs.map((tab) => {
				const selected = tab.key === activeKey;
				return (
					<TouchableOpacity
						key={tab.key}
						accessibilityRole='tab'
						accessibilityState={{ selected }}
						accessibilityLabel={tab.label}
						onPress={() => onChange(tab.key)}
						style={[
							styles.tab,
							{
								backgroundColor: selected ? activeBg : bg,
								borderColor: selected ? activeBg : border,
							},
						]}
					>
						{tab.icon ? (
							<IconSymbol
								name={tab.icon}
								size={18}
								color={selected ? activeText : textColor}
							/>
						) : null}
						<ThemedText
							numberOfLines={1}
							style={[
								styles.label,
								{ color: selected ? activeText : textColor },
							]}
							lightColor={selected ? activeText : textColor}
							darkColor={selected ? activeText : textColor}
						>
							{tab.label}
						</ThemedText>
					</TouchableOpacity>
				);
			})}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	content: {
		flexDirection: 'row',
		gap: 8,
		paddingVertical: 4,
	},
	tab: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		paddingHorizontal: 14,
		paddingVertical: 9,
		borderRadius: 999,
		borderWidth: 1,
	},
	label: {
		fontSize: fontSize['text.medium'],
		fontWeight: fontWeight['text.xsmall'],
	},
});
