import { ThemedButton } from '@/components/ThemedButton';
import { ThemedInput } from '@/components/ThemedInput';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
// apiFetch moved to context for 2FA verification; this screen no longer calls API directly

import translations from '@/constants/Trans';
import { useGeneral } from '@/context/GeneralContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';

export default function Setup2FAScreen() {
	const {
		pending2FASetup,
		setPending2FASetup,
		setAppMessage,
		language,
		handleVerify2FA,
	} = useGeneral();
	const router = useRouter();
	const bg = useThemeColor({}, 'background');
	const textColor = useThemeColor({}, 'text');
	const inputBackground = useThemeColor({}, 'inputBackground');
	const bim = useThemeColor({}, 'bim');
	const [code, setCode] = useState('');
	const [loading, setLoading] = useState(false);

	const qrUri = useMemo(() => {
		if (!pending2FASetup) return null;
		if (pending2FASetup.qr && String(pending2FASetup.qr).startsWith('data:'))
			return pending2FASetup.qr;
		if (pending2FASetup.qr_base64)
			return `data:image/png;base64,${pending2FASetup.qr_base64}`;
		return null;
	}, [pending2FASetup]);

	const handleCopySecret = async () => {
		if (!pending2FASetup?.secret) return;
		try {
			// Prefer native expo-clipboard if available
			if (Clipboard && typeof Clipboard.setStringAsync === 'function') {
				await Clipboard.setStringAsync(String(pending2FASetup.secret));
				setAppMessage?.({
					type: 'message',
					message:
						translations[language].categories.auth[
							'setupAuthenticator.copiedToast'
						] ?? 'Secret copied to clipboard',
				});
				return;
			}
			// Fallback to navigator.clipboard for web
			if (
				typeof navigator !== 'undefined' &&
				(navigator as any)?.clipboard?.writeText
			) {
				await (navigator as any).clipboard.writeText(
					String(pending2FASetup.secret)
				);
				setAppMessage?.({
					type: 'message',
					message:
						translations[language].categories.auth[
							'setupAuthenticator.copiedToast'
						] ?? 'Secret copied to clipboard',
				});
				return;
			}
			setAppMessage?.({
				type: 'error',
				message:
					translations[language].categories.auth[
						'setupAuthenticator.clipboardUnavailable'
					] ?? 'Clipboard not available on this platform',
			});
		} catch {
			setAppMessage?.({
				type: 'error',
				message:
					translations[language].categories.auth[
						'setupAuthenticator.copyFailed'
					] ?? 'Failed to copy secret',
			});
		}
	};

	const handleContinue = () => {
		// Clear pending 2FA setup and continue to the authenticated area
		setPending2FASetup?.(null);
		router.replace('/(authenticated)/home');
	};

	const handleOnVerify2FA = async () => {
		if (!pending2FASetup?.phone) {
			setAppMessage?.({
				type: 'error',
				message:
					translations[language].categories.auth[
						'setupAuthenticator.missingPhone'
					] ?? 'Missing phone for 2FA verification',
			});
			return;
		}
		if (!code || code.trim().length === 0) {
			setAppMessage?.({
				type: 'error',
				message:
					translations[language].categories.auth[
						'setupAuthenticator.enterCodeError'
					] ?? 'Enter the code from your authenticator app',
			});
			return;
		}
		try {
			setLoading(true);
			const ok = await handleVerify2FA(code);
			if (ok) {
				// success handled by context (navigation). clear local code.
				setCode('');
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<ThemedView style={styles.container} lightColor={bg} darkColor={bg}>
			<ScrollView contentContainerStyle={styles.inner}>
				<ThemedText style={styles.title}>
					{translations[language].categories.auth['setupAuthenticator'] ??
						'Set up authenticator'}
				</ThemedText>
				<ThemedText style={[styles.subtitle, { color: textColor }]}>
					{translations[language].categories.auth[
						'setupAuthenticator.subtitle'
					] ??
						'Scan the QR code below with your authenticator app such as Google Authenticator or Authy, or copy the secret and add it manually.'}
				</ThemedText>

				{qrUri ? (
					<View style={styles.qrWrap}>
						<Image source={{ uri: qrUri }} style={styles.qr} />
					</View>
				) : (
					<ThemedText style={styles.noQr}>
						{translations[language].categories.auth['setupAuthenticator.noQr']}
					</ThemedText>
				)}

				<ThemedView
					style={styles.secretBox}
					lightColor={inputBackground}
					darkColor={inputBackground}
				>
					<ThemedText style={[styles.secretLabel, { color: textColor }]}>
						{
							translations[language].categories.auth[
								'setupAuthenticator.secretLabel'
							]
						}
					</ThemedText>
					<ThemedText style={styles.secretValue}>
						{pending2FASetup?.secret ?? '—'}
					</ThemedText>
				</ThemedView>

				<ThemedInput
					style={{
						width: '100%',
						marginTop: 12,
						backgroundColor: inputBackground,
						color: textColor,
					}}
					lightColor={textColor}
					darkColor={textColor}
					value={code}
					setValue={(v: string) => {
						if (v.length <= 6 && !isNaN(Number(v))) setCode(v);
					}}
					placeholder={
						translations[language].categories.auth[
							'setupAuthenticator.enterCodePlaceholder'
						]
					}
					placeholderTextColor={textColor}
					keyboardType='number-pad'
				/>

				<ThemedView style={{ gap: 12, width: '100%', marginTop: 20 }}>
					<ThemedButton
						title={
							translations[language].categories.auth['setupAuthenticator.copy']
						}
						onPress={handleCopySecret}
					/>
					<ThemedButton
						title={
							loading
								? translations[language].categories.buttons?.['loading'] ??
								  'Verifying...'
								: translations[language].categories.auth[
										'setupAuthenticator.verify'
								  ]
						}
						onPress={handleOnVerify2FA}
						lightColor={bim}
						darkColor={bim}
						disabled={loading}
					/>
					<ThemedButton
						title={
							translations[language].categories.auth[
								'setupAuthenticator.continue'
							]
						}
						onPress={handleContinue}
					/>
				</ThemedView>

				<ThemedText style={styles.instructionsTitle}>
					{
						translations[language].categories.auth[
							'setupAuthenticator.howToTitle'
						]
					}
				</ThemedText>
				<ThemedText style={styles.instructions}>
					{translations[language].categories.auth['setupAuthenticator.step1']}
				</ThemedText>
				<ThemedText style={styles.instructions}>
					{translations[language].categories.auth['setupAuthenticator.step2']}
				</ThemedText>
				<ThemedText style={styles.instructions}>
					{translations[language].categories.auth['setupAuthenticator.step3']}
				</ThemedText>
				<ThemedText style={styles.instructions}>
					{translations[language].categories.auth['setupAuthenticator.step4']}
				</ThemedText>
			</ScrollView>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 20,
	},
	inner: {
		alignItems: 'center',
		paddingHorizontal: 20,
		gap: 12,
	},
	title: {
		fontSize: 22,
		fontWeight: '600',
		marginBottom: 6,
	},
	subtitle: {
		fontSize: 14,
		textAlign: 'center',
		marginBottom: 12,
	},
	qrWrap: {
		width: 260,
		height: 260,
		borderRadius: 8,
		overflow: 'hidden',
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
	},
	qr: {
		width: '100%',
		height: '100%',
		resizeMode: 'contain',
	},
	noQr: {
		marginVertical: 12,
	},
	secretBox: {
		width: '100%',
		padding: 12,
		borderRadius: 8,
		marginTop: 12,
	},
	secretLabel: {
		fontSize: 12,
	},
	secretValue: {
		marginTop: 8,
		fontSize: 16,
		fontWeight: '600',
	},
	instructionsTitle: {
		marginTop: 18,
		fontSize: 16,
		fontWeight: '600',
	},
	instructions: {
		fontSize: 14,
		textAlign: 'left',
		width: '100%',
		marginTop: 8,
	},
});
