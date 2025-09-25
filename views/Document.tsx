import FormContainer from '@/components/FormContainer';
import OverlayContainer from '@/components/OverlayContainer';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedDropdown } from '@/components/ThemedDropdown';
import ThemedFilePicker from '@/components/ThemedFilePicker';
import { ThemedInput } from '@/components/ThemedInput';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import translations from '@/constants/Trans';
import { useGeneral } from '@/context/GeneralContext';
import { DocumentProps } from '@/types';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, useColorScheme, View } from 'react-native';

type DocumentPayload = {
	type: DocumentProps['type'];
	documentId: string;
	url: string;
};

type Mode = 'add' | 'edit' | 'preview';

type Props = {
	visible: boolean;
	mode?: Mode;
	initial?: Partial<DocumentPayload> & { name?: string };
	onCancel: () => void;
	onSubmit: (payload: DocumentPayload) => void;
	onBack?: () => void; // preview mode
	onEdit?: () => void; // preview mode
};

export default function Document({
	visible,
	mode = 'add',
	initial,
	onCancel,
	onSubmit,
	onBack,
	onEdit,
}: Props) {
	const colorScheme = useColorScheme() ?? 'light';
	const { language } = useGeneral();
	const fadeAnim = useRef(new Animated.Value(0)).current;
	const ddRef = useRef<View>(null);

	const documentTypeOptions: DocumentProps['type'][] = useMemo(
		() => [
			'passport',
			'id-card',
			'driver-license',
			'incorporation-certificate',
			'tax-document',
			'articles-of-association',
		],
		[]
	);

	const [type, setType] = useState<DocumentProps['type']>(
		(initial?.type as DocumentProps['type']) ?? 'id-card'
	);
	const [showTypeDd, setShowTypeDd] = useState(false);
	const [documentId, setDocumentId] = useState(initial?.documentId ?? '');
	const [url, setUrl] = useState(initial?.url ?? '');
	const [fileName, setFileName] = useState<string | undefined>(undefined);
	// File picking is handled by ThemedFilePicker

	const isPreview = mode === 'preview';
	const isEditable = mode !== 'preview';

	const toTitleCase = (s: string) =>
		s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));

	useEffect(() => {
		if (visible) {
			setType((initial?.type as DocumentProps['type']) ?? 'id-card');
			setDocumentId(initial?.documentId ?? '');
			setUrl(initial?.url ?? '');
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 150,
				useNativeDriver: true,
			}).start();
		} else {
			Animated.timing(fadeAnim, {
				toValue: 0,
				duration: 150,
				useNativeDriver: true,
			}).start();
		}
	}, [visible, fadeAnim, initial?.type, initial?.documentId, initial?.url]);

	const handleSubmit = () => {
		onSubmit({ type, documentId: documentId.trim(), url: url.trim() });
	};

	// handleBrowse removed (now inside ThemedFilePicker)

	const canSubmit =
		isEditable && type && documentId.trim().length > 0 && url.trim().length > 0;

	return (
		<OverlayContainer
			showOverlay={visible}
			fadeAnim={fadeAnim}
			position='center'
		>
			<FormContainer style={styles.kbContainer}>
				<ThemedView
					style={styles.card}
					lightColor={Colors.light.background}
					darkColor={Colors.dark.background}
				>
					<ThemedText
						style={styles.title}
						lightColor={Colors.light.screenTitleText}
						darkColor={Colors.dark.screenTitleText}
					>
						{toTitleCase(
							isPreview
								? translations[language].categories.documents.documentDetails
								: mode === 'edit'
								? translations[language].categories.documents.editDocument
								: translations[language].categories.documents
										.addYourDocumentDetails
						)}
					</ThemedText>

					<ThemedDropdown
						containerRef={ddRef}
						label={toTitleCase(
							translations[language].categories.documents.documentType
						)}
						placeholder={toTitleCase(
							translations[language].categories.documents.documentType
						)}
						value={toTitleCase(type.replace('-', ' '))}
						setValue={(v: string) =>
							setType(
								v
									.toLowerCase()
									.replace(' ', '-') as unknown as DocumentProps['type']
							)
						}
						options={documentTypeOptions.map((t) =>
							toTitleCase(t.replace('-', ' '))
						)}
						showDropdown={showTypeDd}
						setShowDropdown={setShowTypeDd}
						dropDownStyle={{ backgroundColor: '#fff', width: 280 }}
						active={isEditable}
						lightColor={Colors[colorScheme].background}
						darkColor={Colors[colorScheme].background}
						openDirection='down'
						style={{ marginBottom: 8 }}
					/>

					<ThemedInput
						label={toTitleCase(
							translations[language].categories.documents.documentNumber
						)}
						placeholder={'0000-0000-0000'}
						value={documentId}
						setValue={setDocumentId}
						editable={isEditable}
						style={{
							backgroundColor: Colors[colorScheme].background,
							borderColor: Colors[colorScheme].inputBorder,
							borderWidth: 1,
						}}
						containerStyle={{ marginBottom: 8 }}
					/>

					<ThemedFilePicker
						label={toTitleCase(
							translations[language].categories.documents.attachDocument
						)}
						placeholder={
							translations[language].categories.documents.noFileChosen
						}
						value={url}
						fileName={fileName}
						setValue={setUrl}
						setFileName={setFileName}
						accept={['pdf', 'png', 'jpg']}
						active={isEditable}
						containerStyle={{ marginBottom: 8 }}
					/>

					{/* File picker component displays chosen file inside input */}

					<View style={styles.actions}>
						{isPreview ? (
							<>
								<ThemedButton
									title={toTitleCase(
										translations[language].categories.buttons.close
									)}
									onPress={onBack ?? onCancel}
									lightColor={Colors.light.cancelButton}
									darkColor={Colors.dark.cancelButton}
									lightTextColor={Colors.light.white}
									darkTextColor={Colors.dark.white}
								/>
								<ThemedButton
									title={toTitleCase(
										translations[language].categories.buttons.save
									)}
									onPress={onEdit ?? (() => {})}
									lightColor={Colors.light.bim}
									darkColor={Colors.dark.bim}
									lightTextColor={Colors.light.white}
									darkTextColor={Colors.dark.white}
								/>
							</>
						) : (
							<>
								<ThemedButton
									title={toTitleCase(
										translations[language].categories.buttons.cancel
									)}
									onPress={onCancel}
									lightColor={Colors.light.cancelButton}
									darkColor={Colors.dark.cancelButton}
									lightTextColor={Colors.light.white}
									darkTextColor={Colors.dark.white}
								/>
								<ThemedButton
									title={toTitleCase(
										translations[language].categories.buttons.save
									)}
									onPress={handleSubmit}
									disabled={!canSubmit}
									lightColor={Colors.light.bim}
									darkColor={Colors.dark.bim}
									lightTextColor={Colors.light.white}
									darkTextColor={Colors.dark.white}
								/>
							</>
						)}
					</View>
				</ThemedView>
			</FormContainer>
		</OverlayContainer>
	);
}

const styles = StyleSheet.create({
	kbContainer: { width: '100%' },
	card: {
		flexDirection: 'column',
		padding: 20,
		borderRadius: 10,
		width: '100%',
		gap: 12,
	},
	title: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
	actions: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		gap: 10,
		marginTop: 8,
	},
});
