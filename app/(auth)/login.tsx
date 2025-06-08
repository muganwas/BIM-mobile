import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedView } from '@/components/ThemedView';

export default function LoginsScreen() {
	return (
		<ParallaxScrollView headerBackgroundColor={{ light: '#fff', dark: '#fff' }}>
			<ThemedView
				style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
			></ThemedView>
		</ParallaxScrollView>
	);
}
