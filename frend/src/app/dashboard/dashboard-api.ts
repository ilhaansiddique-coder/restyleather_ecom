export async function dashboardRequest<T = unknown>(path: string, method = "GET", data?: unknown): Promise<T> {
  const response = await fetch("/api/v1" + path, { method, headers: data ? { "Content-Type": "application/json" } : undefined, body: data ? JSON.stringify(data) : undefined });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error ?? "Request failed.");
  return result.data;
}
