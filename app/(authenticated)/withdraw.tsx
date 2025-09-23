import { ThemedButton } from '@/components/ThemedButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import TileContainer from '@/components/TileContainer';
import { Colors } from '@/constants/Colors';
import { fontSize, fontWeight } from '@/constants/Font';
import translations from '@/constants/Trans';
import { useGeneral } from '@/context/GeneralContext';
import { useTransaction } from '@/context/TransactionContext';
import useTrackHistory from '@/hooks/useTrackHistory';
import WithdrawFunds from '@/views/WithdrawFunds';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

export default function WithdrawScreen() {
	const colorScheme = useColorScheme() ?? 'light';
	const { routers, fetchRouters } = useTransaction();
	const { user, language } = useGeneral();

	useTrackHistory('/(authenticated)/withdraw');

	useEffect(() => {
		if (user && routers.length === 0) {
			(async () => {
				await fetchRouters(user);
			})();
		}
	}, [user, routers, fetchRouters]);

	const [showWithdraw, setShowWithdraw] = useState(false);
	const [selectedRouterId, setSelectedRouterId] = useState<string | null>(null);

	const currency = useMemo(
		() => translations[language].categories.dashboard.currency ?? 'UGX',
		[language]
	);

	// Predefine header columns for the withdraw routers table
	const withdrawHeaders = useMemo(
		() => [
			{ key: 'row', label: '#', width: 30 },
			{
				key: 'name',
				label: translations[language].categories.dashboard.name,
				width: 120,
			},
			{
				key: 'location',
				label: translations[language].categories.dashboard.location,
				width: 120,
			},
			{
				key: 'ip',
				label: translations[language].categories.dashboard.ipAddress,
				width: 120,
			},
			{
				key: 'balance',
				label: translations[language].categories.dashboard.balance,
				width: 120,
			},
			{
				key: 'actions',
				label: translations[language].categories.dashboard.actions,
				width: 120,
				textAlign: 'center' as const,
			},
		],
		[language]
	);
	const selectedRouter = useMemo(
		() => routers.find((r) => r.id === selectedRouterId) || null,
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
		<ThemedView
			lightColor={Colors.light.background}
			darkColor={Colors.dark.background}
			style={styles.container}
		>
			<ThemedView
				style={{ flexDirection: 'column', gap: 5, marginBottom: 10 }}
				lightColor={Colors.light.background}
				darkColor={Colors.dark.background}
			>
				<ThemedText
					lightColor={Colors.light.text}
					darkColor={Colors.dark.text}
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
					lightColor={Colors.light.screenTitleText}
					darkColor={Colors.dark.screenTitleText}
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
			<TileContainer
				id={'withdraw-router-list'}
				backgroundColor={Colors[colorScheme].background}
				style={{
					flexDirection: 'column',
					overflow: 'hidden',
					boxSizing: 'border-box',
					marginTop: 12,
					padding: 0,
				}}
			>
				<ScrollView
					style={{ width: '100%' }}
					horizontal
					showsHorizontalScrollIndicator
				>
					<ThemedView
						style={{ flexDirection: 'column' }}
						lightColor={Colors.light.background}
						darkColor={Colors.dark.background}
					>
						<ThemedView
							style={{
								flexDirection: 'row',
								justifyContent: 'space-between',
								gap: 10,
								paddingHorizontal: 5,
								paddingVertical: 10,
								borderBottomWidth: 1,
								borderBottomColor: Colors[colorScheme].borderDark,
							}}
							lightColor={Colors.light.titleBg}
							darkColor={Colors.dark.titleBg}
						>
							{withdrawHeaders.map((col) => (
								<ThemedText
									key={`hdr-${col.key}`}
									numberOfLines={1}
									ellipsizeMode='tail'
									style={{
										fontSize: fontSize['text.medium'],
										width: col.width,
										textTransform: 'uppercase',
										paddingRight: 8,
										...(col.textAlign ? { textAlign: col.textAlign } : {}),
									}}
									lightColor={Colors.light.text}
									darkColor={Colors.dark.text}
								>
									{col.label}
								</ThemedText>
							))}
						</ThemedView>

						<ScrollView
							style={{
								flexDirection: 'column',
								backgroundColor: Colors[colorScheme].background,
							}}
						>
							{routers.map((r, index) => (
								<ThemedView
									key={r.id}
									style={{
										flexDirection: 'row',
										width: '100%',
										alignItems: 'center',
										paddingVertical: 5,
										paddingHorizontal: 5,
										backgroundColor:
											index % 2 === 0
												? Colors[colorScheme].listItemBackground
												: Colors[colorScheme].background,
										justifyContent: 'space-between',
										borderBottomWidth: index < routers.length - 1 ? 1 : 0,
										borderBottomColor: Colors[colorScheme].borderDark,
									}}
									lightColor={Colors.light.background}
									darkColor={Colors.dark.background}
								>
									<ThemedText
										numberOfLines={1}
										style={{ width: 30, overflow: 'hidden', paddingRight: 8 }}
										lightColor={Colors.light.text}
										darkColor={Colors.dark.text}
									>
										{index + 1}
									</ThemedText>
									<ThemedText
										numberOfLines={1}
										style={{ width: 120, paddingRight: 8, overflow: 'hidden' }}
										lightColor={Colors.light.text}
										darkColor={Colors.dark.text}
									>
										{r.name}
									</ThemedText>
									<ThemedText
										numberOfLines={1}
										style={{ paddingRight: 8, width: 120 }}
										lightColor={Colors.light.text}
										darkColor={Colors.dark.text}
									>
										{r.location}
									</ThemedText>
									<ThemedText
										numberOfLines={1}
										style={{ paddingRight: 8, width: 120 }}
										lightColor={Colors.light.text}
										darkColor={Colors.dark.text}
									>
										{r?.networkInfo.ipv4}
									</ThemedText>
									<ThemedText
										numberOfLines={1}
										style={{ paddingRight: 8, width: 120 }}
										lightColor={Colors.light.text}
										darkColor={Colors.dark.text}
									>
										{r.transactionBalance}
									</ThemedText>
									<ThemedView
										style={{ width: 120, alignItems: 'center' }}
										lightColor='transparent'
										darkColor='transparent'
									>
										<ThemedButton
											title={translations[language].categories.buttons.withdraw}
											onPress={() => handleWithdrawRouter(r.id)}
											style={{
												backgroundColor: Colors[colorScheme].lime,
												borderRadius: 6,
												minWidth: 120,
											}}
											lightTextColor={Colors.light.white}
											darkTextColor={Colors.dark.white}
										/>
									</ThemedView>
								</ThemedView>
							))}
						</ScrollView>
					</ThemedView>
				</ScrollView>
			</TileContainer>
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
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
	},
});
