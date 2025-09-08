import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useGeneral } from '@/context/GeneralContext';
import { useTransaction } from '@/context/TransactionContext';
import React, { useEffect } from 'react';
import { FlatList, StyleSheet } from 'react-native';

export default function VouchersScreen() {
	const { voucherUsers, fetchPurchases } = useTransaction();
	const { user } = useGeneral();

	useEffect(() => {
		if (user && voucherUsers.length === 0) {
			(async () => {
				await fetchPurchases(user);
			})();
		}
	}, [user, voucherUsers, fetchPurchases]);

	return (
		<ThemedView
			lightColor={Colors.light.background}
			darkColor={Colors.dark.background}
			style={styles.container}
		>
			<FlatList
				data={voucherUsers}
				keyExtractor={(item) => item.voucherCode?.toString() ?? ''}
				renderItem={({ item }) => (
					<ThemedView
						lightColor={Colors.light.background}
						darkColor={Colors.dark.background}
						style={styles.routerItem}
					>
						<ThemedText
							lightColor={Colors.light.text}
							darkColor={Colors.dark.text}
						>
							{item.voucherCode}
						</ThemedText>
						<ThemedText
							lightColor={Colors.light.text}
							darkColor={Colors.dark.text}
						>
							{item.comment}
						</ThemedText>
					</ThemedView>
				)}
			/>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
	},
	routerItem: {
		padding: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
	},
});
