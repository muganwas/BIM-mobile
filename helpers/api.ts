import { apiBaseUrl } from '@/constants/API';
import { ShowAlert } from '@/helpers';

/**
 * Lightweight fetch wrapper that injects the X-Client-Type header for backend API calls.
 * It will add the header only when the request target appears to be the configured apiBaseUrl.
 */
/**
 * Callbacks for handling auth lifecycle events from the API layer.
 * These are injected from the app context (GeneralContext) to avoid circular dependencies.
 */
export interface AuthCallbacks {
	onRefreshToken: () => Promise<string | null>;
	onLogout: () => void;
}

let authCallbacks: AuthCallbacks | null = null;
let isRefreshing = false;
let refreshSubscribers: ((token: string | null) => void)[] = [];

export function registerAuthCallbacks(callbacks: AuthCallbacks) {
	authCallbacks = callbacks;
}

/**
 * Subscribe to token refresh completion.
 * Used to queue requests waiting for a refresh to complete.
 */
function subscribeTokenRefresh(callback: (token: string | null) => void) {
	refreshSubscribers.push(callback);
}

/**
 * Notify all subscribers that token refresh is complete.
 */
function onRefreshComplete(token: string | null) {
	refreshSubscribers.forEach(callback => callback(token));
	refreshSubscribers = [];
}

/**
 * Lightweight fetch wrapper that injects the X-Client-Type header for backend API calls.
 * It will add the header only when the request target appears to be the configured apiBaseUrl.
 * 
 * Handles 401 Unauthorized responses by attempting to refresh the token and retrying the request.
 */
export async function apiFetch(input: RequestInfo, init?: RequestInit) {
	const url = typeof input === 'string' ? input : (input as Request).url;

	// Clone/prepare headers
	const headers: Record<string, string> = {};
	if (init && init.headers) {
		if (init.headers instanceof Headers) {
			init.headers.forEach((v, k) => (headers[k] = v));
		} else if (Array.isArray(init.headers)) {
			init.headers.forEach(([k, v]) => (headers[k] = String(v)));
		} else {
			Object.assign(headers, init.headers as Record<string, string>);
		}
	}

	// Add the X-Client-Type header for API calls (only when apiBaseUrl is configured and matches)
	try {
		if (apiBaseUrl && typeof url === 'string' && url.startsWith(apiBaseUrl)) {
			headers['X-Client-Type'] = 'api-client';
		}
	} catch {
		// ignore
	}

	// Check if we should skip the interceptor (e.g. for the refresh call itself)
	const skipInterceptor = headers['X-Skip-Interceptor'] === 'true';
	if (skipInterceptor) {
		delete headers['X-Skip-Interceptor'];
	}

	const mergedInit: RequestInit = {
		...(init || {}),
		headers,
	};

	try {
		let response = await fetch(input, mergedInit);

		// Intercept 401s if we have callbacks and aren't skipping
		if (response.status === 401 && !skipInterceptor && authCallbacks) {
			try {
				console.log('API: 401 received, attempting token refresh...');
				
				// If a refresh is already in progress, wait for it
				if (isRefreshing) {
					console.log('API: Token refresh already in progress, waiting...');
					const newToken = await new Promise<string | null>((resolve) => {
						subscribeTokenRefresh((token) => {
							resolve(token);
						});
					});
					
					if (newToken) {
						console.log('API: Using refreshed token, retrying request...');
						headers['Authorization'] = `Bearer ${newToken}`;
						const retryInit = {
							...mergedInit,
							headers,
						};
						response = await fetch(input, retryInit);
					} else {
						console.log('API: Token refresh failed (from queue), logging out...');
						authCallbacks.onLogout();
					}
				} else {
					// We're the first to attempt refresh
					isRefreshing = true;
					const newToken = await authCallbacks.onRefreshToken();
					isRefreshing = false;
					
					// Notify all waiting requests
					onRefreshComplete(newToken);
					
					if (newToken) {
						console.log('API: Token refresh successful, retrying request...');
						// Update Authorization header with new token
						headers['Authorization'] = `Bearer ${newToken}`;
						const retryInit = {
							...mergedInit,
							headers,
						};
						response = await fetch(input, retryInit);
					} else {
						console.log('API: Token refresh failed, logging out...');
						authCallbacks.onLogout();
					}
				}
			} catch (e) {
				isRefreshing = false;
				onRefreshComplete(null);
				console.error('API: Error during token refresh interceptor', e);
				authCallbacks.onLogout();
			}
		}

		return response;
	} catch (error) {
		console.error('API Request Failed:', error);
		ShowAlert('Network request failed. Please check your connection.', 'Error');
		// Return a mock error response so the app doesn't crash on .json()
		return new Response(
			JSON.stringify({ error: 'Network request failed', message: 'Network request failed' }),
			{
				status: 503,
				statusText: 'Service Unavailable',
				headers: { 'Content-Type': 'application/json' },
			}
		);
	}
}

