import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { fontSize, fontWeight } from '@/constants/Font';
import TileContainer from './TileContainer';

export default function DashboardTile({
	id,
	amount = 0,
	amountType = 'double',
	title,
	iconName,
	iconColor,
	iconBackgroundColor,
	titleColor,
	backgroundColor,
	iconSize = 30,
}: {
	id: string;
	amount: number;
	backgroundColor?: string;
	title: string;
	titleColor?: string;
	iconName?: string;
	iconBackgroundColor?: string;
	iconColor?: string;
	iconSize?: number;
	amountType?: 'double' | 'number';
	language: string;
}) {
	return (
		<TileContainer id={id} backgroundColor={backgroundColor}>
			<ThemedView
				style={{
					display: !!iconName ? 'flex' : 'none',
					position: 'relative',
					borderRadius: 50,
					width: 40,
					height: 40,
					padding: 5,
					overflow: 'hidden',
				}}
				lightColor={iconBackgroundColor || Colors.light.dayIconBackground}
				darkColor={iconBackgroundColor || Colors.dark.dayIconBackground}
			>
				{iconName && (
					<IconSymbol
						style={{
							position: 'absolute',
							right: 0,
							bottom: -5,
						}}
						name={iconName}
						size={iconSize}
						color={iconColor || '#ffffff'}
					/>
				)}
			</ThemedView>
			<ThemedView lightColor='transparent' darkColor='transparent'>
				<ThemedText
					style={{
						fontSize: fontSize['text.large'],
						fontWeight: fontWeight['heading.two'],
					}}
					lightColor={titleColor || Colors.light.dayText}
					darkColor={titleColor || Colors.dark.dayText}
				>
					{title}
				</ThemedText>
				<ThemedText
					style={{
						fontSize: fontSize['heading.one'],
						fontWeight: fontWeight['heading.two'],
					}}
					lightColor={Colors.light.valueText}
					darkColor={Colors.dark.valueText}
				>
					{amountType === 'double'
						? typeof amount === 'number'
							? amount.toFixed(2)
							: '0.00'
						: amount ?? 0}
				</ThemedText>
			</ThemedView>
		</TileContainer>
	);
}
