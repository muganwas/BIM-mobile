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
import { useThemeColor } from '@/hooks/useThemeColor';
import useTrackHistory from '@/hooks/useTrackHistory';
import { ApiRouter } from '@/types';
import RouterOverlay from '@/views/Router';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	Animated,
	TouchableOpacity,
	useAnimatedValue,
	useColorScheme,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { formatAmount } from '../../helpers/index';

export default function RoutersScreen() {
	const colorScheme = useColorScheme() ?? 'light';

	const bg = useThemeColor({}, 'background');
	const bimColor = useThemeColor({}, 'bim');
	const titleBg = useThemeColor({}, 'titleBg');
	const textColor = useThemeColor({}, 'text');
	const actionButton = useThemeColor({}, 'actionButton');
	const authButtonText = useThemeColor({}, 'authButtonText');
	const lime = useThemeColor({}, 'lime');
	const yellow = useThemeColor({}, 'yellow');
	const errorColor = useThemeColor({}, 'error');
	const borderDark = useThemeColor({}, 'borderDark');
	const listItemBackground = useThemeColor({}, 'listItemBackground');
	// borderColor unused; Colors[colorScheme] is used directly where needed
	const router = useRouter();
	const { routers, setRoutersResponse, fetchRouters } = useTransaction();
	const promptFadeAnim = useAnimatedValue(0);
	const [showPrompt, setShowPrompt] = useState(false);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [editRouterId, setEditRouterId] = useState<string | undefined>();
	const [activeRouter, setActiveRouter] = useState<string | undefined>();
	const { language } = useGeneral();

	// compute initial values for edit modal when a router is selected
	const editInitial = useMemo(() => {
		if (!editRouterId || routers?.data) return undefined;
		const r = routers?.data.find((x) => x.id === editRouterId);
		return r
			? {
				name: r.name,
				location: r.location,
				type: r.type,
				ipAddress: r.ip_address,
				username: r.router_user,
				password: r.router_password,
			}
			: undefined;
	}, [routers, editRouterId]);
	console.log({ router: routers?.data[0]?.id })

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
		if (!routers) {
			(async () => {
				await fetchRouters();
			})();
		}
	}, [routers, fetchRouters]);

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
		setShowCreateModal(true);
	};

	const handleViewRouter = (netRouter: ApiRouter) => {
		if (!netRouter.id) return;
		router.push({ pathname: '/routers/preview/[routerId]', params: { ...netRouter, routerId: netRouter.id } });
	};
	const handleEditRouter = (routerId: string) => {
		if (!routerId) return;
		setEditRouterId(routerId);
		setShowEditModal(true);
	};
	const handleDeleteRouter = () => {
		// Delete router logic here
		if (!routers?.data) return;
		//update state
		const updatedRouters = routers.data.filter(
			(r) => r.id !== activeRouter
		);
		// Assuming there's a method in the context to update routers
		setRoutersResponse({
			routers: {
				...routers,
				data: updatedRouters
			},
			message: 'Router deleted successfully',
		});
		toggleShowPrompt(false);
	};

	const routersList = routers?.data || [];

	const [refreshing, setRefreshing] = useState(false);

	const handleRefresh = useCallback(async () => {
		setRefreshing(true);
		try {
			await fetchRouters();
		} catch (e) {
			console.error('[RoutersScreen] refresh failed', e);
		} finally {
			setRefreshing(false);
		}
	}, [fetchRouters]);

	return (
		<>
			<ParallaxScrollView
				headerBackgroundColor={{
					light: bg,
					dark: bg,
				}}
				containerStyle={{ flex: 1 }}
				onRefresh={handleRefresh}
				refreshing={refreshing}
			>
				<ThemedView lightColor={bg} darkColor={bg}>
					<ThemedText
						lightColor={bimColor}
						darkColor={bimColor}
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
					lightColor={bg}
					darkColor={bg}
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
						darkColor={actionButton}
						lightColor={actionButton}
						darkTextColor={authButtonText}
						lightTextColor={authButtonText}
					/>
				</ThemedView>
				<TileContainer
					id={routerListId.current}
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
								id={routerListHeaderId.current}
								style={{
									flexDirection: 'row',
									justifyContent: 'space-between',
									gap: 10,
									paddingHorizontal: 10,
									paddingVertical: 10,
									borderBottomWidth: 1,
									borderBottomColor: Colors[colorScheme].borderDark,
								}}
								lightColor={titleBg}
								darkColor={titleBg}
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
										lightColor={textColor}
										darkColor={textColor}
									>
										{col.label}
									</ThemedText>
								))}
							</ThemedView>
							<ScrollView
								id={routerListDetailsId.current}
								style={{
									flexDirection: 'column',
									backgroundColor: bg,
								}}
							>
								{routersList.map((router, index) => (
									<ThemedView
										key={index}
										style={{
											flexDirection: 'row',
											width: '100%',
											paddingVertical: 12,
											gap: 10,
											paddingHorizontal: 10,
											justifyContent: 'space-between',
											backgroundColor:
												index % 2 === 0 ? listItemBackground : bg,
											borderBottomWidth: index < routersList.length - 1 ? 1 : 0,
											borderBottomColor: borderDark,
										}}
										lightColor={bg}
										darkColor={bg}
									>
										<ThemedText
											numberOfLines={1}
											style={{
												width: 30,
												overflow: 'hidden',
												paddingRight: 8,
											}}
											lightColor={textColor}
											darkColor={textColor}
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
											lightColor={textColor}
											darkColor={textColor}
										>
											{router.name}
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
											{router.location}
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
											{router.type}
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
											{router.ip_address}
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
											{formatAmount(router.balance)}
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
												onPress={() => handleViewRouter(router)}
											>
												<IconSymbol color={lime} name='eye.outline' />
											</TouchableOpacity>
											<TouchableOpacity
												onPress={() => handleEditRouter(router?.id as string)}
											>
												<IconSymbol color={yellow} name='edit.outline' />
											</TouchableOpacity>
											<TouchableOpacity
												onPress={() => {
													const r = routersList.find(
														(r) => r.id === router?.id
													);
													if (!r) return;
													setActiveRouter(r.id);
													toggleShowPrompt(true);
												}}
											>
												<IconSymbol color={errorColor} name='delete.outline' />
											</TouchableOpacity>
										</ThemedView>
									</ThemedView>
								))}
							</ScrollView>
						</ThemedView>
					</ScrollView>
				</TileContainer>
			</ParallaxScrollView>
			{/* Add Router Modal */}
			<RouterOverlay
				visible={showCreateModal}
				mode='add'
				onCancel={() => setShowCreateModal(false)}
				onBack={() => setShowCreateModal(false)}
				onSubmit={({ name, location, type, ipAddress, username, password }) => {
					// NOTE: This local update is temporary. In a real app, we'd refetch or optimistically update properly.
					// Since we are using ApiRouter structure, we need to match it.
					// For now, I'll just refetch to keep it simple and correct.
					fetchRouters();
					setShowCreateModal(false);
				}}
			/>

			{/* Edit Router Modal */}
			{editRouterId && (
				<RouterOverlay
					visible={showEditModal}
					mode='edit'
					initial={editInitial}
					onCancel={() => {
						setShowEditModal(false);
						setEditRouterId(undefined);
					}}
					onBack={() => {
						setShowEditModal(false);
						setEditRouterId(undefined);
					}}
					onSubmit={({
						name,
						location,
						type,
						ipAddress,
						username,
						password,
					}) => {
						if (!editRouterId || !routers) return;

						// Optimistic update for ApiRouter structure
						const updatedData = routers?.data.map((r) =>
							r.id === editRouterId
								? {
									...r,
									name,
									location,
									type,
									router_user: username,
									router_password: password,
									ip_address: ipAddress,
									updated_at: new Date().toISOString(),
								}
								: r
						);

						setRoutersResponse({
							routers: {
								...routers,
								data: updatedData
							},
							message: 'Router updated successfully',
						});

						setShowEditModal(false);
						setEditRouterId(undefined);
					}}
				/>
			)}
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
