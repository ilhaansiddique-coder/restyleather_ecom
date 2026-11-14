import assert from "node:assert/strict";
import test from "node:test";
import { webOrigins } from "../src/server/web-origins";

test("production accepts the configured origin and its www counterpart only", () => {
  for (const configured of ["https://restyleleather.com/", "https://www.restyleleather.com"]) {
    const origins = webOrigins(configured, "http://127.0.0.1:3001", true);
    assert.equal(origins.has("https://restyleleather.com"), true);
    assert.equal(origins.has("https://www.restyleleather.com"), true);
    for (const blocked of ["https://evil.example", "https://restyleleather.com.evil.example", "https://shop.restyleleather.com", "http://restyleleather.com", "https://restyleleather.com:8443", "null", "http://127.0.0.1:3001"]) {
      assert.equal(origins.has(blocked), false, blocked);
    }
  }
});

test("loopback aliases keep their scheme and port and are development only", () => {
  const origins = webOrigins("http://localhost:3000", "http://localhost:3001", false);
  assert.equal(origins.has("http://127.0.0.1:3000"), true);
  assert.equal(origins.has("http://[::1]:3000"), true);
  assert.equal(origins.has("http://localhost:3001"), false);
  assert.equal(webOrigins(undefined, "http://localhost:3001", true).size, 0);
  assert.deepEqual([...webOrigins("http://127.0.0.1:3000", "", true)], ["http://127.0.0.1:3000"]);
});
