import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';

export default function DashboardTile({
	id,
	backgroundColor,
	style,
	children,
	flat,
}: {
	id: string;
	backgroundColor?: string;
	style?: StyleProp<ViewStyle>;
	children: React.ReactNode;
	/** Parent/container tiles are flat (border only); child tiles stay raised. */
	flat?: boolean;
}) {
	const white = useThemeColor({}, 'white');
	const borderColor = useThemeColor({}, 'inputBorder');
	const bg = backgroundColor || white;
	return (
		<ThemedView
			id={id}
			style={[
				styles.container,
				{ borderColor },
				!flat && styles.raised,
				style,
			]}
			lightColor={bg}
			darkColor={bg}
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
		borderWidth: 1,
	},
	raised: {
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.16,
		shadowRadius: 6,
		elevation: 3,
	},
});
