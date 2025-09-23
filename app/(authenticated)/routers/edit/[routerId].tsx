import { useGeneral } from '@/context/GeneralContext';
import { useTransaction } from '@/context/TransactionContext';
import useTrackHistory from '@/hooks/useTrackHistory';
import { NetRouter } from '@/types';
import RouterOverlay from '@/views/Router';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';

export default function EditRouterScreen() {
	const navigation = useNavigation();
	const routerNav = useRouter();
	const { routerId } = useLocalSearchParams() as { routerId?: string };
	const { routers, setRouters } = useTransaction();
	const { handleUpdateHistory } = useGeneral();
	const [visible, setVisible] = useState(true);

	// Seed parent immediately on mount to guarantee ordering before current route push
	useEffect(() => {
		handleUpdateHistory('/(authenticated)/routers');
	}, [handleUpdateHistory]);

	// Removed focus-based seeding to avoid reshuffling history during back

	// call the tracking hook after seeding so current route is pushed after parent
	useTrackHistory(
		routerId
			? `/(authenticated)/routers/edit/${routerId}`
			: '/(authenticated)/routers/edit'
	);

	const targetRouter: NetRouter | undefined = useMemo(
		() => routers.find((r) => r.id === routerId),
		[routerId, routers]
	);

	useEffect(() => {
		navigation.setOptions({
			headerProps: {
				goback: true,
			},
		});
	}, [navigation]);

	const initialValues = useMemo(() => {
		if (!targetRouter) return undefined;
		return {
			name: targetRouter.name,
			location: targetRouter.location,
			type: targetRouter.type,
			ipAddress: targetRouter.networkInfo.ipv4,
			username: targetRouter.username,
			password: targetRouter.password,
		};
	}, [targetRouter]);

	if (!targetRouter) return null;

	return (
		<RouterOverlay
			visible={visible}
			mode='edit'
			initial={initialValues}
			onCancel={() => {
				setVisible(false);
				routerNav.push('/routers');
			}}
			onBack={() => {
				setVisible(false);
				routerNav.push('/routers');
			}}
			onSubmit={({ name, location, type, ipAddress, username, password }) => {
				setRouters((prev) =>
					prev.map((r) =>
						r.id === targetRouter.id
							? {
									...r,
									name,
									location,
									type,
									username,
									password,
									networkInfo: {
										...r.networkInfo,
										ipv4: ipAddress,
										ipv6: `::ffff:${ipAddress}`,
										hostname: `${name
											.toLowerCase()
											.replace(/\s+/g, '-')}.local`,
									},
									updatedAt: new Date(),
							  }
							: r
					)
				);
				setVisible(false);
				routerNav.push('/routers');
			}}
		/>
	);
}
