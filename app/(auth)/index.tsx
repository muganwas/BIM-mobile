import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { verifyToken } from '@/helpers/auth';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function RegisterScreen() {
	const router = useRouter();
	useEffect(() => {
		const verify = async () => {
			const token = localStorage.getItem('bim-token');
			const isValid = await verifyToken(token || '');
			if (isValid) {
				router.replace({
					pathname: '/(authenticated)/home',
					params: { token },
				});
			}
		};
		verify();
	}, [router]);
	return (
		<ParallaxScrollView headerBackgroundColor={{ light: '#fff', dark: '#fff' }}>
			<ThemedView
				style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
				lightColor='#fff'
				darkColor='#fff'
			>
				<ThemedText
					lightColor={Colors.light.headers}
					darkColor={Colors.dark.headers}
				>
					Adventure starts here
				</ThemedText>
			</ThemedView>
		</ParallaxScrollView>
	);
}
