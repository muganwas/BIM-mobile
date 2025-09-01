import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedButton } from '@/components/ThemedButton';
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
import { Dimensions, useColorScheme, View } from 'react-native';

const devHeight = Dimensions.get('window').height;

export default function RouterDetailsScreen() {
	const routerTypeRef = useRef<View | null>(null);
	const { routerId } = useLocalSearchParams() as { routerId?: string };
	const { routers } = useTransaction();
	const { language } = useGeneral();
	const colorScheme = useColorScheme() ?? 'light';
	const [netRouter, setNetRouter] = useState<NetRouter | undefined>();
	const [selectedDropDown, setSelectedDropDown] = useState<
		string | undefined
	>();

	useEffect(() => {
		if (routerId && routers) {
			const router = routers.find((r) => r.id === routerId);
			setNetRouter(router);
		}
	}, [routerId, routers]);
	// Router details screen implementation
	const handleUpdateRouter = () => {
		if (netRouter) {
			// Update router logic here
		}
	};
	const handleCancel = () => {
		// Cancel logic here
	};
	return (
		<ParallaxScrollView
			headerBackgroundColor={{
				light: Colors.light.background,
				dark: Colors.dark.background,
			}}
			contentStyle={{
				paddingHorizontal: 10,
				//height: devHeight,
			}}
			containerStyle={{ flex: 1 }}
		>
			<TileContainer
				id={routerId || 'new-router'}
				backgroundColor={Colors[colorScheme].background}
				style={{
					flexDirection: 'column',
					boxSizing: 'border-box',
					padding: 0,
					paddingBottom: 10,
					marginBottom: 20,
					marginHorizontal: 20,
				}}
			>
				<ThemedView
					style={{
						width: '100%',
						padding: 10,
						height: 80,
						borderTopStartRadius: 8,
						borderTopEndRadius: 8,
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
						showDropdown={selectedDropDown === 'router-type'}
						setShowDropdown={(v) =>
							setSelectedDropDown(v ? 'router-type' : undefined)
						}
						multiselect={false}
						onSelect={() =>
							setSelectedDropDown((prev) =>
								prev === 'router-type' ? undefined : 'router-type'
							)
						}
						setValue={(value) => {
							setNetRouter(
								(prev) =>
									prev && {
										...prev,
										type: value,
									}
							);
						}}
						style={{ marginBottom: 10 }}
						options={['Mikrotik', 'TpLink', 'LinkSys', 'Cisco']}
					/>
					<ThemedInput
						label={translations[language].categories.dashboard.ipAddress}
						placeholder='eg. 10.0.0.1'
						value={netRouter?.ip}
						setValue={(value) =>
							setNetRouter(
								(prev) =>
									prev && {
										...prev,
										ip: value,
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
						label={translations[language].categories.dashboard.routerUsername}
						placeholder='eg. admin'
						value={netRouter?.username}
						setValue={(value) =>
							setNetRouter(
								(prev) =>
									prev && {
										...prev,
										ip: value,
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
						label={translations[language].categories.dashboard.routerPassword}
						placeholder='******'
						value={netRouter?.password}
						setValue={(value) =>
							setNetRouter(
								(prev) =>
									prev && {
										...prev,
										ip: value,
									}
							)
						}
						labelStyle={{
							fontWeight: fontWeight['heading.two'],
						}}
						secureTextEntry={true}
						style={{
							backgroundColor: Colors[colorScheme].background,
							borderWidth: 2,
							borderColor: Colors[colorScheme].inputBorder,
							marginBottom: 10,
						}}
					/>
					<ThemedView
						style={{
							flexDirection: 'row',
							width: '100%',
							gap: 10,
							marginTop: 10,
						}}
						lightColor={Colors.light.background}
						darkColor={Colors.dark.background}
					>
						<ThemedButton
							title={translations[
								language
							].categories.buttons.updateRouter.toUpperCase()}
							lightColor={Colors.light.bim}
							darkColor={Colors.dark.bim}
							darkTextColor={Colors.dark.white}
							lightTextColor={Colors.light.white}
							onPress={handleUpdateRouter}
							style={{ flex: 2 }}
						/>
						<ThemedButton
							title={translations[
								language
							].categories.buttons.cancel.toUpperCase()}
							lightColor={Colors.light.secondaryButton}
							darkColor={Colors.dark.secondaryButton}
							darkTextColor={Colors.dark.white}
							lightTextColor={Colors.light.white}
							onPress={handleCancel}
							style={{ flex: 1 }}
						/>
					</ThemedView>
				</ThemedView>
			</TileContainer>
		</ParallaxScrollView>
	);
}
