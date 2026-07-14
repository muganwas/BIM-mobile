import { apiFetch, registerAuthCallbacks, resetInterceptorState } from '@/helpers/api';

// Mock helpers to avoid expo-constants issues
jest.mock('@/helpers', () => ({
    ShowAlert: jest.fn(),
}));

// Mock API constant
jest.mock('@/constants/API', () => ({ apiBaseUrl: 'https://api.example' }));

describe('apiFetch Interceptor', () => {
    let mockFetch: jest.Mock;
    let onRefreshToken: jest.Mock;
    let onLogout: jest.Mock;

    beforeEach(() => {
        mockFetch = jest.fn();
        global.fetch = mockFetch;
        onRefreshToken = jest.fn();
        onLogout = jest.fn();
        registerAuthCallbacks({ onRefreshToken, onLogout });
        resetInterceptorState();
    });

    test('retries request on 401 if refresh succeeds', async () => {
        // First call returns 401
        mockFetch.mockResolvedValueOnce({
            status: 401,
            ok: false,
            json: async () => ({}),
            headers: new Map(),
        });
        // Second call (retry) returns 200
        mockFetch.mockResolvedValueOnce({
            status: 200,
            ok: true,
            json: async () => ({ success: true }),
            headers: new Map(),
        });

        onRefreshToken.mockResolvedValue('new-token');

        const res = await apiFetch('https://api.example/test');

        expect(onRefreshToken).toHaveBeenCalled();
        expect(mockFetch).toHaveBeenCalledTimes(2);
        
        // Check retry headers
        const retryCall = mockFetch.mock.calls[1];
        expect(retryCall[1].headers.Authorization).toBe('Bearer new-token');
        expect(res.status).toBe(200);
    });

    test('logs out on 401 if refresh fails', async () => {
        mockFetch.mockResolvedValueOnce({
            status: 401,
            ok: false,
            headers: new Map(),
        });

        onRefreshToken.mockResolvedValue(null);

        const res = await apiFetch('https://api.example/test');

        expect(onRefreshToken).toHaveBeenCalled();
        expect(onLogout).toHaveBeenCalled();
        expect(mockFetch).toHaveBeenCalledTimes(1); // No retry
        expect(res.status).toBe(401);
    });
    
    test('skips interceptor if X-Skip-Interceptor is present', async () => {
        mockFetch.mockResolvedValueOnce({
            status: 401,
            ok: false,
            headers: new Map(),
        });

        await apiFetch('https://api.example/test', {
            headers: { 'X-Skip-Interceptor': 'true' }
        });

        expect(onRefreshToken).not.toHaveBeenCalled();
        expect(mockFetch).toHaveBeenCalledTimes(1);
    });
});
