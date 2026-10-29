import ParallaxScrollView from '@/components/ParallaxScrollView';
import { RecordCard, RecordList } from '@/components/RecordList';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { fontSize, fontWeight } from '@/constants/Font';
import translations from '@/constants/Trans';
import { formatAmount } from '@/helpers';
import { useGeneral } from '@/context/GeneralContext';
import { useTransaction } from '@/context/TransactionContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import useTrackHistory from '@/hooks/useTrackHistory';
import WithdrawFunds from '@/views/WithdrawFunds';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';

export default function WithdrawScreen() {
	const bg = useThemeColor({}, 'background');
	const textColor = useThemeColor({}, 'text');
	const screenTitleText = useThemeColor({}, 'screenTitleText');
	const { routers, fetchRouters } = useTransaction();
	const { user, language } = useGeneral();

	const [refreshing, setRefreshing] = useState(false);

	const handleRefresh = useCallback(async () => {
		setRefreshing(true);
		try {
			if (user) await fetchRouters();
			else await fetchRouters();
		} catch (e) {
			console.error('[WithdrawScreen] refresh failed', e);
		} finally {
			setRefreshing(false);
		}
	}, [fetchRouters, user]);

	useTrackHistory('/(authenticated)/withdraw');

	useEffect(() => {
		if (user && routers?.length === 0) {
			(async () => {
				await fetchRouters();
			})();
		}
	}, [user, routers, fetchRouters]);

	const [showWithdraw, setShowWithdraw] = useState(false);
	const [selectedRouterId, setSelectedRouterId] = useState<string | null>(null);

	const currency = useMemo(
		() => translations[language].categories.dashboard.currency ?? 'UGX',
		[language]
	);

	const selectedRouter = useMemo(
		() => routers?.find((r) => r.id === selectedRouterId) || null,
		[routers, selectedRouterId]
	);

	const handleWithdrawRouter = (routerId: string) => {
		if (!routerId) return;
		setSelectedRouterId(routerId);
		setShowWithdraw(true);
	};

	const handleCancelWithdraw = () => {
		setShowWithdraw(false);
	};

	const handleInitiateWithdraw = (payload: {
		amount: string;
		phone: string;
		narration?: string;
	}) => {
		// TODO: integrate API call to initiate withdrawal
		// For now, just close modal; leave navigation or toast for future step
		setShowWithdraw(false);
	};

	return (
		<ParallaxScrollView
			headerBackgroundColor={{ light: bg, dark: bg }}
			containerStyle={{ flex: 1 }}
			contentStyle={{ padding: 16 }}
			onRefresh={handleRefresh}
			refreshing={refreshing}
		>
		<ThemedView lightColor={bg} darkColor={bg} style={styles.container}>
			<ThemedView
				style={{ flexDirection: 'column', gap: 5, marginBottom: 10 }}
				lightColor={bg}
				darkColor={bg}
			>
				<ThemedText
					lightColor={textColor}
					darkColor={textColor}
					style={{
						width: '100%',
						textTransform: 'capitalize',
						fontSize: fontSize['heading.one'],
						fontWeight: fontWeight['heading.one'],
					}}
				>
					{translations[language].categories.withdraw.title}
				</ThemedText>
				<ThemedText
					lightColor={screenTitleText}
					darkColor={screenTitleText}
					style={{
						width: '100%',
						textTransform: 'capitalize',
						fontSize: fontSize['heading.text'],
						fontWeight: fontWeight['heading.text'],
					}}
				>
					{translations[language].categories.withdraw.subtitle}
				</ThemedText>
			</ThemedView>
			<RecordList
				id='withdraw-router-list'
				isEmpty={routers?.length === 0}
				emptyMessage={translations[language].categories.withdraw.noRouters}
			>
				{routers?.map((r) => (
					<RecordCard
						key={r.id}
						id={`withdraw-router-${r.id}`}
						title={r.name}
						subtitle={r.location}
						fields={[
							{
								label: translations[language].categories.dashboard.ipAddress,
								value: r.ip_address || 'N/A',
							},
							{
								label: translations[language].categories.dashboard.balance,
								value: `${formatAmount(r.balance)} ${currency}`,
							},
						]}
						actions={[
							{
								label: translations[language].categories.buttons.withdraw,
								icon: 'withdrawal',
								tone: 'success',
								onPress: () => handleWithdrawRouter(r.id),
							},
						]}
					/>
				))}
			</RecordList>
			{selectedRouter && (
				<WithdrawFunds
					visible={showWithdraw}
					routerName={selectedRouter.name}
					currency={currency}
					onCancel={handleCancelWithdraw}
					onInitiate={handleInitiateWithdraw}
				/>
			)}
			</ThemedView>
		</ParallaxScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
	},
});
