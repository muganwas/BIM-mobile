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
import { formatMMDD, translateWithVariables } from '@/helpers';
import { useThemeColor } from '@/hooks/useThemeColor';
import useTrackHistory from '@/hooks/useTrackHistory';
import {
	dayPurchase,
	MicroTransaction,
	TransactionStatus,
	VoucherUser,
} from '@/types';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { BarChart } from 'react-native-chart-kit';
import { ScrollView } from 'react-native-gesture-handler';

export default function HomeScreen() {
	const { setSelectedOption, language, user } = useGeneral();

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
	const { purchases, voucherUsers, routers } = useTransaction();
	const [dailyPurchasesTotal, setDailyPurchasesTotal] = useState(0);
	const [weeklyPurchasesTotal, setWeeklyPurchasesTotal] = useState(0);
	const [lastSevenDaysPurchases, setLastSevenDaysPurchases] = useState<
		dayPurchase[]
	>([]);
	const [monthlyPurchasesTotal, setMonthlyPurchasesTotal] = useState(0);
	const [dailyVoucherUsersTotal, setDailyVoucherUsersTotal] = useState(0);
	const [weeklyVoucherUsersTotal, setWeeklyVoucherUsersTotal] = useState(0);
	const [monthlyVoucherUsersTotal, setMonthlyVoucherUsersTotal] = useState(0);
	const [lastSevenVoucherUsers, setLastSevenVoucherUsers] = useState<
		VoucherUser[]
	>([]);
	const [purchasesPerRouter, setPurchasesPerRouter] = useState<
		{ name: string; location: string; amount: number }[]
	>([]);
	const [lastFiveTransactions, setLastFiveTransactions] = useState<
		MicroTransaction[]
	>([]);

	// Prefer server-provided recent transactions when available; map to the
	// MicroTransaction shape expected by the UI. Fall back to client-side
	// `lastFiveTransactions` computed from purchases.
	const renderTransactions: MicroTransaction[] = user?.dashboard
		?.recentTransactions
		? user.dashboard.recentTransactions.map((rt) => ({
				id: rt.id ?? String(rt.created_at || Math.random()),
				amount: Number(rt.amount) || 0,
				status: (rt.status as any as TransactionStatus) || 'completed',
				routerName:
					(rt.router && (rt.router as any).name) || (rt.router_id ?? ''),
				date: rt.created_at ? new Date(rt.created_at) : new Date(),
				reason: (rt.reason as any) || 'other',
				description: undefined,
				method: { type: (rt.type as any) || 'mobile-money' },
		  }))
		: lastFiveTransactions;

	useEffect(() => {
		if (purchases && routers) {
			// Helper to normalize strings for tolerant matching between generated
			// purchases and routers. Factories may produce slightly different
			// formats (e.g. purchase.routerName vs router.id vs router.name), so
			// compare multiple normalized variants.
			const normalize = (s?: string) =>
				(s ?? '')
					.toString()
					.toLowerCase()
					.replace(/[^a-z0-9]/g, '');
			const purchasesMap: Record<string, number> = {};
			purchases.forEach((purchase) => {
				const target = normalize(purchase.routerName);
				const router = routers.find((r) => {
					if (!r) return false;
					const idN = normalize(r.id);
					const nameN = normalize(r.name);
					// Exact id or name match, or fuzzy containment match
					return (
						idN === target ||
						nameN === target ||
						idN.includes(target) ||
						nameN.includes(target) ||
						target.includes(idN) ||
						target.includes(nameN)
					);
				});
				if (router) {
					const key = `${router.name}_${router.location}`;
					purchasesMap[key] = (purchasesMap[key] || 0) + purchase.amount;
				}
			});
			const formattedData = Object.entries(purchasesMap).map(
				([key, amount]) => {
					const [name, location] = key.split('_');
					return { name, location, amount };
				}
			);
			setPurchasesPerRouter(formattedData);
		}
	}, [purchases, routers]);

	useEffect(() => {
		if (!purchases || purchases.length === 0) {
			setLastFiveTransactions([]);
			setDailyPurchasesTotal(0);
			setWeeklyPurchasesTotal(0);
			setMonthlyPurchasesTotal(0);
			return;
		}

		const today = new Date();
		// Normalize today boundaries
		const startOfToday = new Date(today);
		startOfToday.setHours(0, 0, 0, 0);
		const endOfToday = new Date(today);
		endOfToday.setHours(23, 59, 59, 999);

		// Start of week (Sunday). Change logic if week should start on Monday.
		const startOfWeek = new Date(startOfToday);
		startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
		startOfWeek.setHours(0, 0, 0, 0);

		// Start of month
		const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
		startOfMonth.setHours(0, 0, 0, 0);

		// Helper to parse purchase date
		const toDate = (d: Date | string) => {
			const dt = new Date(d);
			return dt;
		};

		// Daily total (range compare)
		const dailyTotal = purchases
			.filter((purchase) => {
				const pd = toDate(purchase.date);
				return pd >= startOfToday && pd <= endOfToday;
			})
			.reduce((acc, p) => acc + p.amount, 0);

		// Weekly purchases (full date compare includes month/year)
		const weekPurchases = purchases.filter((purchase) => {
			const pd = toDate(purchase.date);
			return pd >= startOfWeek && pd <= endOfToday;
		});

		// Build last 7 days array (midnight timestamps) and aggregate per day
		const lastSevenDates = Array.from({ length: 7 }, (_, i) => {
			const d = new Date(startOfToday);
			d.setDate(d.getDate() - (6 - i)); // oldest first
			d.setHours(0, 0, 0, 0);
			return d;
		});

		const weekPurchasesPerDayTemp: dayPurchase[] = lastSevenDates.map((day) => {
			const dayStart = new Date(day);
			const dayEnd = new Date(day);
			dayEnd.setHours(23, 59, 59, 999);

			const amount = weekPurchases
				.filter((p) => {
					const pd = toDate(p.date);
					return pd >= dayStart && pd <= dayEnd;
				})
				.reduce((acc, p) => acc + p.amount, 0);

			return {
				date: new Date(day),
				day: new Date(day).toLocaleDateString('en-US', { weekday: 'long' }),
				amount,
			};
		});

		// Monthly total (range compare)
		const monthTotal = purchases
			.filter((purchase) => {
				const pd = toDate(purchase.date);
				return pd >= startOfMonth && pd <= endOfToday;
			})
			.reduce((acc, p) => acc + p.amount, 0);

		// Last five transactions (most recent)
		const sortedPurchases = [...purchases].sort((a, b) => {
			return new Date(b.date).getTime() - new Date(a.date).getTime();
		});
		setLastFiveTransactions(sortedPurchases.slice(0, 5));

		// Set state
		const weekTotal = weekPurchases.reduce((acc, p) => acc + p.amount, 0);
		setLastSevenDaysPurchases(weekPurchasesPerDayTemp);
		setWeeklyPurchasesTotal(weekTotal);
		setMonthlyPurchasesTotal(monthTotal);
		setDailyPurchasesTotal(dailyTotal);
	}, [purchases]);

	useEffect(() => {
		if (!voucherUsers || voucherUsers.length === 0) {
			setDailyVoucherUsersTotal(0);
			setWeeklyVoucherUsersTotal(0);
			setMonthlyVoucherUsersTotal(0);
			return;
		}

		// Normalize today range
		const today = new Date();
		const startOfToday = new Date(today);
		startOfToday.setHours(0, 0, 0, 0);
		const endOfToday = new Date(today);
		endOfToday.setHours(23, 59, 59, 999);

		// Start of week (Sunday). Adjust as needed if week starts on Monday:
		const startOfWeek = new Date(startOfToday);
		startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday
		startOfWeek.setHours(0, 0, 0, 0);

		// Start of month
		const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
		startOfMonth.setHours(0, 0, 0, 0);

		// Today's voucher users (range compare)
		const todayVoucherUsers = voucherUsers.filter((user) => {
			const userDate = new Date(user.createdAt);
			return userDate >= startOfToday && userDate <= endOfToday;
		});
		const dailyTotal = todayVoucherUsers.length;

		// This week's voucher users (full date compare includes month/year)
		const weekVoucherUsers = voucherUsers.filter((user) => {
			const userDate = new Date(user.createdAt);
			return userDate >= startOfWeek && userDate <= endOfToday;
		});
		const weekTotal = weekVoucherUsers.length;

		// This month's voucher users
		const monthVoucherUsers = voucherUsers.filter((user) => {
			const userDate = new Date(user.createdAt);
			return userDate >= startOfMonth && userDate <= endOfToday;
		});
		const monthTotal = monthVoucherUsers.length;

		const sortedVoucherUsers = [...voucherUsers].sort((a, b) => {
			return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
		});
		const lastVoucherUsers = sortedVoucherUsers.slice(0, 7);

		setLastSevenVoucherUsers(lastVoucherUsers);
		setWeeklyVoucherUsersTotal(weekTotal);
		setMonthlyVoucherUsersTotal(monthTotal);
		setDailyVoucherUsersTotal(dailyTotal);
	}, [voucherUsers]);

	return (
		<ParallaxScrollView
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
			</ThemedView>
			<DashboardTile
				id='todays-transactions'
				amount={dailyPurchasesTotal}
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
				amount={weeklyPurchasesTotal}
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
				amount={monthlyPurchasesTotal}
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
				amount={dailyVoucherUsersTotal}
				amountType='number'
				titleColor={dayText}
				title={translations[language].categories.dashboard.todaysVouchers}
				backgroundColor={background}
				language={language}
			/>
			<DashboardTile
				id='weeks-voucher-users'
				amount={weeklyVoucherUsersTotal}
				amountType='number'
				titleColor={weekText}
				title={translations[language].categories.dashboard.weeksVouchers}
				backgroundColor={background}
				language={language}
			/>
			<DashboardTile
				id='months-voucher-users'
				amount={monthlyVoucherUsersTotal}
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
				id='user-created-vouchers'
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
							translations[language].categories.dashboard.lastVouchers,
							{ number: 7 }
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
							id='last-seven-voucher-users-header'
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
								{translations[language].categories.dashboard.voucher}
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
								{translations[language].categories.dashboard.package}
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
								{translations[language].categories.dashboard.status}
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
								{translations[language].categories.dashboard.macAddress}
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
								{translations[language].categories.dashboard.uptime}
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
								{translations[language].categories.dashboard.bytesIn}
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
								{translations[language].categories.dashboard.bytesOut}
							</ThemedText>
						</ThemedView>
						<ScrollView
							style={{ width: '100%' }}
							showsVerticalScrollIndicator={true}
						>
							<ThemedView
								id='last-seven-voucher-users-body'
								style={{
									flexDirection: 'column',
								}}
								lightColor={backgroundLight}
								darkColor={backgroundDark}
							>
								{lastSevenVoucherUsers.map((user, index) => (
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
										lightColor={backgroundLight}
										darkColor={backgroundDark}
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
											{user.voucherCode}
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
											{user.package}
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
											{user.status}
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
											{user.macAddress}
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
											{user.uptime}
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
											{user.bytesIn}
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
											{user.bytesOut}
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
						].categories.buttons.allVoucherUsers?.toUpperCase()}
						onPress={() => router.push('/(authenticated)/vouchers')}
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
									: lastSevenDaysPurchases.map((p) => formatMMDD(p.date))),
							],
							datasets: [
								{
									data: [
										...(user?.dashboard?.chartData
											? user.dashboard.chartData.map((c) => c.total)
											: lastSevenDaysPurchases.map((p) => p.amount)),
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
						: purchasesPerRouter
					).map((router, index) => (
						<ThemedView
							key={index}
							style={{
								flexDirection: 'row',
								width: '100%',
								padding: 12,
								justifyContent: 'space-between',
								borderBottomWidth:
									index < purchasesPerRouter.length - 1 ? 1 : 0,
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
