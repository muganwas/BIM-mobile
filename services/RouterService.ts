import { apiBaseUrl } from '@/constants/API';
import { apiFetch } from '@/helpers/api';
import EventSource from 'react-native-sse';

function buildHeaders(token?: string) {
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
	};
	if (token) headers.Authorization = `Bearer ${token}`;
	return headers;
}

export async function fetchRouters(token?: string) {
	return apiFetch((apiBaseUrl || '') + '/routers', {
		method: 'GET',
		headers: buildHeaders(token),
	});
}

export async function getRouterById(routerId: string, token?: string) {
	return apiFetch((apiBaseUrl || '') + `/routers/${routerId}`, {
		method: 'GET',
		headers: buildHeaders(token),
	});
}

export async function getRouterStatus(routerId: string, token?: string) {
	const resp = await apiFetch((apiBaseUrl || '') + `/routers/${routerId}/status`, {
		method: 'GET',
		headers: buildHeaders(token),
	});

	// If the server accepted the request for background processing, poll for result
	if (resp.status === 202) {
		try {
			const body = await resp.json().catch(() => ({}));
			const cacheKey = body?.cache_key || body?.cacheKey || null;
			if (cacheKey) {
				const polled = await (await import('@/helpers/api')).pollQueuedOperation(cacheKey, token);
				return new Response(JSON.stringify(polled ?? {}), {
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				});
			}
		} catch (e) {
			console.error('[getRouterStatus] polling failed', e);
			return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
		}
	}

	return resp;
}

export async function getRouterHotspots(routerId: string, token?: string) {
	const url = (apiBaseUrl || '') + `/routers/${routerId}/hotspots`;
	const resp = await apiFetch(url, {
		method: 'GET',
		headers: buildHeaders(token),
	});

	// If the server accepted the request for background processing, poll for result
	if (resp.status === 202) {
		try {
			const body = await resp.json().catch(() => ({}));
			const cacheKey = body?.cache_key || body?.cacheKey || null;
			if (cacheKey) {
				const polled = await (await import('@/helpers/api')).pollQueuedOperation(cacheKey, token);
				return new Response(JSON.stringify(polled ?? {}), {
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				});
			}
		} catch (e) {
			console.error('[getRouterHotspots] polling failed', e);
			return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
		}
	}

	return resp;
}

