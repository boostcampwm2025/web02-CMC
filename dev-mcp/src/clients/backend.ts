function getBackendUrl(): string {
  return process.env.BACKEND_URL || 'http://localhost:3000';
}

export async function postBackend<TBody extends object, TResponse = unknown>(
  path: string,
  body: TBody,
): Promise<TResponse> {
  const url = `${getBackendUrl()}${path}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`백엔드 응답 ${response.status}: ${text || response.statusText}`);
  }
  return text ? (JSON.parse(text) as TResponse) : ({} as TResponse);
}
