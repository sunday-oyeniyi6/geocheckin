export const push = jest.fn();
export const replace = jest.fn();
export let searchParams = new URLSearchParams();

export function setSearchParams(query: string): void {
  searchParams = new URLSearchParams(query);
}

export function mockFetchResponse(status: number, body?: unknown): jest.Mock {
  const mock = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });
  global.fetch = mock;
  return mock;
}

export function mockFetchNetworkError(): jest.Mock {
  const mock = jest.fn().mockRejectedValue(new TypeError("Failed to fetch"));
  global.fetch = mock;
  return mock;
}
