export function webOrigins(configuredOrigin: string | undefined, requestOrigin: string, production: boolean) {
  const origins = new Set<string>();
  if (!configuredOrigin) {
    if (!production) {
      origins.add("http://localhost:3000");
      origins.add("http://127.0.0.1:3000");
      origins.add(requestOrigin);
    }
    return origins;
  }

  const url = new URL(configuredOrigin.trim());
  if (!["http:", "https:"].includes(url.protocol)) return origins;
  origins.add(url.origin);
  const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (loopback) {
    if (!production) {
      for (const hostname of ["localhost", "127.0.0.1", "[::1]"]) {
        url.hostname = hostname;
        origins.add(url.origin);
      }
    }
  } else if (url.hostname.includes(".") && !/^[0-9.]+$/.test(url.hostname)) {
    url.hostname = url.hostname.startsWith("www.") ? url.hostname.slice(4) : "www." + url.hostname;
    origins.add(url.origin);
  }
  return origins;
}