export default apiFetch;

/**
 * Parse a non-OK Response into a human readable error string.
 * Handles flattened JSON from our API like:
 * { errors: { name: ["..."], password: ["..."] } }
 */
export async function parseApiError(res: Response): Promise<string> {
	try {
		const ct = res.headers.get('content-type') || '';
		if (ct.includes('application/json')) {
			const body = await res.json();
			// If API uses { errors: { field: [..] } }
			if (body && typeof body === 'object') {
				if (body.errors && typeof body.errors === 'object') {
					const parts: string[] = [];
					for (const key of Object.keys(body.errors)) {
						const val = body.errors[key];
						if (Array.isArray(val)) {
							// join array messages for the field
							parts.push(`${key}: ${val.join('; ')}`);
						} else if (typeof val === 'string') {
							parts.push(`${key}: ${val}`);
						} else if (val && typeof val === 'object') {
							try {
								parts.push(`${key}: ${Object.values(val).flat().join('; ')}`);
							} catch {
								parts.push(`${key}: ${JSON.stringify(val)}`);
							}
						}
					}
					if (parts.length) return parts.join(' \n');
				}

				// Fallbacks: common message keys
				if (body.message && typeof body.message === 'string')
					return body.message;
				if (body.error && typeof body.error === 'string') return body.error;

				// If body is simple object, stringify a concise form
				try {
					return JSON.stringify(body);
				} catch {
					// pass through
				}
			}
		} else {
			// Non-json: return text
			try {
				const text = await res.text();
				if (text) return text;
			} catch {}
		}
	} catch {
		// ignore and continue to generic fallback
	}
	return `HTTP error ${res.status}`;
}

/**
 * Poll a queued operation by cache key until it completes or times out.
 * Returns the parsed JSON of the successful operation (typically an object with the resource data),
 * or throws on failure/timeout.
 */
/**
 * Fetch a Laravel Sanctum CSRF token from the server.
 * Returns the decoded XSRF-TOKEN value, or null if fetching fails.
 */
export async function fetchCsrfToken(): Promise<string | null> {
	try {
		const csrfUrl = `${apiBaseUrl}/sanctum/csrf-cookie`;
		// Use raw fetch (not apiFetch) to avoid auth interceptor interference
		const resp = await fetch(csrfUrl, {
			method: 'GET',
			headers: { Accept: 'application/json' },
		});
		// Extract XSRF-TOKEN from Set-Cookie header
		const setCookie = resp.headers.get('set-cookie');
		if (setCookie) {
			const match = setCookie.match(/XSRF-TOKEN=([^;]+)/);
			if (match) {
				return decodeURIComponent(match[1]);
			}
		}
		return null;
	} catch {
		return null;
	}
}

export async function pollQueuedOperation(
	cacheKey: string,
{
 	maxAttempts = 30,
 	intervalMs = 2000,
	csrfToken,
} = {} as { maxAttempts?: number; intervalMs?: number; csrfToken?: string | null }
) {
 	if (!cacheKey) throw new Error('cacheKey required for polling');
 	const pollUrl = `${apiBaseUrl}/api/router-operations/poll`;

 	for (let attempt = 0; attempt < maxAttempts; attempt++) {
 		try {
const pollHeaders: Record<string, string> = {
				'Content-Type': 'application/json',
			};
			if (csrfToken) {
				pollHeaders['X-XSRF-TOKEN'] = csrfToken;
			}

			const resp = await apiFetch(pollUrl, {
				method: 'POST',
				headers: pollHeaders,
 				body: JSON.stringify({ cache_key: cacheKey }),
 			});

 			// If non-json or error status, treat as retryable unless final
 			let json: any = null;
 			try {
 				json = await resp.json();
 			} catch (e) {
 				json = null;
 			}

 			if (json && typeof json === 'object') {
				// Detect the apiFetch network-error mock response — stop polling immediately
				if (json.error === 'Network request failed') {
					throw new Error('Network request failed — poll endpoint unreachable');
				}

				const status = (json.status || '').toString().toLowerCase();
				if (status === 'success') {
					// Prefer returning the data payload if present
					return json.data ?? json;
				}
				if (status === 'error' || status === 'failed') {
					throw new Error(json.error || json.message || 'Queued operation failed');
				}
				// Log the actual poll status for debugging
				console.log(
					'[pollQueuedOperation] attempt',
					attempt + 1,
					'status:',
					resp.status,
					'body:',
					JSON.stringify(json).slice(0, 200)
				);
			}
		} catch (e) {
			// Log and continue to retry until attempts exhausted
			console.warn('[pollQueuedOperation] attempt', attempt + 1, 'failed:', e);
		}

		// wait before next attempt
		await new Promise((r) => setTimeout(r, intervalMs));
	}

	throw new Error('Queued operation timed out');
}
