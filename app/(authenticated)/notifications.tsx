import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { fontSize, fontWeight } from '@/constants/Font';
import translations from '@/constants/Trans';
import { useGeneral } from '@/context/GeneralContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import useTrackHistory from '@/hooks/useTrackHistory';
import { StyleSheet } from 'react-native';

export default function NotificationsScreen() {
	useTrackHistory('/(authenticated)/notifications');
	const { notifications, language } = useGeneral(); // Get notifications from context

	const bg = useThemeColor({}, 'background');
	const headers = useThemeColor({}, 'headers');
	const inputContainerBackground = useThemeColor(
		{},
		'inputContainerBackground'
	);
	const textColor = useThemeColor({}, 'text');
	return (
		<ParallaxScrollView
			headerBackgroundColor={{
				light: bg,
				dark: bg,
			}}
			containerStyle={{ flex: 1 }}
			contentStyle={{ padding: 16 }}
		>
			<ThemedText style={styles.title} lightColor={headers} darkColor={headers}>
				{translations[language].categories.notifications['title']}
			</ThemedText>
			<ThemedView style={styles.notificationsList}>
				{notifications.length > 0 ? (
					notifications.map((notification, index) => (
						<ThemedView
							key={index}
							style={styles.notificationItem}
							lightColor={inputContainerBackground}
							darkColor={inputContainerBackground}
						>
							<ThemedText
								style={styles.notificationTitle}
								lightColor={headers}
								darkColor={headers}
							>
								{notification.title}
							</ThemedText>
							<ThemedText
								style={styles.notificationMessage}
								lightColor={textColor}
								darkColor={textColor}
							>
								{notification.message}
							</ThemedText>
						</ThemedView>
					))
				) : (
					<ThemedText
						style={styles.noNotifications}
						lightColor={textColor}
						darkColor={textColor}
					>
						{translations[language].categories.notifications['noNotifications']}
					</ThemedText>
				)}
			</ThemedView>
		</ParallaxScrollView>
	);
}

const styles = StyleSheet.create({
	container: {},
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
