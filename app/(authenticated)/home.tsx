import {
	GestureResponderEvent,
	StyleSheet,
	useColorScheme,
} from 'react-native';

import DashboardTile from '@/components/DashboardTile';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import translations from '@/constants/Trans';
import { useGeneral } from '@/context/GeneralContext';
import { useTransaction } from '@/context/TransactionContext';
import { useEffect, useState } from 'react';

export default function HomeScreen() {
	const { setSelectedOption, language } = useGeneral();
	const colorScheme = useColorScheme() ?? 'light'; // Default to light mode if color scheme is not set
	const { purchases } = useTransaction();
	const [purchaseTotal, setPurchaseTotal] = useState(0);
	const [dailyPurchasesTotal, setDailyPurchasesTotal] = useState(0);
	const [weeklyPurchasesTotal, setWeeklyPurchasesTotal] = useState(0);
	const [monthlyPurchasesTotal, setMonthlyPurchasesTotal] = useState(0);

	useEffect(() => {
		if (!purchases || purchases.length === 0) {
			setPurchaseTotal(0);
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
			const purchaseDate = new Date(purchase.date);
			return purchaseDate >= startOfWeek && purchaseDate <= today;
		});
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
		setWeeklyPurchasesTotal(weekTotal);
		setMonthlyPurchasesTotal(monthTotal);
		setDailyPurchasesTotal(dailyTotal);
		// Calculate the total of all purchases
		const total = purchases.reduce((acc, purchase) => acc + purchase.amount, 0);
		setPurchaseTotal(total);
	}, [purchases]);

	return (
		<ParallaxScrollView
			headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
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
				iconColor={'#ffffff'}
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
				iconColor={'#ffffff'}
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
				iconColor={'#ffffff'}
				titleColor={Colors[colorScheme].monthText}
				iconBackgroundColor={Colors[colorScheme].monthIconBackground}
				backgroundColor={Colors[colorScheme].monthTransactionsBackground}
				iconSize={30}
				language={language}
			/>
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
