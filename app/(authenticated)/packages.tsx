import { ThemedButton } from '@/components/ThemedButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import TileContainer from '@/components/TileContainer';
// colors handled via useThemeColor
import { fontSize, fontWeight } from '@/constants/Font';
import translations from '@/constants/Trans';
import { useGeneral } from '@/context/GeneralContext';
import { useTransaction } from '@/context/TransactionContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import useTrackHistory from '@/hooks/useTrackHistory';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

export default function PackagesScreen() {
	useTrackHistory('/(authenticated)/packages');
	const colorScheme = useColorScheme() ?? 'light';
	const bg = useThemeColor({}, 'background');
	const textColor = useThemeColor({}, 'text');
	const titleBg = useThemeColor({}, 'titleBg');
	const listItemBackground = useThemeColor({}, 'listItemBackground');
	const borderDark = useThemeColor({}, 'borderDark');
	const lime = useThemeColor({}, 'lime');
	const white = useThemeColor({}, 'white');
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
		<ThemedView lightColor={bg} darkColor={bg} style={styles.container}>
			<ThemedView
				style={{ flexDirection: 'column', gap: 5, marginBottom: 10 }}
				lightColor={bg}
				darkColor={bg}
			>
				<ThemedText
					lightColor={textColor}
					darkColor={textColor}
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
					lightColor={textColor}
					darkColor={textColor}
				>
					{translations[language].categories.packages.subtitle}
				</ThemedText>
			</ThemedView>

			<TileContainer
				id={packageRouterListId.current}
				backgroundColor={bg}
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
						lightColor={bg}
						darkColor={bg}
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
							lightColor={titleBg}
							darkColor={titleBg}
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
									lightColor={textColor}
									darkColor={textColor}
								>
									{col.label}
								</ThemedText>
							))}
						</ThemedView>
						<ScrollView
							id={packageRouterListDetailsId.current}
							style={{
								flexDirection: 'column',
								backgroundColor: bg,
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
										paddingHorizontal: 10,
										backgroundColor: index % 2 === 0 ? listItemBackground : bg,
										justifyContent: 'space-between',
										borderBottomWidth: index < routers.length - 1 ? 1 : 0,
										borderBottomColor: borderDark,
									}}
									lightColor={bg}
									darkColor={bg}
								>
									<ThemedText
										numberOfLines={1}
										style={{
											width: 120,
											paddingRight: 8,
											overflow: 'hidden',
										}}
										lightColor={textColor}
										darkColor={textColor}
									>
										{r.name}
									</ThemedText>
									<ThemedText
										numberOfLines={1}
										style={{
											paddingRight: 8,
											width: 120,
										}}
										lightColor={textColor}
										darkColor={textColor}
									>
										{r.location}
									</ThemedText>
									<ThemedText
										numberOfLines={1}
										style={{
											paddingRight: 8,
											width: 120,
										}}
										lightColor={textColor}
										darkColor={textColor}
									>
										{r?.networkInfo.ipv4}
									</ThemedText>
									<ThemedText
										numberOfLines={1}
										style={{
											paddingRight: 8,
											width: 120,
										}}
										lightColor={textColor}
										darkColor={textColor}
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
											lightColor={lime}
											darkColor={lime}
											darkTextColor={white}
											lightTextColor={white}
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
