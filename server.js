import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import process, { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";
import nodemailer from "nodemailer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

try {
  loadEnvFile(path.join(__dirname, ".env"));
} catch (error) {
  if (error?.code !== "ENOENT") {
    console.warn("Could not load .env; continuing with system environment variables.");
  }
}

const publicDirectory = path.join(__dirname, "public");
const port = Number.parseInt(process.env.PORT || "3000", 10);
const host = process.env.HOST || "127.0.0.1";
const smtpHost = process.env.SMTP_HOST || "smtp.fastmail.com";
const smtpPort = Number.parseInt(process.env.SMTP_PORT || "465", 10);
const smtpSecure = (process.env.SMTP_SECURE || "true").toLowerCase() !== "false";
const smtpUser = process.env.SMTP_USER || "";
const smtpPass = process.env.SMTP_PASS || "";
const contactTo = process.env.CONTACT_TO || smtpUser || "thomas@zl3tom.com";
const contactFrom = process.env.CONTACT_FROM || smtpUser || "thomas@zl3tom.com";
const turnstileSiteKey = process.env.TURNSTILE_SITE_KEY || "";
const turnstileSecret = process.env.TURNSTILE_SECRET || "";
const contactMaxPerHour = Math.max(
  1,
  Number.parseInt(process.env.CONTACT_MAX_PER_HOUR || "5", 10) || 5
);
const turnstileAllowedHostnames = new Set(
  (process.env.TURNSTILE_ALLOWED_HOSTNAMES || "zl3tom.com,www.zl3tom.com")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
);
const allowedOrigins = new Set([
  "https://zl3tom.com",
  "https://www.zl3tom.com",
  "http://localhost:3000",
  "http://127.0.0.1:3000"
]);
const contactConfigured = Boolean(
  smtpUser && smtpPass && turnstileSiteKey && turnstileSecret
);
const contactAttempts = new Map();

const mailTransport = smtpUser && smtpPass
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: { user: smtpUser, pass: smtpPass },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000
    })
  : null;

const contentTypes = new Map([
  [".avif", "image/avif"],
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".xml", "application/xml; charset=utf-8"]
]);

const topicLabels = new Map([
  ["qsl", "QSL request"],
  ["radio", "Amateur radio question"],
  ["website", "Website feedback"],
  ["other", "Other"]
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
    "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; frame-src https://challenges.cloudflare.com https://logbook.qrz.com; img-src 'self' https://i.postimg.cc https://s01.flagcounter.com data:; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; connect-src 'self' https://challenges.cloudflare.com"
  );
}

function sendJson(response, statusCode, payload, extraHeaders = {}) {
  const body = JSON.stringify(payload);
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store",
    ...extraHeaders
  });
  response.end(body);
}

function clientIp(request) {
  const cloudflareIp = request.headers["cf-connecting-ip"];
  if (typeof cloudflareIp === "string" && cloudflareIp.trim()) {
    return cloudflareIp.trim();
  }

  const forwardedFor = request.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return forwardedFor.split(",")[0].trim();
  }

  return request.socket.remoteAddress || "unknown";
}

function isAllowedOrigin(request) {
  const origin = request.headers.origin;
  return !origin || allowedOrigins.has(origin);
}

function isRateLimited(ipAddress) {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;

  for (const [key, timestamps] of contactAttempts) {
    const recent = timestamps.filter((timestamp) => timestamp > oneHourAgo);
    if (recent.length === 0) contactAttempts.delete(key);
    else if (recent.length !== timestamps.length) contactAttempts.set(key, recent);
  }

  const attempts = contactAttempts.get(ipAddress) || [];
  if (attempts.length >= contactMaxPerHour) return true;
  attempts.push(now);
  contactAttempts.set(ipAddress, attempts);
  return false;
}

async function readJsonBody(request) {
  const chunks = [];
  let size = 0;

  for await (const chunk of request) {
    size += chunk.length;
    if (size > 32 * 1024) {
      const error = new Error("Request body is too large.");
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
  } catch {
    const error = new Error("The form data was not valid JSON.");
    error.statusCode = 400;
    throw error;
  }
}

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function validateContactForm(body) {
  const name = cleanText(body.name);
  const email = cleanText(body.email).toLowerCase();
  const callsign = cleanText(body.callsign).toUpperCase();
  const topic = cleanText(body.topic);
  const message = cleanText(body.message);
  const turnstileToken = cleanText(body.turnstileToken);
  const website = cleanText(body.website);
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const callsignPattern = /^[A-Z0-9/-]*$/;

  if (website) return { honeypot: true };
  if (name.length < 2 || name.length > 80) {
    return { error: "Please enter your name (2–80 characters)." };
  }
  if (email.length > 254 || !emailPattern.test(email)) {
    return { error: "Please enter a valid email address." };
  }
  if (callsign.length > 20 || !callsignPattern.test(callsign)) {
    return { error: "Please enter a valid callsign, or leave it blank." };
  }
  if (!topicLabels.has(topic)) {
    return { error: "Please choose a topic." };
  }
  if (message.length < 10 || message.length > 5000) {
    return { error: "Please enter a message between 10 and 5,000 characters." };
  }
  if (!turnstileToken) {
    return { error: "Please complete the security check." };
  }

  return { name, email, callsign, topic, message, turnstileToken };
}

async function verifyTurnstile(token, ipAddress) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const parameters = new URLSearchParams({
      secret: turnstileSecret,
      response: token,
      remoteip: ipAddress
    });
    const verificationResponse = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: parameters,
        signal: controller.signal
      }
    );
    const result = await verificationResponse.json();
    const verifiedHostname = cleanText(result.hostname).toLowerCase();
    return result.success === true && turnstileAllowedHostnames.has(verifiedHostname);
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  })[character]);
}

