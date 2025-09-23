import ParallaxScrollView from '@/components/ParallaxScrollView';
import Prompt from '@/components/Prompt';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import TileContainer from '@/components/TileContainer';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { fontSize, fontWeight } from '@/constants/Font';
import translations from '@/constants/Trans';
import { useGeneral } from '@/context/GeneralContext';
import { useTransaction } from '@/context/TransactionContext';
import useTrackHistory from '@/hooks/useTrackHistory';
import { NetRouter } from '@/types';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
	Animated,
	TouchableOpacity,
	useAnimatedValue,
	useColorScheme,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

export default function RoutersScreen() {
	const colorScheme = useColorScheme() ?? 'light';
	const router = useRouter();
	const { routers, setRouters, fetchRouters } = useTransaction();
	const promptFadeAnim = useAnimatedValue(0);
	const [showPrompt, setShowPrompt] = useState(false);
	const [activeRouter, setActiveRouter] = useState<string | undefined>();
	const { user, language } = useGeneral();

	// stable per-mount id to avoid duplicate handler registration during Fast Refresh
	const routerListDetailsId = useRef(
		`router-list-details-${Math.random().toString(36).slice(2)}`
	);

	const routerListId = useRef(
		`router-list-${Math.random().toString(36).slice(2)}`
	);
	const routerListHeaderId = useRef(
		`router-list-header-${Math.random().toString(36).slice(2)}`
	);

	// explicitly track this page in app history
	useTrackHistory('/(authenticated)/routers');

	useEffect(() => {
		if (user && routers.length === 0) {
			(async () => {
				await fetchRouters(user);
			})();
		}
	}, [user, routers, fetchRouters]);

	// Predefine header columns for the routers table
	const routerHeaders = [
		{ key: 'row', label: '#', width: 30 },
		{
			key: 'name',
			label: translations[language].categories.dashboard.routerName,
			width: 120,
		},
		{
			key: 'location',
			label: translations[language].categories.dashboard.location,
			width: 120,
		},
		{
			key: 'type',
			label: translations[language].categories.dashboard.type,
			width: 120,
		},
		{
			key: 'ip',
			label: translations[language].categories.dashboard.ipAddress,
			width: 120,
		},
		{
			key: 'balance',
			label: translations[language].categories.dashboard.balance,
			width: 120,
		},
		{
			key: 'actions',
			label: translations[language].categories.dashboard.actions,
			width: 120,
			textAlign: 'center' as const,
		},
	];

	const toggleShowPrompt = (v?: boolean) => {
		const value = v ?? !showPrompt;
		if (value) {
			Animated.timing(promptFadeAnim, {
				toValue: 1,
				duration: 200,
				useNativeDriver: true,
			}).start(() => setShowPrompt(true));
		} else {
			Animated.timing(promptFadeAnim, {
				toValue: 0,
				duration: 200,
				useNativeDriver: true,
			}).start(() => setShowPrompt(false));
		}
	};

	const handleAddRouter = () => {
		router.push('/routers/new');
	};

	const handleViewRouter = (routerId: string) => {
		if (!routerId) return;
		router.push(`/routers/preview/${routerId}`);
	};
	const handleEditRouter = (routerId: string) => {
		if (!routerId) return;
		router.push(`/routers/edit/${routerId}`);
	};
	const handleDeleteRouter = () => {
		// Delete router logic here
		//update state
		const updatedRouters = routers.filter((r) => r.id !== activeRouter);
		// Assuming there's a method in the context to update routers
		setRouters(updatedRouters);
		toggleShowPrompt(false);
	};

	return (
		<>
			<ParallaxScrollView
				headerBackgroundColor={{
					light: Colors.light.background,
					dark: Colors.dark.background,
				}}
				containerStyle={{ flex: 1 }}
				contentStyle={{ padding: 16 }}
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
				<ThemedView
					style={{
						width: '100%',
						paddingVertical: 16,
						alignItems: 'flex-end',
					}}
					lightColor={Colors.light.background}
					darkColor={Colors.dark.background}
				>
					<ThemedButton
						title={translations[
							language
						].categories.buttons.addRouter?.toUpperCase()}
						onPress={handleAddRouter}
						style={{
							borderRadius: 8,
							width: 150,
						}}
						darkColor={Colors['dark'].actionButton}
						lightColor={Colors['light'].actionButton}
						darkTextColor={Colors['dark'].authButtonText}
						lightTextColor={Colors['light'].authButtonText}
					/>
				</ThemedView>
				<TileContainer
					id={routerListId.current}
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
								id={routerListHeaderId.current}
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
								{routerHeaders.map((col) => (
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
								id={routerListDetailsId.current}
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
											backgroundColor:
												index % 2 === 0
													? Colors[colorScheme].listItemBackground
													: Colors[colorScheme].background,
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
											lightColor='transparent'
											darkColor='transparent'
										>
											<TouchableOpacity
												onPress={() => handleViewRouter(router?.id as string)}
											>
												<IconSymbol
													color={Colors[colorScheme].lime}
													name='eye.outline'
												/>
											</TouchableOpacity>
											<TouchableOpacity
												onPress={() => handleEditRouter(router?.id as string)}
											>
												<IconSymbol
													color={Colors[colorScheme].yellow}
													name='edit.outline'
												/>
											</TouchableOpacity>
											<TouchableOpacity
												onPress={() => {
													const r: NetRouter | undefined = routers.find(
														(r) => r.id === router?.id
													);
													if (!r) return;
													setActiveRouter(r.id);
													toggleShowPrompt(true);
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
			</ParallaxScrollView>
			<Prompt
				id='delete-router-prompt'
				fadeAnim={promptFadeAnim}
				onClose={() => toggleShowPrompt(false)}
				visible={showPrompt}
				title={translations[language].categories.dashboard.confirmDeleteTitle}
				message={translations[language].categories.routers.deleteMessage}
				buttons={[
					{
						title: translations[language].categories.buttons.cancel,
						color: Colors[colorScheme].cancelButton,
						textColor: Colors[colorScheme].white,
						action: () => toggleShowPrompt(false),
					},
					{
						title: translations[language].categories.buttons.delete,
						color: Colors[colorScheme].dangerButton,
						textColor: Colors[colorScheme].white,
						action: handleDeleteRouter,
					},
				]}
			/>
		</>
	);
}

// styles previously used for container/routerItem are no longer necessary after ParallaxScrollView refactor
