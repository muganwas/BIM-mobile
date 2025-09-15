import { useGeneral } from '@/context/GeneralContext';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';

// Best-effort hook to record the current path to the GeneralContext history.
// It tries to derive a readable path using available router data. If expo-router
// exposes more precise APIs in your version (like useSegments or usePathname),
// you can extend this hook to use them.
export default function useTrackHistory(path?: string) {
	const router = useRouter();
	const { handleUpdateHistory } = useGeneral();

	// Keep a ref of the last path we pushed so we only call
	// handleUpdateHistory when the path actually changes.
	const lastPushedRef = useRef<string | null>(null);

	const derivePath = useCallback((): string => {
		if (path && path.length > 0) return path;
		let derived = '';
		try {
			// @ts-ignore
			derived = router.pathname || router.asPath || '';
		} catch {
			derived = '';
		}
		if (!derived) {
			try {
				// @ts-ignore
				derived = router.route || '';
			} catch {}
		}
		return derived ? derived.toString() : '';
	}, [path, router]);

	useEffect(() => {
		const p = derivePath();
		if (!p) return;
		if (lastPushedRef.current === p) return;
		lastPushedRef.current = p;
		try {
			handleUpdateHistory(p);
		} catch {}
	}, [derivePath, handleUpdateHistory]);

	// Also update history whenever the screen gains focus (even without a re-render)
	useFocusEffect(
		useCallback(() => {
			const p = derivePath();
			if (!p) return;
			try {
				handleUpdateHistory(p);
			} catch {}
		}, [derivePath, handleUpdateHistory])
	);
}
