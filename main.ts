import { serveDir } from "jsr:@std/http/file-server";

const securityHeaders: Record<string, string> = {
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "Content-Security-Policy":
    "default-src 'self'; " +
    "script-src 'self'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' data: https://fonts.gstatic.com; " +
    "img-src 'self' data:; " +
    "connect-src 'self' https://beta.pokeapi.co; " +
    "object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",    "default-src 'self'; " +
    "script-src 'self'; " +
    "style-src 'self'; " +
    "font-src 'self' data:; " +
    "img-src 'self' data: https://raw.githubusercontent.com; " +
    "connect-src 'self' https://pokeapi.co; " +
    "object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
};

Deno.serve(async (req) => {
  let res = await serveDir(req, { fsRoot: "./public", quiet: true });
  const lastSegment = new URL(req.url).pathname.split("/").pop() ?? "";
  if (res.status === 404 && !lastSegment.includes(".")) {
    const url = new URL(req.url);
    url.pathname = "/index.html";
    res = await serveDir(new Request(url, req), { fsRoot: "./public", quiet: true });
  }
  const headers = new Headers(res.headers);
  for (const [k, v] of Object.entries(securityHeaders)) headers.set(k, v);
  return new Response(res.body, { status: res.status, headers });
});