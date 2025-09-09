import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import TileContainer from '@/components/TileContainer';
import { Colors } from '@/constants/Colors';
import { fontSize, fontWeight } from '@/constants/Font';
import translations from '@/constants/Trans';
import { useGeneral } from '@/context/GeneralContext';
import { useTransaction } from '@/context/TransactionContext';
import useTrackHistory from '@/hooks/useTrackHistory';
import React, { useEffect } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

export default function TransactionsScreen() {
	useTrackHistory('/(authenticated)/transactions');
	const colorScheme = useColorScheme() ?? 'light';
	const { purchases, fetchPurchases } = useTransaction();
	const { user, language } = useGeneral();

	useEffect(() => {
		if (user && purchases.length === 0) {
			(async () => {
				await fetchPurchases(user);
			})();
		}
	}, [user, purchases, fetchPurchases]);

	return (
		<ThemedView
			lightColor={Colors.light.background}
			darkColor={Colors.dark.background}
			style={styles.container}
		>
			<TileContainer
				id='router-balances'
				backgroundColor={Colors[colorScheme].background}
				style={{
					flexDirection: 'column',
					overflow: 'hidden',
					boxSizing: 'border-box',
					height: 350,
				}}
			>
				<ThemedView
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
						{translations[language].categories.dashboard.routerBalances}
					</ThemedText>
				</ThemedView>
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
				</ThemedView>
				<ScrollView
					style={{
						flexDirection: 'column',
						borderRadius: 5,
						backgroundColor: Colors[colorScheme].background,
					}}
				>
					{purchases.map((trans, index) => (
						<ThemedView
							key={index}
							style={{
								flexDirection: 'row',
								width: '100%',
								padding: 12,
								justifyContent: 'space-between',
								borderBottomWidth: index < purchases.length - 1 ? 1 : 0,
								borderBottomColor: Colors[colorScheme].borderDark,
							}}
							lightColor={Colors.light.background}
							darkColor={Colors.dark.background}
						>
							<ThemedText
								numberOfLines={1}
								style={{ width: 150, overflow: 'hidden' }}
								lightColor={Colors.light.text}
								darkColor={Colors.dark.text}
							>
								{trans.amount}
							</ThemedText>
							<ThemedText
								style={{
									paddingHorizontal: 10,
									backgroundColor: Colors[colorScheme].bim,
									borderRadius: 50,
								}}
								lightColor={Colors.light.white}
								darkColor={Colors.dark.white}
							>
								{trans.status}
							</ThemedText>
						</ThemedView>
					))}
				</ScrollView>
			</TileContainer>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'column',
		flex: 1,
		padding: 16,
	},
	routerItem: {
		flexDirection: 'row',
		padding: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
	},
});
