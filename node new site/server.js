import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDirectory = path.join(__dirname, "public");
const port = Number.parseInt(process.env.PORT || "3000", 10);
const host = process.env.HOST || "127.0.0.1";

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".xml", "application/xml; charset=utf-8"]
]);

function setSecurityHeaders(response) {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "SAMEORIGIN");
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  response.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()"
  );
  response.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; img-src 'self' https://i.postimg.cc https://s01.flagcounter.com data:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self'"
  );
}

async function firstExistingFile(relativePath) {
  const candidates = relativePath === ""
    ? ["index.html"]
    : path.extname(relativePath)
      ? [relativePath]
      : [path.join(relativePath, "index.html"), `${relativePath}.html`];

  for (const candidate of candidates) {
    const resolved = path.resolve(publicDirectory, candidate);
    if (!resolved.startsWith(`${publicDirectory}${path.sep}`)) continue;

    try {
      const details = await stat(resolved);
      if (details.isFile()) return { filePath: resolved, details };
    } catch {
      // Try the next friendly-URL candidate.
    }
  }

  return null;
}

function sendFile(request, response, filePath, details, statusCode = 200) {
  const extension = path.extname(filePath).toLowerCase();
  const contentType = contentTypes.get(extension) || "application/octet-stream";
  const isHtml = extension === ".html";

  response.writeHead(statusCode, {
    "Content-Type": contentType,
    "Content-Length": details.size,
    "Cache-Control": isHtml
      ? "public, max-age=0, must-revalidate"
      : "public, max-age=3600",
    "Vary": "Accept-Encoding"
  });

  if (request.method === "HEAD") {
    response.end();
    return;
  }

  createReadStream(filePath).pipe(response);
}

const server = createServer(async (request, response) => {
  setSecurityHeaders(response);

  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { "Content-Type": "text/plain; charset=utf-8", "Allow": "GET, HEAD" });
    response.end("Method not allowed");
    return;
  }

  const requestUrl = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);

  if (requestUrl.pathname === "/healthz") {
    const body = JSON.stringify({ status: "ok", site: "ZL3TOM" });
    response.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Length": Buffer.byteLength(body),
      "Cache-Control": "no-store"
    });
    response.end(request.method === "HEAD" ? undefined : body);
    return;
  }

  let relativePath;
  try {
    relativePath = decodeURIComponent(requestUrl.pathname).replace(/^\/+/, "");
  } catch {
    response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Bad request");
    return;
  }

  const result = await firstExistingFile(relativePath);
  if (result) {
    sendFile(request, response, result.filePath, result.details);
    return;
  }

  const notFoundPath = path.join(publicDirectory, "404.html");
  try {
    const details = await stat(notFoundPath);
    sendFile(request, response, notFoundPath, details, 404);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Page not found");
  }
});

server.listen(port, host, () => {
  console.log(`ZL3TOM website listening on http://${host}:${port}`);
});

function shutDown(signal) {
  console.log(`${signal} received; closing server.`);
  server.close(() => process.exit(0));
}

process.on("SIGTERM", () => shutDown("SIGTERM"));
process.on("SIGINT", () => shutDown("SIGINT"));
