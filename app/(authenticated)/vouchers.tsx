import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import TileContainer from '@/components/TileContainer';
import { fontSize, fontWeight } from '@/constants/Font';
import translations from '@/constants/Trans';
import { useGeneral } from '@/context/GeneralContext';
import { useTransaction } from '@/context/TransactionContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import useTrackHistory from '@/hooks/useTrackHistory';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef } from 'react';
import { ScrollView } from 'react-native-gesture-handler';

export default function VouchersScreen() {
	useTrackHistory('/(authenticated)/vouchers');
	// Theme helpers
	const background = useThemeColor({}, 'background');
	const backgroundLight = useThemeColor({}, 'background', 'light');
	const backgroundDark = useThemeColor({}, 'background', 'dark');
	const textLight = useThemeColor({}, 'text', 'light');
	const textDark = useThemeColor({}, 'text', 'dark');
	const titleBgLight = useThemeColor({}, 'titleBg', 'light');
	const titleBgDark = useThemeColor({}, 'titleBg', 'dark');
	const borderDark = useThemeColor({}, 'borderDark');
	const listItemBackground = useThemeColor({}, 'listItemBackground');
	const lightBlue = useThemeColor({}, 'lightBlue');
	const whiteLight = useThemeColor({}, 'white', 'light');
	const whiteDark = useThemeColor({}, 'white', 'dark');
	const router = useRouter();
	const { packages, fetchPackages, routers, } = useTransaction();
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
				await fetchPackages();
			})();
		}
	}, [user, packages, fetchPackages]);

	// Predefine header columns outside JSX for stability/consistency
	const voucherHeaders = useMemo(
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
		<ParallaxScrollView
			headerBackgroundColor={{
				light: backgroundLight,
				dark: backgroundDark,
			}}
			containerStyle={{ flex: 1 }}
			contentStyle={{ padding: 16 }}
			onRefresh={async () => {
				await fetchPackages();
			}}
		>
			<ThemedView
				style={{ flexDirection: 'column', gap: 5, marginBottom: 10 }}
				lightColor={backgroundLight}
				darkColor={backgroundDark}
			>
				<ThemedText
					lightColor={textLight}
					darkColor={textDark}
					style={{
						width: '100%',
						textTransform: 'capitalize',
						fontSize: fontSize['heading.one'],
						fontWeight: fontWeight['heading.one'],
					}}
				>
					{translations[language].categories.vouchers.title}
				</ThemedText>
				<ThemedText
					style={{
						fontSize: fontSize['text.medium'],
					}}
					lightColor={textLight}
					darkColor={textDark}
				>
					{translations[language].categories.vouchers.mainSubtitle}
				</ThemedText>
			</ThemedView>

			<TileContainer
				id={packageRouterListId.current}
				backgroundColor={background}
				style={{
					flexDirection: 'column',
					overflow: 'hidden',
					boxSizing: 'border-box',
					padding: 0,
				}}
			>
				<ScrollView
					style={{ width: '100%' }}
					horizontal
					showsHorizontalScrollIndicator={true}
				>
					<ThemedView
						style={{ flexDirection: 'column' }}
						lightColor={backgroundLight}
						darkColor={backgroundDark}
					>
						<ThemedView
							id={packageRouterListHeaderId.current}
							style={{
								flexDirection: 'row',
								justifyContent: 'space-between',
								gap: 10,
								paddingHorizontal: 10,
								paddingVertical: 10,
								borderBottomWidth: 1,
								borderBottomColor: borderDark,
							}}
							lightColor={titleBgLight}
							darkColor={titleBgDark}
						>
							{voucherHeaders.map((col) => (
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
									lightColor={textLight}
									darkColor={textDark}
								>
									{col.label}
								</ThemedText>
							))}
						</ThemedView>
						<ScrollView
							id={packageRouterListDetailsId.current}
							style={{
								flexDirection: 'column',
								backgroundColor: background,
							}}
						>
							{routers?.data?.map((r, index) => (
								<ThemedView
									key={index}
									style={{
										flexDirection: 'row',
										width: '100%',
										alignItems: 'center',
										paddingVertical: 5,
										paddingHorizontal: 10,
										backgroundColor:
											index % 2 === 0 ? listItemBackground : background,
										borderBottomWidth: !!routers?.data?.length && index < routers?.data?.length - 1 ? 1 : 0,
										borderBottomColor: borderDark,
										justifyContent: 'space-between',
									}}
									lightColor={backgroundLight}
									darkColor={backgroundDark}
								>
									<ThemedText
										numberOfLines={1}
										style={{
											width: 120,
											paddingRight: 8,
											overflow: 'hidden',
										}}
										lightColor={textLight}
										darkColor={textDark}
									>
										{r.name}
									</ThemedText>
									<ThemedText
										numberOfLines={1}
										style={{
											paddingRight: 8,
											width: 120,
										}}
										lightColor={textLight}
										darkColor={textDark}
									>
										{r.location}
									</ThemedText>
									<ThemedText
										numberOfLines={1}
										style={{
											paddingRight: 8,
											width: 120,
										}}
										lightColor={textLight}
										darkColor={textDark}
									>
										{r?.ip_address}
									</ThemedText>
									<ThemedText
										numberOfLines={1}
										style={{
											paddingRight: 8,
											width: 120,
										}}
										lightColor={textLight}
										darkColor={textDark}
									>
										{r.router_user}
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
											onPress={() => router.push(`/routers/vouchers/${r.id}`)}
											lightColor={lightBlue}
											darkColor={lightBlue}
											darkTextColor={whiteDark}
											lightTextColor={whiteLight}
											style={{ flex: 1 }}
										/>
									</ThemedView>
								</ThemedView>
							))}
						</ScrollView>
					</ThemedView>
				</ScrollView>
			</TileContainer>
		</ParallaxScrollView>
	);
}
