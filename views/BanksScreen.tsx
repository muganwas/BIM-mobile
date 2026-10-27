import { useEffect, useMemo, useState } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedButton } from '@/components/ThemedButton';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import TileContainer from '@/components/TileContainer';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { fontSize, fontWeight } from '@/constants/Font';
import { useGeneral } from '@/context/GeneralContext';
import { useTransaction } from '@/context/TransactionContext';
import { generateBank } from '@/helpers/factories';
import { useThemeColor } from '@/hooks/useThemeColor';
import useTrackHistory from '@/hooks/useTrackHistory';
import { Bank as BankType } from '@/types';
import BankAccount from '@/views/BankAccount';

export default function BanksScreen() {
	useTrackHistory('/(authenticated)/banks');
	const { banks, fetchBanks, setBanks } = useTransaction();
	const { user } = useGeneral();

	const bg = useThemeColor({}, 'background');
	const textColor = useThemeColor({}, 'text');
	const bim = useThemeColor({}, 'bim');
	const titleBg = useThemeColor({}, 'titleBg');
	const listItemBackground = useThemeColor({}, 'listItemBackground');
	const borderDark = useThemeColor({}, 'borderDark');
	const lime = useThemeColor({}, 'lime');
	const yellow = useThemeColor({}, 'yellow');
	const errorColor = useThemeColor({}, 'error');
	const actionButton = useThemeColor({}, 'actionButton');
	const authButtonText = useThemeColor({}, 'authButtonText');

	const [page] = useState(1);
	const pageSize = 50;

	const paged = useMemo(() => {
		const start = (page - 1) * pageSize;
		return banks.slice(start, start + pageSize);
	}, [banks, page]);

	const bankHeaders = useMemo(
		() => [
			{ key: 'row', label: '#', width: 30 },
			{ key: 'name', label: 'bank name', width: 120 },
			{ key: 'account', label: 'account number', width: 120 },
			{ key: 'swift', label: 'swift code', width: 120 },
			{ key: 'actions', label: 'actions', width: 120 },
		],
		[]
	);

	useEffect(() => {
		if (user && banks.length === 0) {
			fetchBanks(user).catch(() => {});
		}
	}, [user, banks.length, fetchBanks]);

	const [showAdd, setShowAdd] = useState(false);
	const [showEdit, setShowEdit] = useState(false);
	const [showView, setShowView] = useState(false);
	const [editBank, setEditBank] = useState<BankType | null>(null);

	const handleAddAccount = () => setShowAdd(true);
	const handleCancelAdd = () => setShowAdd(false);
	const handleSaveAdd = ({
		name,
		accountNumber,
		phone,
		swift,
	}: {
		name: string;
		accountNumber: string;
		phone: string;
		swift: string;
	}) => {
		const newBank = generateBank({
			name,
			accountNumber,
			SWIFTCode: swift,
			currency: 'UGX',
			accountHolderName: phone,
		});
		setBanks((prev) => [newBank, ...prev]);
		setShowAdd(false);
	};

	const handleView = (id: string) => {
		const found = banks.find((b) => b.id === id) ?? null;
		setEditBank(found);
		setShowView(!!found);
	};

	const handleEdit = (id: string) => {
		const found = banks.find((b) => b.id === id) ?? null;
		setEditBank(found);
		setShowEdit(!!found);
	};

	const handleDelete = (id: string) => console.log('Delete bank', id);

	const handleUpdateBank = ({
		name,
		accountNumber,
		phone,
		swift,
	}: {
		name: string;
		accountNumber: string;
		phone: string;
		swift: string;
	}) => {
		if (!editBank) return;
		setBanks((prev) =>
			prev.map((b) =>
				b.id === editBank.id
					? {
							...b,
							name,
							accountNumber,
							accountHolderName: phone,
							SWIFTCode: swift,
					  }
					: b
			)
		);
		setShowEdit(false);
		setEditBank(null);
	};

	return (
		<ParallaxScrollView
			headerBackgroundColor={{ light: bg, dark: bg }}
			containerStyle={{ flex: 1 }}
			contentStyle={{ padding: 16 }}
		>
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
					lightColor={bim}
					darkColor={bim}
					style={{
						width: '100%',
						textTransform: 'capitalize',
						fontSize: fontSize['heading.one'],
						fontWeight: fontWeight['heading.one'],
					}}
				>
					Bank Accounts
				</ThemedText>
			</ThemedView>

			<ThemedView
				style={{ width: '100%', alignItems: 'flex-end', marginBottom: 12 }}
				lightColor={bg}
				darkColor={bg}
			>
				<ThemedButton
					title={'Add account'.toUpperCase()}
					numberOfLines={1}
					onPress={handleAddAccount}
					style={{ borderRadius: 8, width: 160 }}
					darkColor={actionButton}
					lightColor={actionButton}
					darkTextColor={authButtonText}
					lightTextColor={authButtonText}
				/>
			</ThemedView>

			<TileContainer
				id='banks-table'
				backgroundColor={bg}
				style={{ flexDirection: 'column', overflow: 'hidden', padding: 0 }}
			>
				<ScrollView horizontal showsHorizontalScrollIndicator>
					<ThemedView lightColor={bg} darkColor={bg}>
						<ThemedView
							style={{
								flexDirection: 'row',
								width: '100%',
								gap: 10,
								paddingVertical: 10,
								paddingHorizontal: 5,
								borderBottomWidth: 1,
								borderBottomColor: borderDark,
							}}
							lightColor={titleBg}
							darkColor={titleBg}
						>
							{bankHeaders.map((col) => (
								<ThemedText
									key={`hdr-${col.key}`}
									numberOfLines={1}
									ellipsizeMode='tail'
									style={{
										fontSize: fontSize['text.medium'],
										width: col.width,
										flexShrink: 0,
										textTransform: 'uppercase',
										paddingRight: 8,
									}}
									lightColor={textColor}
									darkColor={textColor}
								>
									{col.label}
								</ThemedText>
							))}
						</ThemedView>

						<ScrollView nestedScrollEnabled>
							{paged.map((b, index) => (
								<ThemedView
									key={b.id}
									style={{
										flexDirection: 'row',
										width: '100%',
										paddingVertical: 12,
										paddingHorizontal: 5,
										gap: 10,
										alignItems: 'center',
									}}
									lightColor={index % 2 === 0 ? listItemBackground : bg}
									darkColor={index % 2 === 0 ? listItemBackground : bg}
								>
									<ThemedText
										numberOfLines={1}
										style={{ width: 30, overflow: 'hidden', paddingRight: 8 }}
										lightColor={textColor}
										darkColor={textColor}
									>
										{index + 1}
									</ThemedText>
									<ThemedText
										numberOfLines={1}
										style={{ width: 120, paddingRight: 8, overflow: 'hidden' }}
										lightColor={textColor}
										darkColor={textColor}
									>
										{b.name}
									</ThemedText>
									<ThemedText
										numberOfLines={1}
										style={{ width: 120, paddingRight: 8 }}
										lightColor={textColor}
										darkColor={textColor}
									>
										{b.accountNumber}
									</ThemedText>
									<ThemedText
										numberOfLines={1}
										style={{ width: 120, paddingRight: 8 }}
										lightColor={textColor}
										darkColor={textColor}
									>
										{b.SWIFTCode}
									</ThemedText>
									<ThemedView
										style={{
											flexDirection: 'row',
											justifyContent: 'space-between',
											gap: 8,
											width: 120,
										}}
										lightColor='transparent'
										darkColor='transparent'
									>
										<TouchableOpacity onPress={() => handleView(b.id)}>
											<IconSymbol color={lime} name='eye.outline' />
										</TouchableOpacity>
										<TouchableOpacity onPress={() => handleEdit(b.id)}>
											<IconSymbol color={yellow} name='edit.outline' />
										</TouchableOpacity>
										<TouchableOpacity onPress={() => handleDelete(b.id)}>
											<IconSymbol color={errorColor} name='delete.outline' />
										</TouchableOpacity>
									</ThemedView>
								</ThemedView>
							))}
						</ScrollView>
					</ThemedView>
				</ScrollView>
			</TileContainer>

			<BankAccount
				visible={showAdd}
				onCancel={handleCancelAdd}
				onSave={handleSaveAdd}
			/>
			<BankAccount
				visible={showEdit}
				mode='edit'
				initial={{
					name: editBank?.name ?? '',
					accountNumber: editBank?.accountNumber ?? '',
					phone: editBank?.accountHolderName ?? '',
					swift: editBank?.SWIFTCode ?? '',
				}}
				onCancel={() => {
					setShowEdit(false);
					setEditBank(null);
				}}
				onSave={handleUpdateBank}
			/>
			<BankAccount
				visible={showView}
				mode='view'
				initial={{
					name: editBank?.name ?? '',
					accountNumber: editBank?.accountNumber ?? '',
					phone: editBank?.accountHolderName ?? '',
					swift: editBank?.SWIFTCode ?? '',
				}}
				onBack={() => {
					setShowView(false);
					setEditBank(null);
				}}
				onEdit={() => {
					setShowView(false);
					setShowEdit(true);
				}}
				onCancel={() => {
					setShowView(false);
					setEditBank(null);
				}}
				onSave={() => {
					/* no-op in view mode */
				}}
			/>
		</ParallaxScrollView>
	);
}
