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
  const base = import.meta.env.VITE_API_URL || "/api/v1";
  try {
    const response = await fetch(`${base}${path}`, {
      ...options,
      credentials: "include",
      signal: options.signal ?? AbortSignal.timeout(6000),
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...options.headers,
      },
    });

    let body: any;
    try {
      body = await response.json();
    } catch {
      throw new ApiError(response.ok ? "OK" : "INTERNAL_ERROR");
    }

    if (!response.ok || (body && body.success === false)) {
      throw new ApiError(body?.code || "INTERNAL_ERROR");
    }

    return (body && typeof body === "object" && "data" in body ? body.data : body) as T;
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError("NETWORK_ERROR");
  }
}
