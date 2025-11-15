import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import TileContainer from '@/components/TileContainer';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { fontSize, fontWeight } from '@/constants/Font';
import { useGeneral } from '@/context/GeneralContext';
import { useTransaction } from '@/context/TransactionContext';
import * as factories from '@/helpers/factories';
import { useThemeColor } from '@/hooks/useThemeColor';
import useTrackHistory from '@/hooks/useTrackHistory';
import { DocumentProps } from '@/types';
import DocumentOverlay from '@/views/Document';
import { openBrowserAsync } from 'expo-web-browser';
import { useEffect, useMemo, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

export default function DocumentsScreen() {
	// explicitly track documents page
	useTrackHistory('/(authenticated)/documents');
	const bg = useThemeColor({}, 'background');
	const bimColor = useThemeColor({}, 'bim');
	const titleBg = useThemeColor({}, 'titleBg');
	const textColor = useThemeColor({}, 'text');
	const listItemBackground = useThemeColor({}, 'listItemBackground');
	const borderDark = useThemeColor({}, 'borderDark');
	const lime = useThemeColor({}, 'lime');
	const yellow = useThemeColor({}, 'yellow');
	const errorColor = useThemeColor({}, 'error');
	const { documents, fetchDocuments, setDocuments } = useTransaction();
	const { user } = useGeneral();

	// Overlay state
	const [showDocModal, setShowDocModal] = useState(false);
	const [docMode, setDocMode] = useState<'add' | 'edit' | 'preview'>('add');
	const [activeDoc, setActiveDoc] = useState<DocumentProps | null>(null);

	const [page] = useState(1);
	const pageSize = 50;
	const paged = useMemo(() => {
		const start = (page - 1) * pageSize;
		return documents.slice(start, start + pageSize);
	}, [documents, page]);

	// Define headers once
	const headers = useMemo(
		() => [
			{ key: 'row', label: '#', width: 30 },
			{ key: 'type', label: 'type', width: 120 },
			{ key: 'number', label: 'number', width: 140 },
			{ key: 'attachment', label: 'attachment', width: 120 },
			{ key: 'status', label: 'status', width: 120 },
			{ key: 'actions', label: 'actions', width: 140 },
		],
		[]
	);

	useEffect(() => {
		if (user && documents.length === 0) {
			(async () => {
				await fetchDocuments(user);
			})();
		}
	}, [user, documents, fetchDocuments]);

	// Derive a simple status without changing types
	const getStatusColor = (status: DocumentProps['status']) => {
		if (status === 'approved') return { light: lime, dark: lime };
		if (status === 'pending') return { light: yellow, dark: yellow };
		return { light: errorColor, dark: errorColor };
	};

	const handleAddDocument = () => {
		setActiveDoc(null);
		setDocMode('add');
		setShowDocModal(true);
	};
	const handlePreview = async (doc: DocumentProps) => {
		// Open overlay in preview mode (keep external link as inline "Open" text)
		setActiveDoc(doc);
		setDocMode('preview');
		setShowDocModal(true);
	};
	const handleEdit = (doc: DocumentProps) => {
		setActiveDoc(doc);
		setDocMode('edit');
		setShowDocModal(true);
	};
	const handleDelete = (doc: DocumentProps) => {
		// Remove by id to ensure stable identity
		try {
			setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
		} catch (e) {
			console.warn('Failed to delete document', e);
		}
	};

	// Overlay submit handling
	const handleSubmitOverlay = (payload: {
		type: DocumentProps['type'];
		documentId: string;
		url: string;
	}) => {
		if (docMode === 'add') {
			// Create new document via factory, default status 'pending' unless derived
			const newDoc = factories.generateDocument({
				type: payload.type,
				documentId: payload.documentId,
				url: payload.url,
				status: 'pending',
			});
			setDocuments((prev) => [newDoc, ...prev]);
		} else if (docMode === 'edit' && activeDoc) {
			// Update existing document, preserve id and status unless changed elsewhere
			setDocuments((prev) =>
				prev.map((d) =>
					d.id === activeDoc.id
						? {
								...d,
								type: payload.type,
								documentId: payload.documentId,
								url: payload.url,
								name:
									payload.type === 'passport'
										? 'Passport'
										: payload.type === 'driver-license'
										? 'Driver License'
										: payload.type === 'id-card'
										? 'ID Card'
										: payload.type === 'incorporation-certificate'
										? 'Incorporation Certificate'
										: payload.type === 'tax-document'
										? 'Tax Document'
										: 'Articles of Association',
						  }
						: d
				)
			);
		}
		setShowDocModal(false);
		setActiveDoc(null);
	};

	const overlayInitial = useMemo(() => {
		if (!activeDoc) return undefined;
		return {
			type: activeDoc.type,
			documentId: activeDoc.documentId,
			url: activeDoc.url,
			name: activeDoc.name,
		};
	}, [activeDoc]);

	return (
		<ParallaxScrollView
			headerBackgroundColor={{
				light: bg,
				dark: bg,
			}}
			containerStyle={{ flex: 1 }}
			contentStyle={{ padding: 16 }}
		>
			{/* Title row */}
			<ThemedView
				lightColor={bg}
				darkColor={bg}
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					gap: 12,
					marginBottom: 12,
				}}
			>
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
					My documents
				</ThemedText>
			</ThemedView>

			{/* Actions */}
			<ThemedView
				style={{ width: '100%', alignItems: 'flex-end', marginBottom: 12 }}
				lightColor={bg}
				darkColor={bg}
			>
				<ThemedButton
					title={'Add document'.toUpperCase()}
					numberOfLines={1}
					onPress={handleAddDocument}
					style={{ borderRadius: 8, width: 200 }}
					darkColor={useThemeColor({}, 'actionButton')}
					lightColor={useThemeColor({}, 'actionButton')}
					darkTextColor={useThemeColor({}, 'authButtonText')}
					lightTextColor={useThemeColor({}, 'authButtonText')}
				/>
			</ThemedView>

			{/* Documents table */}
			<TileContainer
				id='documents-table'
				backgroundColor={bg}
				style={{
					flexDirection: 'column',
					overflow: 'hidden',
					boxSizing: 'border-box',
					padding: 0,
				}}
			>
				<ScrollView horizontal showsHorizontalScrollIndicator>
					<ThemedView lightColor={bg} darkColor={bg}>
						{/* Header */}
						<ThemedView
							style={{
								flexDirection: 'row',
								width: '100%',
								gap: 10,
								paddingVertical: 10,
								paddingHorizontal: 10,
								borderBottomWidth: 1,
								borderBottomColor: borderDark,
							}}
							lightColor={titleBg}
							darkColor={titleBg}
						>
							{headers.map((col) => (
								<ThemedText
									key={`hdr-${col.key}`}
									numberOfLines={1}
									ellipsizeMode='tail'
									style={{
										fontSize: fontSize['text.medium'],
										width: col.width,
										flexShrink: 0,
										textTransform: 'uppercase',
										textAlign: col.key === 'actions' ? 'center' : 'left',
										paddingRight: 8,
									}}
									lightColor={textColor}
									darkColor={textColor}
								>
									{col.label}
								</ThemedText>
							))}
						</ThemedView>

						{/* Rows */}
						<ScrollView nestedScrollEnabled>
							{paged.map((d, index) => (
								<ThemedView
									key={d.documentId}
									style={{
										flexDirection: 'row',
										width: '100%',
										paddingVertical: 12,
										paddingHorizontal: 10,
										gap: 10,
										alignItems: 'center',
										backgroundColor: index % 2 === 0 ? listItemBackground : bg,
										borderBottomWidth: index < paged.length - 1 ? 1 : 0,
										borderBottomColor: borderDark,
									}}
									lightColor={bg}
									darkColor={bg}
								>
									{/* # */}
									<ThemedText
										numberOfLines={1}
										style={{ width: 30, overflow: 'hidden', paddingRight: 8 }}
										lightColor={textColor}
										darkColor={textColor}
									>
										{index + 1}
									</ThemedText>
									{/* type */}
									<ThemedText
										numberOfLines={1}
										style={{ width: 120, paddingRight: 8, overflow: 'hidden' }}
										lightColor={textColor}
										darkColor={textColor}
									>
										{d.type.replace('-', ' ')}
									</ThemedText>
									{/* number */}
									<ThemedText
										numberOfLines={1}
										style={{ width: 140, paddingRight: 8 }}
										lightColor={textColor}
										darkColor={textColor}
									>
										{d.documentId}
									</ThemedText>
									{/* attachment */}
									<TouchableOpacity
										onPress={async () => {
											try {
												await openBrowserAsync(d.url);
											} catch (e) {
												console.warn('Failed to open document', e);
											}
										}}
										style={{ width: 120 }}
									>
										<ThemedText
											numberOfLines={1}
											lightColor={bimColor}
											darkColor={bimColor}
											style={{ textDecorationLine: 'underline' }}
										>
											Open
										</ThemedText>
									</TouchableOpacity>
									{/* status */}
									<ThemedText
										numberOfLines={1}
										style={{ width: 120, paddingRight: 8 }}
										lightColor={getStatusColor(d.status).light}
										darkColor={getStatusColor(d.status).dark}
									>
										{d.status}
									</ThemedText>
									{/* actions */}
									<ThemedView
										style={{
											flexDirection: 'row',
											justifyContent: 'space-between',
											gap: 8,
											width: 140,
										}}
										lightColor='transparent'
										darkColor='transparent'
									>
										<TouchableOpacity onPress={() => handlePreview(d)}>
											<IconSymbol color={lime} name='eye.outline' />
										</TouchableOpacity>
										<TouchableOpacity onPress={() => handleEdit(d)}>
											<IconSymbol color={yellow} name='edit.outline' />
										</TouchableOpacity>
										<TouchableOpacity onPress={() => handleDelete(d)}>
											<IconSymbol color={errorColor} name='delete.outline' />
										</TouchableOpacity>
									</ThemedView>
								</ThemedView>
							))}
						</ScrollView>
					</ThemedView>
				</ScrollView>
			</TileContainer>

			{/* Document overlay */}
			<DocumentOverlay
				visible={showDocModal}
				mode={docMode}
				initial={overlayInitial}
				onCancel={() => {
					setShowDocModal(false);
					setActiveDoc(null);
				}}
				onSubmit={handleSubmitOverlay}
				onBack={() => {
					setShowDocModal(false);
					setActiveDoc(null);
				}}
				onEdit={() => setDocMode('edit')}
			/>
		</ParallaxScrollView>
	);
}
