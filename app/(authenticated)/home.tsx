import { GestureResponderEvent, StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import translations from '@/constants/Trans';
import { useGeneral } from '@/context/GeneralContext';
import { useTransaction } from '@/context/TransactionContext';
import { MicroTransaction } from '@/types';
import { useEffect, useState } from 'react';
import { Colors } from 'react-native/Libraries/NewAppScreen';

export default function HomeScreen() {
	const { setSelectedOption, language } = useGeneral();
	const { purchases } = useTransaction();
	const [todaysTransactions, setTodaysTransactions] = useState<
		MicroTransaction[]
	>([]);

	useEffect(() => {
		const today = new Date();
		const filteredTransactions = purchases.filter((purchase) => {
			const transactionDate = new Date(purchase.date);
			return (
				transactionDate.getDate() === today.getDate() &&
				transactionDate.getMonth() === today.getMonth() &&
				transactionDate.getFullYear() === today.getFullYear()
			);
		});
		setTodaysTransactions(filteredTransactions);
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
					lightColor='#000'
					darkColor='#fff'
					style={{ fontSize: 24, fontWeight: 'bold' }}
				>
					{translations[language].categories.dashboard.title}
				</ThemedText>
			</ThemedView>
			<ThemedView
				id='todays-transactions'
				style={styles.transactionContainer}
				lightColor={Colors.light.dayTransactionsBackground}
				darkColor={Colors.dark.dayTransactionsBackground}
			>
				<ThemedView>
					<IconSymbol
						name='cash'
						size={24}
						color={Colors.light.tint}
						style={{ marginBottom: 10 }}
					/>
				</ThemedView>
				<ThemedView>
					<ThemedText
						lightColor={Colors.light.text}
						darkColor={Colors.dark.text}
						style={{ fontSize: 18, marginBottom: 10 }}
					>
						{translations[language].categories.dashboard.todaysTransactions}
					</ThemedText>
					<ThemedText></ThemedText>
				</ThemedView>
			</ThemedView>
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
		backgroundColor: '#fff',
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
		borderRadius: 8,
		backgroundColor: '#f9f9f9',
		marginBottom: 8,
		borderWidth: 1,
		borderColor: '#ddd',
	},
});
