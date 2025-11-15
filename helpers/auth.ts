// Deprecated helper — delegate to AuthService to centralize auth endpoints.
import * as AuthService from '@/services/AuthService';

export async function getAuthToken({
	phone,
	email,
	password,
}: {
	phone?: string;
	email?: string;
	password?: string;
}) {
	try {
		const res = await AuthService.getAuthToken({ phone, email, password });
		if (!res || !res.ok) return null;
		const json = await res.json();
		return json.token || null;
	} catch (e) {
		console.error('getAuthToken: delegation failed', e);
		return null;
	}
}

export async function verifyToken(token: string) {
	try {
		const res = await AuthService.verifyToken(token);
		if (!res || !res.ok) return false;
		const json = await res.json();
		return json.valid || false;
	} catch (e) {
		console.error('verifyToken: delegation failed', e);
		return false;
	}
}
