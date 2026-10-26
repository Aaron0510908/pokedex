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
    "object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
};

const PREFIX = "/pokedex-angular";

Deno.serve(async (req) => {
  // La app pide sus recursos bajo /pokedex-angular/ (ruta de GitHub Pages).
  // Se quita ese prefijo para encontrar los archivos en la raíz de public.
  const original = new URL(req.url);
  let request = req;
  if (original.pathname === PREFIX || original.pathname.startsWith(PREFIX + "/")) {
    original.pathname = original.pathname.slice(PREFIX.length) || "/";
    request = new Request(original, req);
  }

  let res = await serveDir(request, { fsRoot: "./public", quiet: true });
  const lastSegment = new URL(request.url).pathname.split("/").pop() ?? "";
  if (res.status === 404 && !lastSegment.includes(".")) {
    const url = new URL(request.url);
    url.pathname = "/index.html";
    res = await serveDir(new Request(url, request), { fsRoot: "./public", quiet: true });
  }

  const headers = new Headers(res.headers);
  for (const [k, v] of Object.entries(securityHeaders)) headers.set(k, v);
  return new Response(res.body, { status: res.status, headers });
});