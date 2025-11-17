import { useIsFocused } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import {
	Dimensions,
	GestureResponderEvent,
	StyleSheet,
	useColorScheme,
} from 'react-native';

import DashboardTile from '@/components/DashboardTile';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import TileContainer from '@/components/TileContainer';
import { fontSize, fontWeight } from '@/constants/Font';
import translations from '@/constants/Trans';
import { useGeneral } from '@/context/GeneralContext';
import { useTransaction } from '@/context/TransactionContext';
import { formatMMDD, timeAgo, translateWithVariables } from '@/helpers';
import { useThemeColor } from '@/hooks/useThemeColor';
import useTrackHistory from '@/hooks/useTrackHistory';
import { MicroTransaction } from '@/types';
import { useRouter } from 'expo-router';
import { BarChart } from 'react-native-chart-kit';
import { ScrollView } from 'react-native-gesture-handler';

export default function HomeScreen() {
	const {
		setSelectedOption,
		language,
		user,
		refreshDashboard,
		lastDashboardUpdated,
	} = useGeneral();

	// Keep a label that updates every 60s while a last-updated timestamp exists.
	const [lastUpdatedLabel, setLastUpdatedLabel] = useState('');
	const isFocused = useIsFocused();

	useEffect(() => {
		if (!lastDashboardUpdated || !isFocused) {
			setLastUpdatedLabel('');
			return;
		}
		// Set immediately, then update every minute while screen is focused
		setLastUpdatedLabel(timeAgo(lastDashboardUpdated));
		const id = setInterval(() => {
			try {
				setLastUpdatedLabel(timeAgo(lastDashboardUpdated));
			} catch {}
		}, 60 * 1000);
		return () => clearInterval(id);
	}, [lastDashboardUpdated, isFocused]);

	const [refreshing, setRefreshing] = useState(false);
	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		try {
			// Force a refresh to bypass the short-circuit when dashboard already exists
			await (refreshDashboard
				? refreshDashboard(true)
				: Promise.resolve(false));
		} catch {
			// ignore — refreshDashboard logs errors
		} finally {
			setRefreshing(false);
		}
	}, [refreshDashboard]);

	// explicitly track home page
	useTrackHistory('/(authenticated)/home');
	const width = Dimensions.get('window').width;
	const router = useRouter();
	useColorScheme();
	// Theme helpers
	const background = useThemeColor({}, 'background');
	const backgroundLight = useThemeColor({}, 'background', 'light');
	const backgroundDark = useThemeColor({}, 'background', 'dark');
	const screenTitleTextLight = useThemeColor({}, 'screenTitleText', 'light');
	const screenTitleTextDark = useThemeColor({}, 'screenTitleText', 'dark');
	const textLight = useThemeColor({}, 'text', 'light');
	const textDark = useThemeColor({}, 'text', 'dark');
	const muted = useThemeColor({}, 'mutedText');
	const iconTint = useThemeColor({}, 'iconTint');
	const dayText = useThemeColor({}, 'dayText');
	const dayIconBackground = useThemeColor({}, 'dayIconBackground');
	const dayTransactionsBackground = useThemeColor(
		{},
		'dayTransactionsBackground'
	);
	const weekText = useThemeColor({}, 'weekText');
	const weekIconBackground = useThemeColor({}, 'weekIconBackground');
	const weekTransactionsBackground = useThemeColor(
		{},
		'weekTransactionsBackground'
	);
	const monthText = useThemeColor({}, 'monthText');
	const monthIconBackground = useThemeColor({}, 'monthIconBackground');
	const monthTransactionsBackground = useThemeColor(
		{},
		'monthTransactionsBackground'
	);
	const borderDark = useThemeColor({}, 'borderDark');
	const bim = useThemeColor({}, 'bim');
	const darkBackgroundColor = useThemeColor({}, 'background', 'dark');
	const lightBackgroundColor = useThemeColor({}, 'background', 'light');
	const whiteLight = useThemeColor({}, 'white', 'light');
	const whiteDark = useThemeColor({}, 'white', 'dark');
	const bimLight = useThemeColor({}, 'bim', 'light');
	const bimDark = useThemeColor({}, 'bim', 'dark');
	const authButtonTextLight = useThemeColor({}, 'authButtonText', 'light');
	const authButtonTextDark = useThemeColor({}, 'authButtonText', 'dark');
	const {
		dailyPurchasesTotal,
		weeklyPurchasesTotal,
		monthlyPurchasesTotal,
		lastSevenDaysPurchases,
		lastFiveTransactions,
		purchasesPerRouter,
		dailyVoucherUsersTotal,
		weeklyVoucherUsersTotal,
		monthlyVoucherUsersTotal,
	} = useTransaction();

	// Prefer server-provided recent transactions when available; fall back to
	// the TransactionContext-provided `lastFiveTransactions`.
	const renderTransactions: MicroTransaction[] =
		lastFiveTransactions && lastFiveTransactions.length > 0
			? lastFiveTransactions
			: [];

	return (
		<ParallaxScrollView
			onRefresh={onRefresh}
			refreshing={refreshing}
			headerBackgroundColor={{
				light: backgroundLight,
				dark: backgroundDark,
			}}
			contentStyle={{ paddingHorizontal: 10 }}
			onTouchStart={(e: GestureResponderEvent) => {
				e.stopPropagation(); // Prevent touch events from propagating to the drawer
				setSelectedOption(undefined);
			}}
		>
			<ThemedView style={styles.titleContainer}>
				<ThemedText
					lightColor={screenTitleTextLight}
					darkColor={screenTitleTextDark}
					style={{ fontSize: 24, fontWeight: 'bold' }}
				>
					{translations[language].categories.dashboard.title}
				</ThemedText>
				{typeof lastDashboardUpdated !== 'undefined' &&
					lastDashboardUpdated !== null && (
						<ThemedText
							lightColor={muted}
							darkColor={muted}
							style={{ fontSize: 12, marginLeft: 8 }}
						>
							{translateWithVariables(
								translations[language].categories.dashboard?.lastUpdated ||
									'Last updated: {time}',
								{ time: lastUpdatedLabel }
							)}
						</ThemedText>
					)}
			</ThemedView>
			<DashboardTile
				id='todays-transactions'
				amount={dailyPurchasesTotal ?? 0}
				title={translations[language].categories.dashboard.todaysTransactions}
				iconName='cash'
				iconColor={iconTint}
				titleColor={dayText}
				iconBackgroundColor={dayIconBackground}
				backgroundColor={dayTransactionsBackground}
				iconSize={30}
				language={language}
			/>
			<DashboardTile
				id='weeks-transactions'
				amount={weeklyPurchasesTotal ?? 0}
				title={translations[language].categories.dashboard.weeksTransactions}
				iconName='calendar'
				iconColor={iconTint}
				titleColor={weekText}
				iconBackgroundColor={weekIconBackground}
				backgroundColor={weekTransactionsBackground}
				iconSize={30}
				language={language}
			/>
			<DashboardTile
				id='months-transactions'
				amount={monthlyPurchasesTotal ?? 0}
				title={translations[language].categories.dashboard.monthsTransactions}
				iconName='monthlyCalendar'
				iconColor={iconTint}
				titleColor={monthText}
				iconBackgroundColor={monthIconBackground}
				backgroundColor={monthTransactionsBackground}
				iconSize={30}
				language={language}
			/>
			<DashboardTile
				id='days-voucher-users'
				amount={dailyVoucherUsersTotal ?? 0}
				amountType='number'
				titleColor={dayText}
				title={translations[language].categories.dashboard.todaysVouchers}
				backgroundColor={background}
				language={language}
			/>
			<DashboardTile
				id='weeks-voucher-users'
				amount={weeklyVoucherUsersTotal ?? 0}
				amountType='number'
				titleColor={weekText}
				title={translations[language].categories.dashboard.weeksVouchers}
				backgroundColor={background}
				language={language}
			/>
			<DashboardTile
				id='months-voucher-users'
				amount={monthlyVoucherUsersTotal ?? 0}
				amountType='number'
				titleColor={monthText}
				title={translations[language].categories.dashboard.monthsVouchers}
				backgroundColor={background}
				language={language}
			/>
			<TileContainer
				id='last-five-transactions'
				backgroundColor={background}
				style={{
					flexDirection: 'column',
				}}
			>
				<ThemedView
					style={{ flex: 1 }}
					lightColor={backgroundLight}
					darkColor={backgroundDark}
				>
					<ThemedText
						lightColor={screenTitleTextLight}
						darkColor={screenTitleTextDark}
						style={{
							width: '100%',
							textTransform: 'capitalize',
							fontSize: fontSize['heading.three'],
							fontWeight: fontWeight['heading.three'],
						}}
					>
						{translateWithVariables(
							translations[language].categories.dashboard.lastTransactions,
							{ number: 5 }
						)}
					</ThemedText>
				</ThemedView>
				<ScrollView
					style={{ width: '100%' }}
					horizontal
					showsHorizontalScrollIndicator={true}
				>
					<ThemedView
						style={{ flexDirection: 'column', flex: 1 }}
						lightColor={backgroundLight}
						darkColor={backgroundDark}
					>
						<ThemedView
							id='last-five-transactions-header'
							style={{
								flexDirection: 'row',
								justifyContent: 'space-between',
								gap: 10,
								paddingHorizontal: 5,
								paddingVertical: 10,
								borderBottomWidth: 1,
								borderBottomColor: borderDark,
							}}
							lightColor={backgroundLight}
							darkColor={backgroundDark}
						>
							<ThemedText
								style={{ width: 30 }}
								lightColor={textLight}
								darkColor={textDark}
							>
								#
							</ThemedText>
							<ThemedText
								numberOfLines={1}
								ellipsizeMode='tail'
								style={{
									fontSize: fontSize['text.medium'],
									width: 80,
									textTransform: 'uppercase',
									paddingRight: 8,
								}}
								lightColor={textLight}
								darkColor={textDark}
							>
								{translations[language].categories.dashboard.amount}
							</ThemedText>
							<ThemedText
								numberOfLines={1}
								ellipsizeMode='tail'
								style={{
									fontSize: fontSize['text.medium'],
									width: 80,
									textTransform: 'uppercase',
									paddingRight: 8,
								}}
								lightColor={textLight}
								darkColor={textDark}
							>
								{translations[language].categories.dashboard.type}
							</ThemedText>
							<ThemedText
								numberOfLines={1}
								ellipsizeMode='tail'
								style={{
									fontSize: fontSize['text.medium'],
									width: 80,
									textTransform: 'uppercase',
									paddingRight: 8,
								}}
								lightColor={textLight}
								darkColor={textDark}
							>
								{translations[language].categories.dashboard.reason}
							</ThemedText>
							<ThemedText
								numberOfLines={1}
								ellipsizeMode='tail'
								style={{
									fontSize: fontSize['text.medium'],
									width: 80,
									textTransform: 'uppercase',
									paddingRight: 8,
								}}
								lightColor={textLight}
								darkColor={textDark}
							>
								{translations[language].categories.dashboard.routerName}
							</ThemedText>
							<ThemedText
								numberOfLines={1}
								ellipsizeMode='tail'
								style={{
									fontSize: fontSize['text.medium'],
									width: 80,
									textTransform: 'uppercase',
									paddingRight: 8,
								}}
								lightColor={textLight}
								darkColor={textDark}
							>
								{translations[language].categories.dashboard.date}
							</ThemedText>
						</ThemedView>
						<ScrollView
							style={{ width: '100%' }}
							showsVerticalScrollIndicator={true}
						>
							<ThemedView
								id='last-five-transactions-body'
								style={{
									flexDirection: 'column',
								}}
								lightColor={lightBackgroundColor}
								darkColor={darkBackgroundColor}
							>
								{renderTransactions.map((transaction, index) => (
									<ThemedView
										key={index}
										style={{
											flexDirection: 'row',
											justifyContent: 'space-between',
											gap: 10,
											paddingHorizontal: 5,
											paddingVertical: 10,
											borderBottomWidth: 1,
											borderBottomColor: borderDark,
										}}
										lightColor={lightBackgroundColor}
										darkColor={darkBackgroundColor}
									>
										<ThemedText
											numberOfLines={1}
											ellipsizeMode='tail'
											style={{
												fontSize: fontSize['text.medium'],
												width: 30,
												paddingRight: 8,
											}}
										>
											{index + 1}
										</ThemedText>
										<ThemedText
											numberOfLines={1}
											ellipsizeMode='tail'
											style={{
												fontSize: fontSize['text.medium'],
												width: 80,
												paddingRight: 8,
											}}
										>
											{transaction.amount}
										</ThemedText>
										<ThemedText
											numberOfLines={1}
											ellipsizeMode='tail'
											style={{
												fontSize: fontSize['text.medium'],
												width: 80,
												paddingRight: 8,
											}}
										>
											{transaction.method.type}
										</ThemedText>
										<ThemedText
											numberOfLines={1}
											ellipsizeMode='tail'
											style={{
												fontSize: fontSize['text.medium'],
												width: 80,
												paddingRight: 8,
											}}
										>
											{transaction.reason}
										</ThemedText>
										<ThemedText
											numberOfLines={1}
											ellipsizeMode='tail'
											style={{
												fontSize: fontSize['text.medium'],
												width: 80,
												paddingRight: 8,
											}}
										>
											{transaction.routerName}
										</ThemedText>
										<ThemedText
											numberOfLines={1}
											ellipsizeMode='tail'
											style={{
												fontSize: fontSize['text.medium'],
												width: 80,
												paddingRight: 8,
											}}
										>
											{transaction.date.toLocaleDateString()}
										</ThemedText>
									</ThemedView>
								))}
							</ThemedView>
						</ScrollView>
					</ThemedView>
				</ScrollView>
				<ThemedView
					style={{
						width: '100%',
						flex: 1,
						alignItems: 'center',
						justifyContent: 'center',
					}}
					lightColor={backgroundLight}
					darkColor={backgroundDark}
				>
					<ThemedButton
						title={translations[
							language
						].categories.buttons.allTransactions?.toUpperCase()}
						onPress={() => router.push('/(authenticated)/transactions')}
						style={{
							borderRadius: 8,
						}}
						darkColor={bimDark}
						lightColor={bimLight}
						darkTextColor={authButtonTextDark}
						lightTextColor={authButtonTextLight}
					/>
				</ThemedView>
			</TileContainer>
			<TileContainer
				id='transaction-volume-chart'
				backgroundColor={background}
				style={{ flexDirection: 'column', overflow: 'hidden' }}
			>
				<ThemedView
					style={{ flex: 1 }}
					lightColor={backgroundLight}
					darkColor={backgroundDark}
				>
					<ThemedText
						lightColor={screenTitleTextLight}
						darkColor={screenTitleTextDark}
						style={{
							width: '100%',
							textTransform: 'capitalize',
							fontSize: fontSize['heading.three'],
							fontWeight: fontWeight['heading.three'],
						}}
					>
						{translateWithVariables(
							translations[language].categories.dashboard.transVolume,
							{ number: 7 }
						)}
					</ThemedText>
				</ThemedView>
				<ThemedView
					lightColor={backgroundLight}
					darkColor={backgroundDark}
					style={{
						position: 'relative',
					}}
				>
					<BarChart
						data={{
							labels: [
								...(user?.dashboard?.chartData
									? user.dashboard.chartData.map((c) =>
											formatMMDD(new Date(c.date))
									  )
									: (lastSevenDaysPurchases ?? []).map((p) =>
											formatMMDD(p.date)
									  )),
							],
							datasets: [
								{
									data: [
										...(user?.dashboard?.chartData
											? user.dashboard.chartData.map((c) => c.total)
											: (lastSevenDaysPurchases ?? []).map((p) => p.amount)),
									],
								},
							],
						}}
						width={width - 30}
						height={220}
						yAxisSuffix=''
						yAxisLabel=''
						chartConfig={{
							backgroundGradientFrom: background,
							backgroundGradientTo: background,
							decimalPlaces: 0,
							color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
							labelColor: (opacity = 1) => `rgba(0,0,0, ${opacity})`,
						}}
						style={{ marginVertical: 8, borderRadius: 8, left: -20 }}
					/>
				</ThemedView>
			</TileContainer>
			<TileContainer
				id='router-balances'
				backgroundColor={background}
				style={{ flexDirection: 'column', overflow: 'hidden' }}
			>
				<ThemedView
					style={{ flex: 1 }}
					lightColor={backgroundLight}
					darkColor={backgroundDark}
				>
					<ThemedText
						lightColor={screenTitleTextLight}
						darkColor={screenTitleTextDark}
						style={{
							width: '100%',
							textTransform: 'capitalize',
							fontSize: fontSize['heading.three'],
							fontWeight: fontWeight['heading.three'],
						}}
					>
						{translations[language].categories.dashboard.routerBalances}
					</ThemedText>
				</ThemedView>
				<ThemedView
					style={{
						flexDirection: 'column',
						borderWidth: 2,
						borderColor: borderDark,
						borderRadius: 5,
					}}
					lightColor={backgroundLight}
					darkColor={backgroundDark}
				>
					{(user?.dashboard?.routerBalances
						? user.dashboard.routerBalances.map((rb) => ({
								name: rb.name,
								location: '',
								amount: rb.balance,
						  }))
						: purchasesPerRouter ?? []
					).map((router, index) => (
						<ThemedView
							key={index}
							style={{
								flexDirection: 'row',
								width: '100%',
								padding: 12,
								justifyContent: 'space-between',
								borderBottomWidth:
									index < (purchasesPerRouter ?? []).length - 1 ? 1 : 0,
								borderBottomColor: borderDark,
							}}
							lightColor={backgroundLight}
							darkColor={backgroundDark}
						>
							<ThemedText
								numberOfLines={1}
								style={{ width: 150, overflow: 'hidden' }}
								lightColor={textLight}
								darkColor={textDark}
							>
								{router.name}
							</ThemedText>
							<ThemedText
								style={{
									paddingHorizontal: 10,
									backgroundColor: bim,
									borderRadius: 50,
								}}
								lightColor={whiteLight}
								darkColor={whiteDark}
							>
								{router.amount}
							</ThemedText>
						</ThemedView>
					))}
				</ThemedView>
			</TileContainer>
		</ParallaxScrollView>
	);
}

const styles = StyleSheet.create({
	titleContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	transactionItem: {
		padding: 12,
		borderRadius: 8,
		marginBottom: 8,
		borderWidth: 1,
		borderColor: '#ddd',
	},
	container: {
		flex: 1,
		padding: 16,
		borderRadius: 8,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2, // For Android shadow
	},
	transactionContainer: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		justifyContent: 'flex-start',
		padding: 12,
		gap: 15,
		borderRadius: 8,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
		borderWidth: 1,
		borderColor: '#ddd',
	},
});
