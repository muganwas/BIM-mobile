import { apiBaseUrl } from '@/constants/API';
import { AuthRequest } from '@/types';

export async function getAuthToken({
	phone,
	email,
	password,
}: AuthRequest): Promise<string | null> {
	try {
		const response = await fetch(
			apiBaseUrl + '/auth/token?phone=' + phone + '&&password?=' + password,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			}
		);

		if (!response.ok) {
			throw new Error('Failed to fetch auth token');
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
		const response = await fetch(apiBaseUrl + '/auth/verify', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			throw new Error('Token verification failed');
		}

		const data = await response.json();
		return data.valid || false;
	} catch (error) {
		console.error('Error verifying token:', error);
		return false;
	}
}
