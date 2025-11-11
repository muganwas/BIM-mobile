import { apiBaseUrl } from '@/constants/API';
import { AuthRequest } from '@/types';
import { apiFetch } from './api';

export async function getAuthToken({
	phone,
	email,
	password,
}: AuthRequest): Promise<string | null> {
	try {
		const response = await apiFetch(
			apiBaseUrl + '/auth/token?phone=' + phone + '&&password?=' + password,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			}
		);

		if (!response.ok) {
			// Try to extract server message for logging, but don't throw — return null
			try {
				const ct = response.headers.get('content-type') || '';
				if (ct.includes('application/json')) {
					const body = await response.json();
					console.error(
						'Failed to fetch auth token:',
						body?.message || body?.error || body
					);
				} else {
					const txt = await response.text();
					console.error('Failed to fetch auth token:', txt);
				}
			} catch (e) {
				console.error('Failed to fetch auth token: unknown error', e);
			}
			return null;
		}

		const data = await response.json();
		return data.token || null;
	} catch (error) {
		console.error('Error fetching auth token:', error);
		return null;
	}
}

export async function verifyToken(token: string): Promise<boolean> {
	try {
		const response = await apiFetch(apiBaseUrl + '/auth/verify', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			try {
				const ct = response.headers.get('content-type') || '';
				if (ct.includes('application/json')) {
					const body = await response.json();
					console.error(
						'Token verification failed:',
						body?.message || body?.error || body
					);
				} else {
					const txt = await response.text();
					console.error('Token verification failed:', txt);
				}
			} catch (e) {
				console.error('Token verification failed: unknown error', e);
			}
			return false;
		}

		const data = await response.json();
		return data.valid || false;
	} catch (error) {
		console.error('Error verifying token:', error);
		return false;
	}
}
