import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { StyleSheet, useColorScheme, ViewStyle } from 'react-native';

export default function DashboardTile({
	id,
	backgroundColor,
	style,
	children,
}: {
	id: string;
	backgroundColor?: string;
	style?: ViewStyle;
	children: React.ReactNode;
}) {
	const colorScheme = useColorScheme() ?? 'light'; // Default to light mode if color scheme is not set
	return (
		<ThemedView
			id={id}
			style={[styles.container, style]}
			lightColor={
				backgroundColor || Colors[colorScheme].dayTransactionsBackground
			}
			darkColor={
				backgroundColor || Colors[colorScheme].dayTransactionsBackground
			}
		>
			{children}
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		justifyContent: 'flex-start',
		padding: 12,
		gap: 15,
		borderRadius: 8,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 10,
		elevation: 6,
		borderWidth: 1,
		borderColor: '#ddd',
	},
});