export async function getRouterInterfaces(routerId: string, token?: string) {
	const resp = await apiFetch((apiBaseUrl || '') + `/routers/${routerId}/interfaces`, {
		method: 'GET',
		headers: buildHeaders(token),
	});

	if (resp.status !== 202) return resp;

	try {
		const body = await resp.json();
		const cacheKey = body?.cache_key || body?.cacheKey;
		if (!cacheKey) {
			console.error('[getRouterInterfaces] queued response did not include a cache key');
			return new Response(JSON.stringify(body), {
				status: 502,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const polled = await (await import('@/helpers/api')).pollQueuedOperation(cacheKey, token);
		return new Response(JSON.stringify(polled), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		console.error('[getRouterInterfaces] queued request failed', error);
		return new Response(JSON.stringify({ error: String(error) }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
}

export function createRouterTrafficEventSource({
	routerId,
	iface,
	token,
}: {
	routerId: string;
	iface: string;
	token: string;
}) {
	const url = `${apiBaseUrl || ''}/routers/${encodeURIComponent(routerId)}/traffic/stream?iface=${encodeURIComponent(iface)}`;
	return new EventSource<'hello' | 'traffic' | 'bye'>(url, {
		headers: {
			...buildHeaders(token),
			'X-Client-Type': 'api-client',
		},
		pollingInterval: 3000,
	});
}

export async function pingRouter(routerId: string, token?: string) {
	return apiFetch((apiBaseUrl || '') + `/routers/${routerId}/ping`, {
		method: 'GET',
		headers: buildHeaders(token),
	});
}

export async function getRouterUsers(
	{ routerId, token, page, limit }: { routerId: string; token?: string, page?: number, limit?: number }
) {
	const url = `${apiBaseUrl || ''}/routers/${routerId}/hotspots/users?per_page=${limit || 8}&page=${page || 1}`;
	console.log('[getRouterUsers] url', url);
	const resp = await apiFetch(url, {
		method: 'GET',
		headers: buildHeaders(token),
	});

	return resp;
}

export async function getRouterActiveUsers({ routerId, token, page, limit }: { routerId: string; token?: string; page?: number; limit?: number }) {
	const url = `${apiBaseUrl || ''}/routers/${routerId}/hotspots/active?per_page=${limit || 8}&page=${page || 1}`;
	console.log('[getRouterActiveUsers] url', url);
	const resp = await apiFetch(url, {
		method: 'GET',
		headers: buildHeaders(token),
	});

	return resp;
}

export async function getRouterCookies({ routerId, token, page, limit }: { routerId: string; token?: string; page?: number; limit?: number }) {
	const url = `${apiBaseUrl || ''}/routers/${routerId}/hotspot-cookies?per_page=${limit || 8}&page=${page || 1}`;
	console.log('[getRouterCookies] url', url);
	const resp = await apiFetch(url, {
		method: 'GET',
		headers: buildHeaders(token),
	});

	return resp;
}

export async function deleteRouterCookie({ routerId, cookieId, token }: { routerId: string; cookieId: string; token?: string }) {
	const url = `${apiBaseUrl || ''}/routers/${routerId}/hotspot-cookies/${cookieId}`;
	console.log('[removeRouterCookie] url', url);
	const resp = await apiFetch(url, {
		method: 'DELETE',
		headers: buildHeaders(token),
	});

	return resp;
}

export async function getRouterHosts({ routerId, token, page, limit }: { routerId: string; token?: string; page?: number; limit?: number }) {
	const url = `${apiBaseUrl || ''}/routers/${routerId}/hosts?per_page=${limit || 8}&page=${page || 1}`;
	console.log('[getRouterHosts] url ', url);
	const resp = await apiFetch(url, {
		method: 'GET',
		headers: buildHeaders(token),
	});

	return resp;
}

export async function getRouterDHCPLeases({ routerId, token, page, limit }: { routerId: string; token?: string; page?: number; limit?: number }) {
	const url = `${apiBaseUrl || ''}/routers/${routerId}/dhcp/leases?per_page=${limit || 8}&page=${page || 1}`;
	console.log('[getRouterDHCPLeases] url ', url);
	const resp = await apiFetch(url, {
		method: 'GET',
		headers: buildHeaders(token),
	});

	return resp;
}

export async function getRouterPurchaseGuard({ routerId, token }: { routerId: string; token?: string }) {
	const url = `${apiBaseUrl || ''}/routers/${routerId}/purchase-guard`;
	console.log('[getRouterPurchaseGuard] url ', url);
	const resp = await apiFetch(url, {
		method: 'GET',
		headers: buildHeaders(token),
	});
	return resp;
}

export async function updateRouterPurchaseGuard({ routerId, token, value }: { routerId: string; token?: string; value: boolean }) {
	const url = `${apiBaseUrl || ''}/routers/${routerId}/purchase-guard`;
	console.log('[updateRouterPurchaseGuard] url ', url);
	const resp = await apiFetch(url, {
		method: 'POST',
		headers: buildHeaders(token),
		body: JSON.stringify({ notify_existing_voucher: value }),
	});
	return resp;
}

export default {
	fetchRouters,
	getRouterById,
	getRouterStatus,
	pingRouter,
	getRouterHotspots,
	getRouterInterfaces,
	createRouterTrafficEventSource,
	getRouterUsers,
	getRouterActiveUsers,
	getRouterCookies,
	deleteRouterCookie,
	getRouterHosts,
	getRouterPurchaseGuard,
	updateRouterPurchaseGuard,
};
