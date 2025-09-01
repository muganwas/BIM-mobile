import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedDropdown } from '@/components/ThemedDropdown';
import { ThemedInput } from '@/components/ThemedInput';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import TileContainer from '@/components/TileContainer';
import { Colors } from '@/constants/Colors';
import { fontSize, fontWeight } from '@/constants/Font';
import translations from '@/constants/Trans';
import { useGeneral } from '@/context/GeneralContext';
import { useTransaction } from '@/context/TransactionContext';
import { NetRouter } from '@/types';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useColorScheme, View } from 'react-native';

export default function RouterDetailsScreen() {
	const routerTypeRef = useRef<View | null>(null);
	const { routerId } = useLocalSearchParams() as { routerId?: string };
	const { routers } = useTransaction();
	const { language } = useGeneral();
	const colorScheme = useColorScheme() ?? 'light';
	const [netRouter, setNetRouter] = useState<NetRouter | undefined>();

	useEffect(() => {
		if (routerId && routers) {
			const router = routers.find((r) => r.id === routerId);
			setNetRouter(router);
		}
	}, [routerId, routers]);
	// Router details screen implementation
	return (
		<ParallaxScrollView
			headerBackgroundColor={{
				light: Colors.light.background,
				dark: Colors.dark.background,
			}}
			contentStyle={{ paddingHorizontal: 10 }}
		>
			<TileContainer
				id={routerId || 'new-router'}
				backgroundColor={Colors[colorScheme].background}
				style={{
					flexDirection: 'column',
					boxSizing: 'border-box',
					padding: 0,
					overflow: 'hidden',
					marginBottom: 20,
					height: 'auto',
					marginHorizontal: 20,
				}}
			>
				<ThemedView
					style={{
						width: '100%',
						padding: 10,
						height: 80,
						justifyContent: 'center',
						alignItems: 'center',
					}}
					lightColor={Colors.light.yellow}
					darkColor={Colors.dark.yellow}
				>
					<ThemedText
						lightColor={Colors.light.screenTitleText}
						darkColor={Colors.dark.screenTitleText}
						style={{
							fontSize: fontSize['heading.one'],
							fontWeight: fontWeight['heading.one'],
						}}
					>
						{routerId
							? translations[language].categories.routers.editTitle
							: translations[language].categories.routers.newTitle}
					</ThemedText>
				</ThemedView>
				<ThemedView
					id='router-form'
					lightColor={Colors.light.background}
					darkColor={Colors.dark.background}
					style={{
						width: '100%',
						paddingHorizontal: 20,
						paddingVertical: 10,
					}}
				>
					<ThemedInput
						label={translations[language].categories.dashboard.routerName}
						placeholder='eg. Router 01'
						value={netRouter?.name}
						setValue={(value) =>
							setNetRouter(
								(prev) =>
									prev && {
										...prev,
										name: value,
									}
							)
						}
						labelStyle={{
							fontWeight: fontWeight['heading.two'],
						}}
						style={{
							backgroundColor: Colors[colorScheme].background,
							borderWidth: 2,
							borderColor: Colors[colorScheme].inputBorder,
							marginBottom: 10,
						}}
					/>
					<ThemedInput
						label={translations[language].categories.dashboard.location}
						placeholder='eg. UCU Main Campus'
						value={netRouter?.location}
						setValue={(value) =>
							setNetRouter(
								(prev) =>
									prev && {
										...prev,
										location: value,
									}
							)
						}
						labelStyle={{
							fontWeight: fontWeight['heading.two'],
						}}
						style={{
							backgroundColor: Colors[colorScheme].background,
							borderWidth: 2,
							borderColor: Colors[colorScheme].inputBorder,
							marginBottom: 10,
						}}
					/>
					<ThemedDropdown
						containerRef={routerTypeRef}
						lightColor={Colors.light.background}
						darkColor={Colors.dark.background}
						placeholder={translations[language].categories.dashboard.routerType}
						value={netRouter?.type}
						label={translations[language].categories.routers.routerType}
						setValue={(value) =>
							setNetRouter(
								(prev) =>
									prev && {
										...prev,
										type: value,
									}
							)
						}
						options={['Mikrotik', 'TpLink', 'LinkSys', 'Cisco']}
					/>
				</ThemedView>
			</TileContainer>
		</ParallaxScrollView>
	);
}
