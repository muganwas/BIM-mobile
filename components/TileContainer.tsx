import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { StyleSheet, ViewStyle } from 'react-native';

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
	const dayTransactionsBackground = useThemeColor({}, 'dayTransactionsBackground');
	return (
		<ThemedView
			id={id}
			style={[styles.container, style]}
			lightColor={backgroundColor || dayTransactionsBackground}
			darkColor={backgroundColor || dayTransactionsBackground}
		>
			{children}
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'column',
		alignSelf: 'stretch',
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
