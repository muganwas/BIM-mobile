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
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

export default function PackagesScreen() {
	useTrackHistory('/(authenticated)/packages');
	const colorScheme = useColorScheme() ?? 'light';
	const router = useRouter();
	const { packages, fetchPackages, routers } = useTransaction();
	const { user, language } = useGeneral();

	// stable per-mount id to avoid duplicate handler registration during Fast Refresh
	const packageRouterListDetailsId = useRef(
		`package-router-list-details-${Math.random().toString(36).slice(2)}`
	);

	const packageRouterListId = useRef(
		`package-router-list-${Math.random().toString(36).slice(2)}`
	);
	const packageRouterListHeaderId = useRef(
		`package-router-list-header-${Math.random().toString(36).slice(2)}`
	);

	useEffect(() => {
		if (user && packages.length === 0) {
			(async () => {
				await fetchPackages(user);
			})();
		}
	}, [user, packages, fetchPackages]);

	// Predefine header columns outside JSX for stability/consistency
	const packageHeaders = useMemo(
		() => [
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
				key: 'username',
				label: translations[language].categories.dashboard.routerUsername,
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
					{translations[language].categories.packages.title}
				</ThemedText>
				<ThemedText
					style={{
						fontSize: fontSize['text.medium'],
					}}
					lightColor={Colors.light.text}
					darkColor={Colors.dark.text}
				>
					{translations[language].categories.packages.subtitle}
				</ThemedText>
			</ThemedView>

			<TileContainer
				id={packageRouterListId.current}
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
							id={packageRouterListHeaderId.current}
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
							{packageHeaders.map((col) => (
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
							id={packageRouterListDetailsId.current}
							style={{
								flexDirection: 'column',
								backgroundColor: Colors[colorScheme].background,
							}}
						>
							{routers.map((r, index) => (
								<ThemedView
									key={index}
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
										style={{
											width: 120,
											paddingRight: 8,
											overflow: 'hidden',
										}}
										lightColor={Colors.light.text}
										darkColor={Colors.dark.text}
									>
										{r.name}
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
										{r.location}
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
										{r?.networkInfo.ipv4}
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
										{r.username}
									</ThemedText>
									<ThemedView
										style={{
											flexDirection: 'row',
											justifyContent: 'space-between',
											width: 120,
										}}
										lightColor='transparent'
										darkColor='transparent'
									>
										<ThemedButton
											title={translations[
												language
											].categories.buttons.hotspots.toUpperCase()}
											onPress={() => router.push(`/routers/hotspots/${r.id}`)}
											lightColor={Colors.light.lime}
											darkColor={Colors.dark.lime}
											darkTextColor={Colors.dark.white}
											lightTextColor={Colors.light.white}
											style={{ flex: 1 }}
										/>
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
