const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {})
    },
    ...options
  });

  if (res.status === 204) {
    return undefined as T;
  }

  if (!res.ok) {
    const text = await res.text();
    const error = new Error(text || "Request failed");
    (error as any).status = res.status;
    throw error;
  }

  return res.json();
}

export const ClientCommunicator = {
  get<T>(path: string): Promise<T> {
    return request<T>(path);
  },
  post<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, {
      method: "POST",
      body: body != null ? JSON.stringify(body) : undefined
    });
  },
  put<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, {
      method: "PUT",
      body: body != null ? JSON.stringify(body) : undefined
    });
  },
  patch<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, {
      method: "PATCH",
      body: body != null ? JSON.stringify(body) : undefined
    });
  },
  delete<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, {
      method: "DELETE",
      body: body != null ? JSON.stringify(body) : undefined
    });
  }
};

