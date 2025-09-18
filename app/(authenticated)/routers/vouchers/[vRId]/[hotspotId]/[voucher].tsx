import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedInput } from '@/components/ThemedInput';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import TileContainer from '@/components/TileContainer';
import { Colors } from '@/constants/Colors';
import { fontSize, fontWeight } from '@/constants/Font';
import translations from '@/constants/Trans';
import { useGeneral } from '@/context/GeneralContext';
import { useTransaction } from '@/context/TransactionContext';
import { translateWithVariables } from '@/helpers';
import {
	useFocusEffect,
	useLocalSearchParams,
	useNavigation,
	useRouter,
} from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useColorScheme } from 'react-native';

export default function EditVoucherScreen() {
	const router = useRouter();
	const navigation = useNavigation();
	const { vRId, hotspotId, voucher } = useLocalSearchParams() as {
		vRId?: string;
		hotspotId?: string;
		voucher?: string;
	};
	const { language, handleUpdateHistory } = useGeneral();
	const { routers } = useTransaction();
	const colorScheme = useColorScheme() ?? 'light';
	const [profile, setProfile] = useState<string>('');
	const [username, setUsername] = useState<string>('');
	const [password, setPassword] = useState<string>('');

	useEffect(() => {
		navigation.setOptions({
			headerProps: {
				goback: true,
			},
		});
	}, [navigation]);

	// Seed parent immediately on mount to guarantee ordering before any current route push
	useEffect(() => {
		handleUpdateHistory(
			'/(authenticated)/routers/vouchers/' + vRId + '/' + hotspotId
		);
	}, [handleUpdateHistory, vRId, hotspotId]);

	// Seed parent path on focus so back goes to routers list; guard to run once per focus
	const seededParentRef = useRef(false);
	useFocusEffect(
		useCallback(() => {
			if (!seededParentRef.current) {
				handleUpdateHistory(
					`/(authenticated)/routers/vouchers/${vRId}/${hotspotId}/${voucher}`
				);
				seededParentRef.current = true;
			}
			return () => {
				seededParentRef.current = false; // reset on blur
			};
		}, [handleUpdateHistory, vRId, hotspotId, voucher])
	);

	useEffect(() => {
		if (vRId && hotspotId && routers) {
			const router = routers.find((r) => r.id === vRId);
			const hotspot = router?.networkInfo.hotspots.find(
				(h) => h.id === hotspotId
			);
			const user = hotspot?.users?.find((u) => u.voucherCode === voucher);
			setUsername(user?.voucherCode || '');
			setPassword(user?.password || '');
			setProfile(user?.package || '');
		}
	}, [vRId, hotspotId, routers, voucher]);

	// Router details screen implementation
	const handleCreateRouter = () => {};
	const handleCancel = () => {
		setProfile('');
		setUsername('');
		setPassword('');
		router.push(`/(authenticated)/routers/vouchers/${vRId}/${hotspotId}`);
	};
	return (
		<ParallaxScrollView
			headerBackgroundColor={{
				light: Colors.light.background,
				dark: Colors.dark.background,
			}}
			contentStyle={{
				paddingHorizontal: 10,
			}}
			containerStyle={{ flex: 1 }}
		>
			<TileContainer
				id={voucher ?? ''}
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
						{translateWithVariables(
							translations[language].categories.vouchers.editVoucher,
							{ voucher: voucher ?? '' }
						)}
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
						label={translations[language].categories.vouchers.username}
						placeholder='eg. 11111'
						value={username || ''}
						setValue={(value) => setUsername(value)}
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
						label={translations[language].categories.vouchers.password}
						placeholder='******'
						value={password || ''}
						setValue={(value) => setPassword(value)}
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
						label={translations[language].categories.vouchers.profile}
						placeholder='Daily-1000Shs'
						value={profile || ''}
						setValue={(value) => setProfile(value)}
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
							].categories.buttons.saveChanges.toUpperCase()}
							lightColor={Colors.light.bim}
							darkColor={Colors.dark.bim}
							darkTextColor={Colors.dark.white}
							lightTextColor={Colors.light.white}
							onPress={handleCreateRouter}
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
