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
import { NetRouter } from '@/types';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
	Animated,
	StyleSheet,
	TouchableOpacity,
	useAnimatedValue,
	useColorScheme,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

export default function RoutersScreen() {
	const colorScheme = useColorScheme() ?? 'light';
	const router = useRouter();
	const { routers, fetchRouters } = useTransaction();
	const promptFadeAnim = useAnimatedValue(0);
	const [showPrompt, setShowPrompt] = useState(false);
	const [activeRouter, setActiveRouter] = useState<string | undefined>();
	const { user, language } = useGeneral();

	useEffect(() => {
		if (user && routers.length === 0) {
			(async () => {
				await fetchRouters(user);
			})();
		}
	}, [user, routers, fetchRouters]);

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
		// Logic to add a new router
	};

	const handleViewRouter = (routerId: string) => {
		// Logic to view a specific router
	};
	const handleEditRouter = (routerId: string) => {
		if (!routerId) return;
		router.push(`/routers/${routerId}`);
	};
	const handleDeleteRouter = () => {
		// Delete router logic here
		console.log('Deleting router with ID:', activeRouter);
		toggleShowPrompt(false);
	};

	return (
		<>
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
					id='router-balances'
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
								id='router-list-header'
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
								id='router-list-details'
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
											{router.ip}
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
													const router: NetRouter | undefined = routers.find(
														(r) => r.id === router?.id
													);
													if (router) setActiveRouter(router.id);
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
			</ThemedView>
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

const styles = StyleSheet.create({
	container: {
		position: 'relative',
		flex: 1,
		padding: 16,
		zIndex: 1,
	},
	routerItem: {
		padding: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
	},
});
