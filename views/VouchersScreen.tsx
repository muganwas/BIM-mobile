import ParallaxScrollView from '@/components/ParallaxScrollView';
import { RecordCard, RecordList } from '@/components/RecordList';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { fontSize, fontWeight } from '@/constants/Font';
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
	const backgroundDark = useThemeColor({}, 'background', 'dark');
	const textLight = useThemeColor({}, 'text', 'light');
	const textDark = useThemeColor({}, 'text', 'dark');
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
			contentStyle={{ padding: 16 }}
			onRefresh={async () => {
				await fetchPackages();
			}}
		>
			<ThemedView
				style={{ flexDirection: 'column', gap: 5, marginBottom: 10 }}
				lightColor={backgroundLight}
				darkColor={backgroundDark}
			>
				<ThemedText
					lightColor={textLight}
					darkColor={textDark}
					style={{
						width: '100%',
						textTransform: 'capitalize',
						fontSize: fontSize['heading.one'],
						fontWeight: fontWeight['heading.one'],
					}}
				>
					{translations[language].categories.vouchers.title}
				</ThemedText>
				<ThemedText
					style={{
						fontSize: fontSize['text.medium'],
					}}
					lightColor={textLight}
					darkColor={textDark}
				>
					{translations[language].categories.vouchers.mainSubtitle}
				</ThemedText>
			</ThemedView>

			<RecordList
				id={packageRouterListId.current}
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
		</ParallaxScrollView>
	);
}
