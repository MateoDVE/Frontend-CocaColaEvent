import { errorMessages, type ApiEnvelope } from "@cocacola-ei/contracts";
export class ApiError extends Error {
  constructor(public code: string) {
    super(errorMessages[code] ?? errorMessages.INTERNAL_ERROR);
  }
}
// Integration boundary. No production request is made by the demo adapter.
export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  accessToken?: string,
): Promise<T> {
  const base = import.meta.env.VITE_API_URL;
  if (!base) throw new ApiError("NETWORK_ERROR");
  const response = await fetch(`${base}${path}`, {
    ...options,
    credentials: "include",
    signal: options.signal ?? AbortSignal.timeout(4000),
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  });
  const body = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || !body.success) throw new ApiError(body.code);
  return body.data;
}
