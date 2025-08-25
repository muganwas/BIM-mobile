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
import { Colors } from '@/constants/Colors';
import { fontSize, fontWeight } from '@/constants/Font';
import translations from '@/constants/Trans';
import { useGeneral } from '@/context/GeneralContext';
import { useTransaction } from '@/context/TransactionContext';
import { formatMMDD, translateWithVariables } from '@/helpers';
import { dayPurchase, MicroTransaction, VoucherUser } from '@/types';
import { useEffect, useState } from 'react';
import { BarChart } from 'react-native-chart-kit';
import { ScrollView } from 'react-native-gesture-handler';

export default function HomeScreen() {
	const { setSelectedOption, language } = useGeneral();
	const width = Dimensions.get('window').width;
	const colorScheme = useColorScheme() ?? 'light'; // Default to light mode if color scheme is not set
	const { purchases, voucherUsers } = useTransaction();
	const [dailyPurchasesTotal, setDailyPurchasesTotal] = useState(0);
	const [weeklyPurchasesTotal, setWeeklyPurchasesTotal] = useState(0);
	const [weeklyPurchasesPerDay, setWeeklyPurchasesPerDay] = useState<
		dayPurchase[]
	>([]);
	const [monthlyPurchasesTotal, setMonthlyPurchasesTotal] = useState(0);
	const [dailyVoucherUsersTotal, setDailyVoucherUsersTotal] = useState(0);
	const [weeklyVoucherUsersTotal, setWeeklyVoucherUsersTotal] = useState(0);
	const [monthlyVoucherUsersTotal, setMonthlyVoucherUsersTotal] = useState(0);
	const [lastSevenVoucherUsers, setLastSevenVoucherUsers] = useState<
		VoucherUser[]
	>([]);
	const [lastFiveTransactions, setLastFiveTransactions] = useState<
		MicroTransaction[]
	>([]);

	useEffect(() => {
		if (!purchases || purchases.length === 0) {
			setLastFiveTransactions([]);
			setDailyPurchasesTotal(0);
			setWeeklyPurchasesTotal(0);
			setMonthlyPurchasesTotal(0);
			return;
		}
		// Calculate the total of today's purchases
		const today = new Date();
		const todayPurchases = purchases.filter((purchase) => {
			const purchaseDate = new Date(purchase.date);
			return (
				purchaseDate.getDate() === today.getDate() &&
				purchaseDate.getMonth() === today.getMonth() &&
				purchaseDate.getFullYear() === today.getFullYear()
			);
		});
		const dailyTotal = todayPurchases.reduce(
			(acc, purchase) => acc + purchase.amount,
			0
		);
		// calculate the total of this week's purchases
		const startOfWeek = new Date(today);
		startOfWeek.setDate(today.getDate() - today.getDay()); // Set to the start of the week (Sunday)
		const weekPurchases = purchases.filter((purchase) => {
			const purchaseDate = new Date(purchase.date).getDate();
			return (
				purchaseDate >= startOfWeek.getDate() && purchaseDate <= today.getDate()
			);
		});
		console.log({ weekPurchases });
		const sortedWeekPurchases = weekPurchases.sort((a, b) => {
			return new Date(a.date).getTime() - new Date(b.date).getTime();
		});
		const lastSevenDates = Array.from({ length: 7 }, (_, i) => {
			const date = new Date();
			date.setDate(date.getDate() - i);
			return date;
		}).reverse();
		const weekPurchasesPerDayTemp: dayPurchase[] = [];
		lastSevenDates.forEach((date) => {
			const key = date;
			const purchase = sortedWeekPurchases.find((p, k) => {
				return (
					new Date(p.date).toLocaleDateString() === key.toLocaleDateString()
				);
			});
			if (!purchase) {
				weekPurchasesPerDayTemp.push({
					date: new Date(key),
					day: new Date(key).toLocaleDateString('en-US', {
						weekday: 'long',
					}),
					amount: 0,
				});
				return;
			}
			const existing = weekPurchasesPerDayTemp.find(
				(p) => p.date.getDate() === key.getDate()
			);
			if (existing) {
				existing.amount += purchase.amount;
			} else {
				weekPurchasesPerDayTemp.push({
					date: purchase?.date as Date,
					day: new Date(purchase?.date).toLocaleDateString('en-US', {
						weekday: 'long',
					}),
					amount: purchase?.amount as number,
				});
			}
		});
		setWeeklyPurchasesPerDay(weekPurchasesPerDayTemp);
		const weekTotal = weekPurchases.reduce(
			(acc, purchase) => acc + purchase.amount,
			0
		);
		// calculate the total of this month's purchases
		const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
		const monthPurchases = purchases.filter((purchase) => {
			const purchaseDate = new Date(purchase.date);
			return purchaseDate >= startOfMonth && purchaseDate <= today;
		});
		const monthTotal = monthPurchases.reduce(
			(acc, purchase) => acc + purchase.amount,
			0
		);
		// Get the last five transactions
		const sortedPurchases = [...purchases].sort((a, b) => {
			return new Date(b.date).getTime() - new Date(a.date).getTime();
		});
		setLastFiveTransactions(sortedPurchases.slice(0, 5));
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
		// Calculate the total of today's voucher users
		const today = new Date();
		const todayVoucherUsers = voucherUsers.filter((user) => {
			const userDate = new Date(user.createdAt);
			return (
				userDate.getDate() === today.getDate() &&
				userDate.getMonth() === today.getMonth() &&
				userDate.getFullYear() === today.getFullYear()
			);
		});
		const dailyTotal = todayVoucherUsers.length;
		// calculate the total of this week's voucher users
		const startOfWeek = new Date(today);
		startOfWeek.setDate(today.getDate() - today.getDay()); // Set to the start of the week (Sunday)
		const weekVoucherUsers = voucherUsers.filter((user) => {
			const userDate = new Date(user.createdAt).getDate();
			return userDate >= startOfWeek.getDate() && userDate <= today.getDate();
		});
		const weekTotal = weekVoucherUsers.length;
		// calculate the total of this month's voucher users
		const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
		const monthVoucherUsers = voucherUsers.filter((user) => {
			const userDate = new Date(user.createdAt).getDate();
			return userDate >= startOfMonth.getDate() && userDate <= today.getDate();
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
				light: Colors.light.background,
				dark: Colors.dark.background,
			}}
			contentStyle={{ paddingHorizontal: 10 }}
			onTouchStart={(e: GestureResponderEvent) => {
				e.stopPropagation(); // Prevent touch events from propagating to the drawer
				setSelectedOption(undefined);
			}}
		>
			<ThemedView style={styles.titleContainer}>
				<ThemedText
					lightColor={Colors.light.screenTitleText}
					darkColor={Colors.dark.screenTitleText}
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
				iconColor={Colors[colorScheme].iconTint}
				titleColor={Colors[colorScheme].dayText}
				iconBackgroundColor={Colors[colorScheme].dayIconBackground}
				backgroundColor={Colors[colorScheme].dayTransactionsBackground}
				iconSize={30}
				language={language}
			/>
			<DashboardTile
				id='weeks-transactions'
				amount={weeklyPurchasesTotal}
				title={translations[language].categories.dashboard.weeksTransactions}
				iconName='calendar'
				iconColor={Colors[colorScheme].iconTint}
				titleColor={Colors[colorScheme].weekText}
				iconBackgroundColor={Colors[colorScheme].weekIconBackground}
				backgroundColor={Colors[colorScheme].weekTransactionsBackground}
				iconSize={30}
				language={language}
			/>
			<DashboardTile
				id='months-transactions'
				amount={monthlyPurchasesTotal}
				title={translations[language].categories.dashboard.monthsTransactions}
				iconName='monthlyCalendar'
				iconColor={Colors[colorScheme].iconTint}
				titleColor={Colors[colorScheme].monthText}
				iconBackgroundColor={Colors[colorScheme].monthIconBackground}
				backgroundColor={Colors[colorScheme].monthTransactionsBackground}
				iconSize={30}
				language={language}
			/>
			<DashboardTile
				id='days-voucher-users'
				amount={dailyVoucherUsersTotal}
				amountType='number'
				titleColor={Colors[colorScheme].dayText}
				title={translations[language].categories.dashboard.todaysVouchers}
				backgroundColor={Colors[colorScheme].background}
				language={language}
			/>
			<DashboardTile
				id='weeks-voucher-users'
				amount={weeklyVoucherUsersTotal}
				amountType='number'
				titleColor={Colors[colorScheme].weekText}
				title={translations[language].categories.dashboard.weeksVouchers}
				backgroundColor={Colors[colorScheme].background}
				language={language}
			/>
			<DashboardTile
				id='months-voucher-users'
				amount={monthlyVoucherUsersTotal}
				amountType='number'
				titleColor={Colors[colorScheme].monthText}
				title={translations[language].categories.dashboard.monthsVouchers}
				backgroundColor={Colors[colorScheme].background}
				language={language}
			/>
			<TileContainer
				id='last-five-transactions'
				backgroundColor={Colors[colorScheme].background}
				style={{
					flexDirection: 'column',
				}}
			>
				<ThemedView
					style={{ flex: 1 }}
					lightColor={Colors.light.background}
					darkColor={Colors.dark.background}
				>
					<ThemedText
						lightColor={Colors.light.screenTitleText}
						darkColor={Colors.dark.screenTitleText}
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
						lightColor={Colors.light.background}
						darkColor={Colors.dark.background}
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
								borderBottomColor: Colors[colorScheme].borderDark,
							}}
							lightColor={Colors.light.background}
							darkColor={Colors.dark.background}
						>
							<ThemedText
								style={{ width: 30 }}
								lightColor={Colors.light.text}
								darkColor={Colors.dark.text}
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
								lightColor={Colors.light.text}
								darkColor={Colors.dark.text}
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
								lightColor={Colors.light.text}
								darkColor={Colors.dark.text}
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
								lightColor={Colors.light.text}
								darkColor={Colors.dark.text}
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
								lightColor={Colors.light.text}
								darkColor={Colors.dark.text}
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
								lightColor={Colors.light.text}
								darkColor={Colors.dark.text}
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
								lightColor={Colors.light.background}
								darkColor={Colors.dark.background}
							>
								{lastFiveTransactions.map((transaction, index) => (
									<ThemedView
										key={index}
										style={{
											flexDirection: 'row',
											justifyContent: 'space-between',
											gap: 10,
											paddingHorizontal: 5,
											paddingVertical: 10,
											borderBottomWidth: 1,
											borderBottomColor: Colors[colorScheme].borderDark,
										}}
										lightColor={Colors.light.background}
										darkColor={Colors.dark.background}
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
					lightColor={Colors.light.background}
					darkColor={Colors.dark.background}
				>
					<ThemedButton
						title={translations[
							language
						].categories.buttons.allTransactions?.toUpperCase()}
						onPress={() => {}}
						style={{
							borderRadius: 8,
						}}
						darkColor={Colors['dark'].bim}
						lightColor={Colors['light'].bim}
						darkTextColor={Colors['dark'].authButtonText}
						lightTextColor={Colors['light'].authButtonText}
					/>
				</ThemedView>
			</TileContainer>
			<TileContainer
				id='user-created-vouchers'
				backgroundColor={Colors[colorScheme].background}
				style={{
					flexDirection: 'column',
				}}
			>
				<ThemedView
					style={{ flex: 1 }}
					lightColor={Colors.light.background}
					darkColor={Colors.dark.background}
				>
					<ThemedText
						lightColor={Colors.light.screenTitleText}
						darkColor={Colors.dark.screenTitleText}
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
						lightColor={Colors.light.background}
						darkColor={Colors.dark.background}
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
								borderBottomColor: Colors[colorScheme].borderDark,
							}}
							lightColor={Colors.light.background}
							darkColor={Colors.dark.background}
						>
							<ThemedText
								style={{ width: 30 }}
								lightColor={Colors.light.text}
								darkColor={Colors.dark.text}
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
								lightColor={Colors.light.text}
								darkColor={Colors.dark.text}
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
								lightColor={Colors.light.text}
								darkColor={Colors.dark.text}
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
								lightColor={Colors.light.text}
								darkColor={Colors.dark.text}
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
								lightColor={Colors.light.text}
								darkColor={Colors.dark.text}
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
								lightColor={Colors.light.text}
								darkColor={Colors.dark.text}
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
								lightColor={Colors.light.text}
								darkColor={Colors.dark.text}
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
								lightColor={Colors.light.text}
								darkColor={Colors.dark.text}
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
								lightColor={Colors.light.background}
								darkColor={Colors.dark.background}
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
											borderBottomColor: Colors[colorScheme].borderDark,
										}}
										lightColor={Colors.light.background}
										darkColor={Colors.dark.background}
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
					lightColor={Colors.light.background}
					darkColor={Colors.dark.background}
				>
					<ThemedButton
						title={translations[
							language
						].categories.buttons.allVoucherUsers?.toUpperCase()}
						onPress={() => {}}
						style={{
							borderRadius: 8,
						}}
						darkColor={Colors['dark'].bim}
						lightColor={Colors['light'].bim}
						darkTextColor={Colors['dark'].authButtonText}
						lightTextColor={Colors['light'].authButtonText}
					/>
				</ThemedView>
			</TileContainer>
			<TileContainer
				id='transaction-volume-chart'
				backgroundColor={Colors[colorScheme].background}
				style={{ flexDirection: 'column', overflow: 'hidden' }}
			>
				<ThemedView
					style={{ flex: 1 }}
					lightColor={Colors.light.background}
					darkColor={Colors.dark.background}
				>
					<ThemedText
						lightColor={Colors.light.screenTitleText}
						darkColor={Colors.dark.screenTitleText}
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
					lightColor={Colors.light.background}
					darkColor={Colors.dark.background}
					style={{
						position: 'relative',
					}}
				>
					<BarChart
						data={{
							labels: [...weeklyPurchasesPerDay.map((p) => formatMMDD(p.date))],
							datasets: [
								{ data: [...weeklyPurchasesPerDay.map((p) => p.amount)] },
							],
						}}
						width={width - 30}
						height={220}
						yAxisSuffix=''
						yAxisLabel=''
						chartConfig={{
							backgroundGradientFrom: Colors[colorScheme].background,
							backgroundGradientTo: Colors[colorScheme].background,
							decimalPlaces: 0,
							color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
							labelColor: (opacity = 1) => `rgba(0,0,0, ${opacity})`,
						}}
						style={{ marginVertical: 8, borderRadius: 8, left: -20 }}
					/>
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
