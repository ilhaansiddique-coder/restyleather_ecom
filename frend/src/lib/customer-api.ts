export type Customer = { id: number; name: string; email: string; role: string };

export async function customerRequest(path: string, data?: Record<string, FormDataEntryValue>) {
  const endpoint = path === "login" ? "/api/v1/auth/web-login" : "/api/v1/customer/auth/" + path;
  const response = await fetch(endpoint, {
    method: path === "me" ? "GET" : "POST",
    headers: data ? { "Content-Type": "application/json" } : undefined,
    body: data ? JSON.stringify(data) : undefined,
    cache: "no-store",
  });
  const result = await response.json() as { data?: { user: Customer | null }; error?: string };
  return { status: response.status, user: result.data?.user, error: result.error };
}
