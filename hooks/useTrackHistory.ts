import { useGeneral } from '@/context/GeneralContext';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';

// Best-effort hook to record the current path to the GeneralContext history.
// It tries to derive a readable path using available router data. If expo-router
// exposes more precise APIs in your version (like useSegments or usePathname),
// you can extend this hook to use them.
export default function useTrackHistory(path?: string) {
	const router = useRouter();
	const { handleUpdateHistory } = useGeneral();
	const timer = useRef<number | null>(null);

	useEffect(() => {
		const push = (p: string) => {
			// debounce quick repeated calls
			if (timer.current) {
				clearTimeout(timer.current);
			}
			timer.current = setTimeout(() => {
				handleUpdateHistory(p);
				timer.current = null;
			}, 100) as unknown as number;
		};

		if (path && path.length > 0) {
			push(path);
			return () => {
				if (timer.current) clearTimeout(timer.current);
			};
		}

		// Try a few strategies to derive a path string
		let derived = '';
		try {
			// expo-router sometimes exposes a pathname-like prop
			// @ts-ignore
			derived = router.pathname || router.asPath || '';
		} catch {
			derived = '';
		}

		// Fallback: if router has a current route name
		if (!derived) {
			try {
				// @ts-ignore
				derived = router.route || '';
			} catch {}
		}

		if (derived) {
			push(derived.toString());
		}

		return () => {
			if (timer.current) clearTimeout(timer.current);
		};
	}, [path, router, handleUpdateHistory]);
}
