import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { fontSize, fontWeight } from '@/constants/Font';
import { StyleSheet, useColorScheme } from 'react-native';

export default function DashboardTile({
	id,
	amount,
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
	const colorScheme = useColorScheme() ?? 'light'; // Default to light mode if color scheme is not set
	return (
		<ThemedView
			id={id}
			style={styles.transactionContainer}
			lightColor={
				backgroundColor || Colors[colorScheme].dayTransactionsBackground
			}
			darkColor={
				backgroundColor || Colors[colorScheme].dayTransactionsBackground
			}
		>
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
					{amountType === 'double' ? amount.toFixed(2) : amount}
				</ThemedText>
			</ThemedView>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	transactionItem: {
		padding: 12,
		borderRadius: 8,
		marginBottom: 8,
		borderWidth: 1,
		borderColor: '#ddd',
	},
	container: {
		flex: 1,
		padding: 16,
		borderRadius: 8,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2, // For Android shadow
	},
	transactionContainer: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		justifyContent: 'flex-start',
		padding: 12,
		gap: 15,
		borderRadius: 8,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
		borderWidth: 1,
		borderColor: '#ddd',
	},
});
