import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { fontSize, fontWeight } from '@/constants/Font';
import translations from '@/constants/Trans';
import { useGeneral } from '@/context/GeneralContext';
import useTrackHistory from '@/hooks/useTrackHistory';
import React from 'react';
import { StyleSheet } from 'react-native';

export default function NotificationsScreen() {
	useTrackHistory('/(authenticated)/notifications');
	const { notifications, language } = useGeneral(); // Get notifications from context
	return (
		<ThemedView
			style={styles.container}
			lightColor={Colors.light.background}
			darkColor={Colors.dark.background}
		>
			<ThemedText
				style={styles.title}
				lightColor={Colors.light.headers}
				darkColor={Colors.dark.headers}
			>
				{translations[language].categories.notifications['title']}
			</ThemedText>
			<ThemedView style={styles.notificationsList}>
				{notifications.length > 0 ? (
					notifications.map((notification, index) => (
						<ThemedView
							key={index}
							style={styles.notificationItem}
							lightColor={Colors.light.inputContainerBackground}
							darkColor={Colors.dark.inputContainerBackground}
						>
							<ThemedText
								style={styles.notificationTitle}
								lightColor={Colors.light.headers}
								darkColor={Colors.dark.headers}
							>
								{notification.title}
							</ThemedText>
							<ThemedText
								style={styles.notificationMessage}
								lightColor={Colors.light.text}
								darkColor={Colors.dark.text}
							>
								{notification.message}
							</ThemedText>
						</ThemedView>
					))
				) : (
					<ThemedText
						style={styles.noNotifications}
						lightColor={Colors.light.text}
						darkColor={Colors.dark.text}
					>
						{translations[language].categories.notifications['noNotifications']}
					</ThemedText>
				)}
			</ThemedView>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'flex-start',
		alignItems: 'center',
	},
	header: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 20,
	},
	notificationsList: {
		flex: 4,
		width: '100%',
		paddingHorizontal: 10,
	},
	notificationItem: {
		flexDirection: 'row',
		gap: 10,
		padding: 12,
		borderBottomWidth: 1,
	},
	notificationTitle: {
		fontWeight: 'bold',
	},
	notificationMessage: {
		fontSize: fontSize['notification.body'],
	},
	noNotifications: {
		padding: 12,
		textAlign: 'center',
	},
	title: {
		fontSize: fontSize['heading.one'],
		fontWeight: fontWeight['heading.one'],
		marginBottom: 20,
	},
});
