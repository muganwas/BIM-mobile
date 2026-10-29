import ParallaxScrollView from '@/components/ParallaxScrollView';
import { RecordCard, RecordList } from '@/components/RecordList';
import TileContainer from '@/components/TileContainer';
import translations from '@/constants/Trans';
import { useGeneral } from '@/context/GeneralContext';
import { useTransaction } from '@/context/TransactionContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import useTrackHistory from '@/hooks/useTrackHistory';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';

export default function VouchersScreen() {
	useTrackHistory('/(authenticated)/vouchers');
	// Theme helpers
	const backgroundLight = useThemeColor({}, 'background', 'light');
	const background = useThemeColor({}, 'background');
	const backgroundDark = useThemeColor({}, 'background', 'dark');
	const router = useRouter();
	const { packages, fetchPackages, routers } = useTransaction();
	const { user, language } = useGeneral();

	// stable per-mount id to avoid duplicate handler registration during Fast Refresh
	const packageRouterListId = useRef(
		`package-router-list-${Math.random().toString(36).slice(2)}`
	);

	useEffect(() => {
		if (user && packages.length === 0) {
			(async () => {
				await fetchPackages();
			})();
		}
	}, [user, packages, fetchPackages]);

	return (
		<ParallaxScrollView
			headerBackgroundColor={{
				light: backgroundLight,
				dark: backgroundDark,
			}}
			containerStyle={{ flex: 1 }}
			contentStyle={{ paddingHorizontal: 10 }}
			onRefresh={async () => {
				await fetchPackages();
			}}
		>
			<TileContainer
				id='vouchers-list-tile'
				flat
				backgroundColor={background}
				style={{ flexDirection: 'column' }}
			>
				<RecordList
					id={packageRouterListId.current}
					title={translations[language].categories.vouchers.title}
					description={
						translations[language].categories.vouchers.mainSubtitle
					}
					isEmpty={routers?.length === 0}
					emptyMessage={translations[language].categories.vouchers.noRouters}
				>
					{routers?.map((r) => (
						<RecordCard
							key={r.id}
							id={`voucher-router-${r.id}`}
							title={r.name}
							subtitle={r.location}
							fields={[
								{
									label: translations[language].categories.dashboard.ipAddress,
									value: r.ip_address || '—',
								},
								{
									label:
										translations[language].categories.dashboard.routerUsername,
									value: r.router_user || '—',
								},
							]}
							actions={[
								{
									label: translations[language].categories.buttons.hotspots,
									icon: 'package',
									tone: 'info',
									onPress: () => router.push(`/routers/vouchers/${r.id}`),
								},
							]}
						/>
					))}
				</RecordList>
			</TileContainer>
		</ParallaxScrollView>
	);
}
