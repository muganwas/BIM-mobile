import { ThemedButton } from '@/components/ThemedButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import TileContainer from '@/components/TileContainer';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { fontSize, fontWeight } from '@/constants/Font';
import translations from '@/constants/Trans';
import { useGeneral } from '@/context/GeneralContext';
import { useTransaction } from '@/context/TransactionContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import useTrackHistory from '@/hooks/useTrackHistory';
import { RadiusProfile } from '@/types';
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

export default function PackagesScreen() {
	useTrackHistory('/(authenticated)/packages');
	const bg = useThemeColor({}, 'background');
	const bimColor = useThemeColor({}, 'bim');
	const textColor = useThemeColor({}, 'text');
	const titleBg = useThemeColor({}, 'titleBg');
	const listItemBackground = useThemeColor({}, 'listItemBackground');
	const borderDark = useThemeColor({}, 'borderDark');
	const lime = useThemeColor({}, 'lime');
	const yellow = useThemeColor({}, 'yellow');
	const errorColor = useThemeColor({}, 'error');
	const authButtonText = useThemeColor({}, 'authButtonText');
	const { packages, fetchPackages } = useTransaction();
	const { language } = useGeneral();

	const [refreshing, setRefreshing] = useState(false);

	const handleRefresh = useCallback(async () => {
		setRefreshing(true);
		try {
			await fetchPackages();
		} catch (e) {
			console.error('[PackagesScreen] refresh failed', e);
		} finally {
			setRefreshing(false);
		}
	}, [fetchPackages]);

	// stable per-mount ids
	const packageListDetailsId = useRef(
		`package-list-details-${Math.random().toString(36).slice(2)}`
	);
	const packageListId = useRef(
		`package-list-${Math.random().toString(36).slice(2)}`
	);
	const packageListHeaderId = useRef(
		`package-list-header-${Math.random().toString(36).slice(2)}`
	);

	// Fetch profiles when screen comes into focus
	useFocusEffect(
		useCallback(() => {
			(async () => {
				await fetchPackages();
			})();
		}, [fetchPackages])
	);

	// Column definitions
	const packageHeaders = [
		{ key: 'name', label: 'Profile Name', width: 140 },
		{ key: 'session_timeout', label: 'Session Timeout', width: 120 },
		{ key: 'rate_limit', label: 'Rate Limit', width: 120 },
		{ key: 'shared_users', label: 'Simultaneous Use', width: 120 },
		{
			key: 'actions',
			label: translations[language].categories.dashboard.actions,
			width: 120,
			textAlign: 'center' as const,
		},
	];

	// Cast packages to RadiusProfile[] since we now receive RADIUS profiles
	const profiles = (packages as RadiusProfile[]) || [];

	const handleViewProfile = (profile: RadiusProfile) => {
		// TODO: navigate to profile detail view
	};

	const handleEditProfile = (profile: RadiusProfile) => {
		// TODO: open edit modal
	};

	const handleDeleteProfile = (profile: RadiusProfile) => {
		// TODO: confirm and delete
	};

	const handleCreateProfile = () => {
		// TODO: open create modal
	};

	return (
		<ThemedView lightColor={bg} darkColor={bg} style={styles.container}>
			{/* Header section */}
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
					Packages / Profiles
				</ThemedText>
				<ThemedText
					style={{
						fontSize: fontSize['text.medium'],
					}}
					lightColor={textColor}
					darkColor={textColor}
				>
					Profiles are global and shared across all routers using RADIUS authentication.
				</ThemedText>
			</ThemedView>

			{/* Create New Profile button */}
			<ThemedView
				style={{
					width: '100%',
					paddingVertical: 8,
					alignItems: 'flex-end',
				}}
				lightColor={bg}
				darkColor={bg}
			>
				<ThemedButton
					title="CREATE NEW PROFILE"
					onPress={handleCreateProfile}
					style={{
						borderRadius: 8,
						width: 180,
					}}
					darkColor={bimColor}
					lightColor={bimColor}
					darkTextColor={authButtonText}
					lightTextColor={authButtonText}
				/>
			</ThemedView>

			{/* Available Profiles tile */}
			<TileContainer
				id={packageListId.current}
				backgroundColor={bg}
				style={{
					flexDirection: 'column',
					overflow: 'hidden',
					boxSizing: 'border-box',
					padding: 0,
				}}
			>
				{/* Tile title */}
				<ThemedView
					style={{
						paddingHorizontal: 10,
						paddingVertical: 8,
						borderBottomWidth: 1,
						borderBottomColor: borderDark,
					}}
					lightColor={titleBg}
					darkColor={titleBg}
				>
					<ThemedText
						style={{
							fontSize: fontSize['heading.two'],
							fontWeight: fontWeight['heading.two'],
						}}
						lightColor={textColor}
						darkColor={textColor}
					>
						Available Profiles
					</ThemedText>
				</ThemedView>

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
						{/* Column headers */}
						<ThemedView
							id={packageListHeaderId.current}
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

						{/* Profile rows */}
						<ScrollView
							id={packageListDetailsId.current}
							style={{
								flexDirection: 'column',
								backgroundColor: bg,
							}}
							refreshControl={
								<RefreshControl
									refreshing={refreshing}
									onRefresh={handleRefresh}
								/>
							}
						>
							{profiles.length === 0 ? (
								<ThemedView
									style={{
										paddingVertical: 30,
										alignItems: 'center',
									}}
									lightColor={bg}
									darkColor={bg}
								>
									<ThemedText lightColor={textColor} darkColor={textColor}>
										No profiles found. Create one to get started.
									</ThemedText>
								</ThemedView>
							) : (
								profiles.map((profile, index) => (
									<ThemedView
										key={profile.name + '-' + index}
										style={{
											flexDirection: 'row',
											width: '100%',
											alignItems: 'center',
											paddingVertical: 5,
											paddingHorizontal: 10,
											backgroundColor:
												index % 2 === 0 ? listItemBackground : bg,
											justifyContent: 'space-between',
											borderBottomWidth:
												index < profiles.length - 1 ? 1 : 0,
											borderBottomColor: borderDark,
										}}
										lightColor={bg}
										darkColor={bg}
									>
										<ThemedText
											numberOfLines={1}
											style={{
												width: 140,
												paddingRight: 8,
												overflow: 'hidden',
											}}
											lightColor={textColor}
											darkColor={textColor}
										>
											{profile.display_name}
										</ThemedText>
										<ThemedText
											numberOfLines={1}
											style={{
												width: 120,
												paddingRight: 8,
											}}
											lightColor={textColor}
											darkColor={textColor}
										>
											{profile["session-timeout"] || '—'}
										</ThemedText>
										<ThemedText
											numberOfLines={1}
											style={{
												width: 120,
												paddingRight: 8,
											}}
											lightColor={textColor}
											darkColor={textColor}
										>
											{profile["rate-limit"] || '—'}
										</ThemedText>
										<ThemedText
											numberOfLines={1}
											style={{
												width: 120,
												paddingRight: 8,
											}}
											lightColor={textColor}
											darkColor={textColor}
										>
											{profile["simultaneous-use"] ?? '—'}
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
												onPress={() => handleViewProfile(profile)}
											>
												<IconSymbol color={lime} name='eye.outline' />
											</TouchableOpacity>
											<TouchableOpacity
												onPress={() => handleEditProfile(profile)}
											>
												<IconSymbol color={yellow} name='edit.outline' />
											</TouchableOpacity>
											<TouchableOpacity
												onPress={() => handleDeleteProfile(profile)}
											>
												<IconSymbol color={errorColor} name='delete.outline' />
											</TouchableOpacity>
										</ThemedView>
									</ThemedView>
								))
							)}
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
});
