import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';

export default function HotspotPackagesPlaceholder() {
	return (
		<ThemedView
			lightColor={Colors.light.background}
			darkColor={Colors.dark.background}
			style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
		>
			<ThemedText lightColor={Colors.light.text} darkColor={Colors.dark.text}>
				Packages screen
			</ThemedText>
		</ThemedView>
	);
}
