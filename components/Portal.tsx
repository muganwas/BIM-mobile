import React, {
	ReactNode,
	useCallback,
	useMemo,
	useRef,
	useState,
} from 'react';
import { StyleSheet, View } from 'react-native';

type PortalEntry = {
	key: number;
	node: ReactNode;
};

type PortalContextValue = {
	mount: (node: ReactNode) => number;
	update: (key: number, node: ReactNode) => void;
	unmount: (key: number) => void;
};

const PortalContext = React.createContext<PortalContextValue | null>(null);

export function PortalProvider({ children }: { children: ReactNode }) {
	const nextKeyRef = useRef(0);
	const [entries, setEntries] = useState<PortalEntry[]>([]);

	const mount = useCallback((node: ReactNode) => {
		const key = ++nextKeyRef.current;
		setEntries((prev) => [...prev, { key, node }]);
		return key;
	}, []);

	const update = useCallback((key: number, node: ReactNode) => {
		setEntries((prev) => prev.map((e) => (e.key === key ? { ...e, node } : e)));
	}, []);

	const unmount = useCallback((key: number) => {
		setEntries((prev) => prev.filter((e) => e.key !== key));
	}, []);

	const value = useMemo(
		() => ({ mount, update, unmount }),
		[mount, update, unmount]
	);

	return (
		<PortalContext.Provider value={value}>
			{children}
			{/* Host rendered last to ensure top-most layering */}
			<View style={StyleSheet.absoluteFill} pointerEvents='box-none'>
				{entries.map(({ key, node }) => (
					<View
						key={key}
						style={{
							position: 'absolute',
							left: 0,
							right: 0,
							top: 0,
							bottom: 0,
							zIndex: 100000,
							elevation: 100000,
						}}
						pointerEvents='box-none'
					>
						{node}
					</View>
				))}
			</View>
		</PortalContext.Provider>
	);
}

export function Portal({ children }: { children: ReactNode }) {
	const ctx = React.useContext(PortalContext);
	const keyRef = useRef<number | null>(null);

	React.useEffect(() => {
		if (!ctx) return;
		if (keyRef.current == null) {
			keyRef.current = ctx.mount(children);
		} else {
			ctx.update(keyRef.current, children);
		}
	}, [children, ctx]);

	React.useEffect(() => {
		return () => {
			if (ctx && keyRef.current != null) {
				ctx.unmount(keyRef.current);
				keyRef.current = null;
			}
		};
	}, [ctx]);

	return null;
}
