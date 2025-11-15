/* eslint-disable @typescript-eslint/no-require-imports */
/// <reference types="jest" />

jest.mock('@/constants/API', () => ({ apiBaseUrl: 'https://api.example' }));

const mockApiFetch = jest.fn(() =>
	Promise.resolve({ ok: true, json: async () => [] })
);
jest.mock('@/helpers/api', () => ({ apiFetch: mockApiFetch }));

const RouterService = require('@/services/RouterService');

describe('RouterService', () => {
	beforeEach(() => {
		mockApiFetch.mockClear();
	});

	test('fetchRouters calls apiFetch with correct url and headers', async () => {
		await RouterService.fetchRouters();
		expect(mockApiFetch).toHaveBeenCalledTimes(1);
		const [url, init] = mockApiFetch.mock.calls[0];
		expect(url).toBe('https://api.example/routers');
		expect(init.method).toBe('GET');
		expect(init.headers['Content-Type']).toBe('application/json');
		expect(init.headers.Authorization).toBeUndefined();
	});

	test('fetchRouters includes Authorization when token provided', async () => {
		await RouterService.fetchRouters('rtoken');
		expect(mockApiFetch).toHaveBeenCalledTimes(1);
		const [, init] = mockApiFetch.mock.calls[0];
		expect(init.headers.Authorization).toBe('Bearer rtoken');
	});
});