function formatNewZealandDateTime(date) {
  const time = new Intl.DateTimeFormat("en-NZ", {
    timeZone: "Pacific/Auckland",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short"
  })
    .format(date)
    .replace(/\b(am|pm)\b/gi, (value) => value.toUpperCase());
  const calendarDate = new Intl.DateTimeFormat("en-NZ", {
    timeZone: "Pacific/Auckland",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);

  return `${time} — ${calendarDate}`;
}

async function handleContactSubmission(request, response) {
  if (!contactConfigured || !mailTransport) {
    sendJson(response, 503, {
      ok: false,
      message: "The contact form is being connected. Please email thomas@zl3tom.com for now."
    });
    return;
  }

  if (!isAllowedOrigin(request)) {
    sendJson(response, 403, { ok: false, message: "This request was not accepted." });
    return;
  }

  let body;
  try {
    body = await readJsonBody(request);
  } catch (error) {
    sendJson(response, error.statusCode || 400, { ok: false, message: error.message });
    return;
  }

  const form = validateContactForm(body);
  if (form.honeypot) {
    sendJson(response, 200, { ok: true, message: "Thanks—your message has been sent to Thomas." });
    return;
  }
  if (form.error) {
    sendJson(response, 400, { ok: false, message: form.error });
    return;
  }

  const ipAddress = clientIp(request);
  if (isRateLimited(ipAddress)) {
    sendJson(
      response,
      429,
      { ok: false, message: "Too many messages were sent. Please try again in about an hour." },
      { "Retry-After": "3600" }
    );
    return;
  }

  if (!(await verifyTurnstile(form.turnstileToken, ipAddress))) {
    sendJson(response, 400, {
      ok: false,
      message: "The security check expired or failed. Please try it again."
    });
    return;
  }

  const topicLabel = topicLabels.get(form.topic);
  const subjectIdentity = form.callsign || form.name;
  const sentAt = formatNewZealandDateTime(new Date());
  const textBody = [
    "New message from zl3tom.com",
    "",
    `Name: ${form.name}`,
    `Email: ${form.email}`,
    `Callsign: ${form.callsign || "Not supplied"}`,
    `Topic: ${topicLabel}`,
    `Received: ${sentAt}`,
    "",
    "Message:",
    form.message
  ].join("\n");
  const htmlBody = `
    <h2>New message from zl3tom.com</h2>
    <p><strong>Name:</strong> ${escapeHtml(form.name)}<br>
    <strong>Email:</strong> ${escapeHtml(form.email)}<br>
    <strong>Callsign:</strong> ${escapeHtml(form.callsign || "Not supplied")}<br>
    <strong>Topic:</strong> ${escapeHtml(topicLabel)}<br>
    <strong>Received:</strong> ${escapeHtml(sentAt)}</p>
    <h3>Message</h3>
    <p>${escapeHtml(form.message).replace(/\n/g, "<br>")}</p>`;

  try {
    await mailTransport.sendMail({
      from: `"ZL3TOM Website" <${contactFrom}>`,
      to: contactTo,
      replyTo: { name: form.name, address: form.email },
      subject: `[ZL3TOM website] ${topicLabel} — ${subjectIdentity}`,
      text: textBody,
      html: htmlBody
    });
    sendJson(response, 200, {
      ok: true,
      message: "Thanks—your message has been sent to Thomas."
    });
  } catch (error) {
    console.error("Contact email could not be sent:", error?.message || "Unknown mail error");
    sendJson(response, 502, {
      ok: false,
      message: "The message could not be sent just now. Please email thomas@zl3tom.com instead."
    });
  }
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
  const requestUrl = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);

  if (requestUrl.pathname === "/healthz" && (request.method === "GET" || request.method === "HEAD")) {
    const body = JSON.stringify({ status: "ok", site: "ZL3TOM" });
    response.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Length": Buffer.byteLength(body),
      "Cache-Control": "no-store"
    });
    response.end(request.method === "HEAD" ? undefined : body);
    return;
  }

  if (requestUrl.pathname === "/api/contact-config" && request.method === "GET") {
    sendJson(response, 200, {
      enabled: contactConfigured,
      siteKey: contactConfigured ? turnstileSiteKey : ""
    });
    return;
  }

  if (requestUrl.pathname === "/api/contact" && request.method === "POST") {
    await handleContactSubmission(request, response);
    return;
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, {
      "Content-Type": "text/plain; charset=utf-8",
      "Allow": "GET, HEAD"
    });
    response.end("Method not allowed");
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
  if (!contactConfigured) {
    console.log("Contact form is visible but disabled until SMTP and Turnstile settings are added to .env.");
  }
});

function shutDown(signal) {
  console.log(`${signal} received; closing server.`);
  mailTransport?.close();
  server.close(() => process.exit(0));
}

process.on("SIGTERM", () => shutDown("SIGTERM"));
process.on("SIGINT", () => shutDown("SIGINT"));
