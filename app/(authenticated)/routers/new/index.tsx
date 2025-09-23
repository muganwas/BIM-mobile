import { useGeneral } from '@/context/GeneralContext';
import { useTransaction } from '@/context/TransactionContext';
import * as factories from '@/helpers/factories';
import RouterOverlay from '@/views/Router';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function NewRouterScreen() {
	const router = useRouter();
	const navigation = useNavigation();
	const { handleUpdateHistory } = useGeneral();
	const { setRouters } = useTransaction();
	const [visible, setVisible] = useState(true);

	useEffect(() => {
		navigation.setOptions({
			headerProps: {
				goback: true,
			},
		});
	}, [navigation]);

	// Seed parent immediately on mount to guarantee ordering before any current route push
	useEffect(() => {
		handleUpdateHistory('/(authenticated)/routers');
	}, [handleUpdateHistory]);

	// Seed parent path on focus so back goes to routers list; guard to run once per focus
	const seededParentRef = useRef(false);
	useFocusEffect(
		useCallback(() => {
			if (!seededParentRef.current) {
				handleUpdateHistory('/(authenticated)/routers/new');
				seededParentRef.current = true;
			}
			return () => {
				seededParentRef.current = false; // reset on blur
			};
		}, [handleUpdateHistory])
	);

	return (
		<RouterOverlay
			visible={visible}
			mode='add'
			onCancel={() => {
				setVisible(false);
				router.push('/routers');
			}}
			onBack={() => {
				setVisible(false);
				router.push('/routers');
			}}
			onSubmit={({ name, location, type, ipAddress, username, password }) => {
				// Create a new router object using factory with provided payload
				const newRouter = factories.generateNetRouter({
					name,
					location,
					type,
					networkInfo: {
						mac: `00:1A:2B:3C:4D:${Math.floor(Math.random() * 255)
							.toString(16)
							.padStart(2, '0')}`,
						ipv4: ipAddress,
						ipv6: `::ffff:${ipAddress}`,
						hostname: `${name.toLowerCase().replace(/\s+/g, '-')}.local`,
						routerHash: Math.random().toString(36).slice(2, 10),
						uptime: '0',
						hotspots: [],
					},
					username,
					password,
				});
				setRouters((prev) => [newRouter, ...prev]);
				setVisible(false);
				router.push('/routers');
			}}
		/>
	);
}
