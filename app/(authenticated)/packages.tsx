import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import TileContainer from '@/components/TileContainer';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { fontSize, fontWeight } from '@/constants/Font';
import translations from '@/constants/Trans';
import { useGeneral } from '@/context/GeneralContext';
import { useTransaction } from '@/context/TransactionContext';
import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

export default function PackagesScreen() {
	const colorScheme = useColorScheme() ?? 'light';
	const { packages, fetchPackages, routers } = useTransaction();
	const { user, language } = useGeneral();

	useEffect(() => {
		if (user && packages.length === 0) {
			(async () => {
				await fetchPackages(user);
			})();
		}
	}, [user, packages, fetchPackages]);

	return (
		<ThemedView
			lightColor={Colors.light.background}
			darkColor={Colors.dark.background}
			style={styles.container}
		>
			<ThemedView
				lightColor={Colors.light.background}
				darkColor={Colors.dark.background}
			>
				<ThemedText
					lightColor={Colors.light.bim}
					darkColor={Colors.dark.bim}
					style={{
						width: '100%',
						textTransform: 'capitalize',
						fontSize: fontSize['heading.one'],
						fontWeight: fontWeight['heading.one'],
					}}
				>
					{translations[language].categories.routers.title}
				</ThemedText>
			</ThemedView>
			<TileContainer
				id='package-router-list'
				backgroundColor={Colors[colorScheme].background}
				style={{
					flexDirection: 'column',
					overflow: 'hidden',
					boxSizing: 'border-box',
				}}
			>
				<ScrollView
					style={{ width: '100%' }}
					horizontal
					showsHorizontalScrollIndicator={true}
				>
					<ThemedView
						style={{ flexDirection: 'column' }}
						lightColor={Colors.light.background}
						darkColor={Colors.dark.background}
					>
						<ThemedView
							id='package-router-list-header'
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
									width: 120,
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
									width: 120,
									textTransform: 'uppercase',
									paddingRight: 8,
								}}
								lightColor={Colors.light.text}
								darkColor={Colors.dark.text}
							>
								{translations[language].categories.dashboard.location}
							</ThemedText>
							<ThemedText
								numberOfLines={1}
								ellipsizeMode='tail'
								style={{
									fontSize: fontSize['text.medium'],
									width: 120,
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
									width: 120,
									textTransform: 'uppercase',
									paddingRight: 8,
								}}
								lightColor={Colors.light.text}
								darkColor={Colors.dark.text}
							>
								{translations[language].categories.dashboard.ipAddress}
							</ThemedText>
							<ThemedText
								numberOfLines={1}
								ellipsizeMode='tail'
								style={{
									fontSize: fontSize['text.medium'],
									width: 120,
									textTransform: 'uppercase',
									paddingRight: 8,
								}}
								lightColor={Colors.light.text}
								darkColor={Colors.dark.text}
							>
								{translations[language].categories.dashboard.balance}
							</ThemedText>
							<ThemedText
								numberOfLines={1}
								ellipsizeMode='tail'
								style={{
									fontSize: fontSize['text.medium'],
									width: 120,
									textTransform: 'uppercase',
									textAlign: 'center',
								}}
								lightColor={Colors.light.text}
								darkColor={Colors.dark.text}
							>
								{translations[language].categories.dashboard.actions}
							</ThemedText>
						</ThemedView>
						<ScrollView
							id='package-router-list-details'
							style={{
								flexDirection: 'column',
								backgroundColor: Colors[colorScheme].background,
							}}
						>
							{routers.map((router, index) => (
								<ThemedView
									key={index}
									style={{
										flexDirection: 'row',
										width: '100%',
										paddingVertical: 12,
										gap: 10,
										paddingHorizontal: 5,
										justifyContent: 'space-between',
										borderBottomWidth: index < routers.length - 1 ? 1 : 0,
										borderBottomColor: Colors[colorScheme].borderDark,
									}}
									lightColor={Colors.light.background}
									darkColor={Colors.dark.background}
								>
									<ThemedText
										numberOfLines={1}
										style={{
											width: 30,
											overflow: 'hidden',
											paddingRight: 8,
										}}
										lightColor={Colors.light.text}
										darkColor={Colors.dark.text}
									>
										{index + 1}
									</ThemedText>
									<ThemedText
										numberOfLines={1}
										style={{
											width: 120,
											paddingRight: 8,
											overflow: 'hidden',
										}}
										lightColor={Colors.light.text}
										darkColor={Colors.dark.text}
									>
										{router.name}
									</ThemedText>
									<ThemedText
										numberOfLines={1}
										style={{
											paddingRight: 8,
											width: 120,
										}}
										lightColor={Colors.light.text}
										darkColor={Colors.dark.text}
									>
										{router.location}
									</ThemedText>
									<ThemedText
										numberOfLines={1}
										style={{
											paddingRight: 8,
											width: 120,
										}}
										lightColor={Colors.light.text}
										darkColor={Colors.dark.text}
									>
										{router.type}
									</ThemedText>
									<ThemedText
										numberOfLines={1}
										style={{
											paddingRight: 8,
											width: 120,
										}}
										lightColor={Colors.light.text}
										darkColor={Colors.dark.text}
									>
										{router?.networkInfo.ipv4}
									</ThemedText>
									<ThemedText
										numberOfLines={1}
										style={{
											paddingRight: 8,
											width: 120,
										}}
										lightColor={Colors.light.text}
										darkColor={Colors.dark.text}
									>
										{router.transactionBalance}
									</ThemedText>
									<ThemedView
										style={{
											flexDirection: 'row',
											justifyContent: 'space-between',
											gap: 5,
											width: 120,
										}}
										lightColor={Colors.light.background}
										darkColor={Colors.dark.background}
									>
										<TouchableOpacity onPress={() => {}}>
											<IconSymbol
												color={Colors[colorScheme].lime}
												name='eye.outline'
											/>
										</TouchableOpacity>
										<TouchableOpacity onPress={() => {}}>
											<IconSymbol
												color={Colors[colorScheme].yellow}
												name='edit.outline'
											/>
										</TouchableOpacity>
										<TouchableOpacity
											onPress={() => {
												// setActiveRouter(router.id);
											}}
										>
											<IconSymbol
												color={Colors[colorScheme].error}
												name='delete.outline'
											/>
										</TouchableOpacity>
									</ThemedView>
								</ThemedView>
							))}
						</ScrollView>
					</ThemedView>
				</ScrollView>
			</TileContainer>
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
