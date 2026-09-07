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
import { RadiusProfile } from '@/types';
import CreateProfile from '@/views/CreateProfile';
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Animated, RefreshControl, StyleSheet, useAnimatedValue } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

export default function PackagesScreen() {
	useTrackHistory('/(authenticated)/packages');
	const createProfileModalAnim = useAnimatedValue(0);
	const bg = useThemeColor({}, 'background');
	const bimColor = useThemeColor({}, 'bim');
	const textColor = useThemeColor({}, 'text');
	const titleBg = useThemeColor({}, 'titleBg');
	const listItemBackground = useThemeColor({}, 'listItemBackground');
	const borderDark = useThemeColor({}, 'borderDark');
	const lightBlue = useThemeColor({}, 'lightBlue');
	const white = useThemeColor({}, 'white');
	const yellow = useThemeColor({}, 'yellow');
	const errorColor = useThemeColor({}, 'error');
	const authButtonText = useThemeColor({}, 'authButtonText');
	const { packages, fetchPackages } = useTransaction();
	const { language } = useGeneral();

	const [refreshing, setRefreshing] = useState(false);
	const [showCreateProfileModal, setShowCreateProfileModal] = useState(false);
	const [createProfileMode, setCreateProfileMode] = useState<'create' | 'edit'>('create');
	const [showEditProfileModal, setShowEditProfileModal] = useState(false);


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
		{ key: 'profileName', label: translations[language].categories.packages.profileName, width: 140 },
		{ key: 'sessionTimeout', label: translations[language].categories.packages.sessionTimeout, width: 120 },
		{ key: 'rateLimit', label: translations[language].categories.packages.rateLimit, width: 120 },
		{ key: 'simultaneousConnections', label: translations[language].categories.packages.simultaneousConnections, width: 120 },
		{
			key: 'actions',
			label: translations[language].categories.dashboard.actions,
			width: 280,
			textAlign: 'center' as const,
		},
	];

	const toggleCreateProfileModal = (show?: boolean) => {
		const targetValue = show ?? showCreateProfileModal;
		if (targetValue) {
			Animated.timing(createProfileModalAnim, {
				toValue: 1,
				duration: 300,
				useNativeDriver: true,
			}).start();
			setShowCreateProfileModal(true);
		} else {
			Animated.timing(createProfileModalAnim, {
				toValue: 0,
				duration: 300,
				useNativeDriver: true,
			}).start();
			setShowCreateProfileModal(false);
		}
	}

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
		<>
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
						title={translations[language].categories.packages.createProfile}
						onPress={() => {
							setCreateProfileMode('create');
							toggleCreateProfileModal(true);
						}}
						style={{
							borderRadius: 8,
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
						}}
						lightColor={'transparent'}
						darkColor={'transparent'}
					>
						<ThemedText
							style={{
								fontSize: fontSize['heading.two'],
								fontWeight: fontWeight['heading.two'],
							}}
							lightColor={textColor}
							darkColor={textColor}
						>
							{translations[language].categories.packages.availableProfiles}
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
													display: 'flex',
													flexDirection: 'row',
													justifyContent: 'space-between',
													gap: 2,
													width: 280,
												}}
												lightColor='transparent'
												darkColor='transparent'
											>
												<ThemedButton
													onPress={() => handleViewProfile(profile)}
													style={styles.actionButton}
													textStyle={styles.actionButtonText}
													icon='eye.outline'
													title={translations[language].categories.packages.view}
													darkColor={lightBlue}
													lightColor={lightBlue}
													lightTextColor={white}
													darkTextColor={white}
													iconColor={white}
												/>
												<ThemedButton
													onPress={() => handleEditProfile(profile)}
													style={styles.actionButton}
													textStyle={styles.actionButtonText}
													icon='edit.outline'
													title={translations[language].categories.packages.edit}
													darkColor={yellow}
													lightColor={yellow}
													lightTextColor={white}
													darkTextColor={white}
													iconColor={white}
												/>
												<ThemedButton
													onPress={() => handleDeleteProfile(profile)}
													style={styles.actionButton}
													textStyle={styles.actionButtonText}
													icon='delete.outline'
													title={translations[language].categories.packages.delete}
													darkColor={errorColor}
													lightColor={errorColor}
													lightTextColor={white}
													darkTextColor={white}
													iconColor={white}
												/>
											</ThemedView>
										</ThemedView>
									))
								)}
							</ScrollView>
						</ThemedView>
					</ScrollView>
				</TileContainer>
			</ThemedView>
			<CreateProfile
				createProfile={handleCreateProfile}
				mode={createProfileMode}
				visible={showCreateProfileModal}
				fadeAnim={createProfileModalAnim}
				toggleVisible={toggleCreateProfileModal}
			/>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
	},
	actionButton: {
		display: 'flex',
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		padding: 5,
		gap: 3,
		borderRadius: 4,
	},
	actionButtonText: {
		fontSize: 12,
	},
});
