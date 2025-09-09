import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import useTrackHistory from '@/hooks/useTrackHistory';
import { StyleSheet } from 'react-native';

export default function WithdrawScreen() {
	useTrackHistory('/(authenticated)/withdraw');
	return (
		<ThemedView
			lightColor={Colors.light.background}
			darkColor={Colors.dark.background}
			style={styles.container}
		>
			<ThemedText lightColor={Colors.light.text} darkColor={Colors.dark.text}>
				Withdraw Screen
			</ThemedText>
		</ThemedView>
	);
}
const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
	},
});
