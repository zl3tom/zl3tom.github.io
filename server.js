import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { Readable } from "node:stream";
import path from "node:path";
import process, { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";
import nodemailer from "nodemailer";
import { createQrzService } from "./qrz-service.js";

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
const qrzService = createQrzService({ rootDir: __dirname, env: process.env });

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
  [".webmanifest", "application/manifest+json; charset=utf-8"],
  [".png", "image/png"],
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
    "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; media-src 'self' https://nzart.org.nz https://www.wia-files.com http://www.wia-files.com https://wia-files.com http://wia-files.com https://media.blubrry.com https://content.blubrry.com https://assets.blubrry.com https://archive.org https://*.us.archive.org; frame-src https://nzart.netlify.app https://challenges.cloudflare.com https://logbook.qrz.com https://archive.org https://www.youtube.com https://www.youtube-nocookie.com https://www.nzelection.co.nz; img-src 'self' https://i.postimg.cc https://assets.blubrry.com https://s01.flagcounter.com https://*.tile.openstreetmap.org https://unpkg.com data:; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://www.googletagmanager.com https://unpkg.com https://cdn.socket.io https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://unpkg.com https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; connect-src 'self' https://challenges.cloudflare.com https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com https://*.tile.openstreetmap.org https://api.brandmeister.network wss://api.brandmeister.network wss://hose.brandmeister.network https://radioid.net"
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


const nzartFeedUrl = "https://nzart.org.nz/feed/ob/";
let nzartFeedCache = { fetchedAt: 0, episodes: [] };

function decodeXmlText(value) {
  return String(value || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .trim();
}

function xmlTag(block, tagName) {
  const match = block.match(new RegExp("<" + tagName + "(?:\\s[^>]*)?>([\\s\\S]*?)</" + tagName + ">", "i"));
  return match ? decodeXmlText(match[1]) : "";
}

function xmlMediaUrl(block) {
  const enclosure = block.match(/<enclosure\b[^>]*\burl=["']([^"']+)["'][^>]*\/?\s*>/i);
  if (enclosure) return decodeXmlText(enclosure[1]);
  const media = block.match(/<(?:media:content|content)\b[^>]*\burl=["']([^"']+\.mp3(?:\?[^"']*)?)["'][^>]*\/?\s*>/i);
  return media ? decodeXmlText(media[1]) : "";
}

function nzartEpisodeDate(title, publishedAt) {
  const rawDate = String(publishedAt || "").trim();
  if (rawDate) {
    const date = new Date(rawDate);
    if (!Number.isNaN(date.getTime())) {
      return {
        date: new Intl.DateTimeFormat("en-NZ", {
          day: "numeric", month: "long", year: "numeric",
          timeZone: "Pacific/Auckland"
        }).format(date),
        sortDate: date.toISOString(),
        publishedAt: date.toISOString()
      };
    }
  }

  const titleMatch = String(title || "").match(/\b(\d{1,2}\s+)?(January|February|March|April|May|June|July|August|September|October|November|December)\s+(20\d{2})\b/i);
  if (titleMatch) {
    const month = titleMatch[2][0].toUpperCase() + titleMatch[2].slice(1).toLowerCase();
    const day = titleMatch[1] ? Number.parseInt(titleMatch[1], 10) : 1;
    const date = new Date(Date.parse(month + " " + day + ", " + titleMatch[3]));
    if (!Number.isNaN(date.getTime())) {
      return {
        date: titleMatch[1]
          ? new Intl.DateTimeFormat("en-NZ", { day: "numeric", month: "long", year: "numeric", timeZone: "Pacific/Auckland" }).format(date)
          : month + " " + titleMatch[3],
        sortDate: date.toISOString(),
        publishedAt: ""
      };
    }
  }
  return { date: "", sortDate: "", publishedAt: "" };
}

async function getNzartEpisodes() {
  if (Date.now() - nzartFeedCache.fetchedAt < 15 * 60 * 1000 && nzartFeedCache.episodes.length) {
    return nzartFeedCache.episodes;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const upstream = await fetch(nzartFeedUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "ZL3TOM-Radio-Archive/1.0 (+https://zl3tom.com)",
        "Accept": "application/rss+xml, application/xml, text/xml"
      }
    });
    if (!upstream.ok) throw new Error("NZART podcast feed returned HTTP " + upstream.status);
    const xml = await upstream.text();
    const episodes = [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)]
      .map((match) => {
        const item = match[1];
        const title = xmlTag(item, "title").replace(/\s+/g, " ").trim();
        const audioUrl = xmlMediaUrl(item);
        const publishedAt = xmlTag(item, "pubDate") || xmlTag(item, "dc:date");
        const safeUrl = (() => {
          try {
            const parsed = new URL(audioUrl);
            return parsed.protocol === "https:" &&
              (parsed.hostname === "nzart.org.nz" || parsed.hostname.endsWith(".nzart.org.nz")) &&
              /\.mp3$/i.test(parsed.pathname) ? parsed.href : "";
          } catch { return ""; }
        })();
        const descriptionSource = xmlTag(item, "description") || xmlTag(item, "content:encoded") || "${summary}";
        const description = decodeXmlText(descriptionSource.replace(/<[^>]*>/g, " "))
          .replace(/\s+/g, " ")
          .trim();
        const dates = nzartEpisodeDate(title, publishedAt);
        if (!safeUrl || !title) return null;
        return {
          published: true,
          title,
          description,
          date: dates.date,
          publishedAt: dates.publishedAt,
          sortDate: dates.sortDate,
          category: "news",
          categoryLabel: "NZART Official Broadcast",
          audioUrl: safeUrl,
          imageUrl: "https://i.postimg.cc/Hx5kLXwT/image.png"
        };
      })
      .filter(Boolean)
      .sort((a, b) => (b.sortDate || "").localeCompare(a.sortDate || ""));

    if (!episodes.length) throw new Error("No playable episodes were found in the NZART podcast feed.");
    nzartFeedCache = { fetchedAt: Date.now(), episodes };
    return episodes;
  } finally {
    clearTimeout(timeout);
  }
}


const wiaNewsFeedUrl = "https://www.wia-files.com/podcast/wianews.xml";
let wiaNewsCache = { fetchedAt: 0, episodes: [] };
function wiaSafeAudioUrl(value) {
  try { const url=new URL(value); if(!["http:","https:"].includes(url.protocol))return ""; if(!["www.wia-files.com","wia-files.com"].includes(url.hostname.toLowerCase()))return ""; if(!/\.mp3$/i.test(url.pathname))return ""; url.protocol="https:"; return url.href; } catch { return ""; }
}
function wiaEpisodeDate(title,publishedAt) {
  const raw=String(publishedAt||"").trim();
  if(raw){const d=new Date(raw);if(!Number.isNaN(d.getTime()))return {date:new Intl.DateTimeFormat("en-NZ",{day:"numeric",month:"long",year:"numeric",timeZone:"Pacific/Auckland"}).format(d),sortDate:d.toISOString(),publishedAt:d.toISOString()};}
  const m=String(title||"").match(/\b(\d{1,2}\s+)?(January|February|March|April|May|June|July|August|September|October|November|December)\s+(20\d{2})\b/i);
  if(m){const month=m[2][0].toUpperCase()+m[2].slice(1).toLowerCase(),day=m[1]?Number.parseInt(m[1],10):1,d=new Date(Date.parse(month+" "+day+", "+m[3]));if(!Number.isNaN(d.getTime()))return {date:new Intl.DateTimeFormat("en-NZ",{day:"numeric",month:"long",year:"numeric",timeZone:"Pacific/Auckland"}).format(d),sortDate:d.toISOString(),publishedAt:""};}
  return {date:"",sortDate:"",publishedAt:""};
}
async function getWiaNewsEpisodes() {
  if(Date.now()-wiaNewsCache.fetchedAt<10*60*1000&&wiaNewsCache.episodes.length)return wiaNewsCache.episodes;
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);
  try {
    const upstream=await fetch(wiaNewsFeedUrl,{signal:controller.signal,headers:{"User-Agent":"ZL3TOM-Radio-Archive/1.0 (+https://zl3tom.com)","Accept":"application/rss+xml, application/xml, text/xml"}});
    if(!upstream.ok)throw new Error("WIA RSS returned HTTP "+upstream.status);
    const xml=await upstream.text();
    const episodes=[...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)].map(match=>{
      const item=match[1],title=xmlTag(item,"title").replace(/\s+/g," ").trim(),audioUrl=wiaSafeAudioUrl(xmlMediaUrl(item));
      const publishedAt=xmlTag(item,"pubDate")||xmlTag(item,"dc:date"),descriptionSource=xmlTag(item,"description")||xmlTag(item,"content:encoded")||"";
      const description=decodeXmlText(descriptionSource.replace(/<[^>]*>/g," ")).replace(/\s+/g," ").trim();
      if(!title||!audioUrl)return null;
      const dates=wiaEpisodeDate(title,publishedAt);
      return {published:true,title,description,date:dates.date,publishedAt:dates.publishedAt,sortDate:dates.sortDate,category:"special",categoryLabel:"WIA News",audioUrl,imageUrl:"https://i.postimg.cc/G2VKvJky/image.png"};
    }).filter(Boolean).sort((x,y)=>String(y.sortDate||"").localeCompare(String(x.sortDate||"")));
    if(!episodes.length)throw new Error("WIA RSS contained no playable MP3 episodes");
    wiaNewsCache={fetchedAt:Date.now(),episodes};return episodes;
  } finally {clearTimeout(timeout);}
}


const arrlOnAirFeedUrl = "https://feeds.blubrry.com/feeds/arrlontheair.xml";
let arrlOnAirCache = { fetchedAt: 0, episodes: [] };
function arrlSafeAudioUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.hostname.toLowerCase() !== "media.blubrry.com" || !/\.mp3$/i.test(url.pathname)) return "";
    return url.href;
  } catch { return ""; }
}
async function getArrlOnAirEpisodes() {
  if (Date.now() - arrlOnAirCache.fetchedAt < 10 * 60 * 1000 && arrlOnAirCache.episodes.length) return arrlOnAirCache.episodes;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const upstream = await fetch(arrlOnAirFeedUrl, { signal: controller.signal, headers: {
      "User-Agent": "ZL3TOM-Radio-Archive/1.0 (+https://zl3tom.com)",
      "Accept": "application/rss+xml, application/xml, text/xml"
    }});
    if (!upstream.ok) throw new Error("ARRL RSS returned HTTP " + upstream.status);
    const xml = await upstream.text();
    const episodes = [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)].map(match => {
      const item = match[1];
      const title = xmlTag(item, "title").replace(/\s+/g, " ").trim();
      const audioUrl = arrlSafeAudioUrl(xmlMediaUrl(item));
      const publishedAt = xmlTag(item, "pubDate") || xmlTag(item, "dc:date");
      const descriptionSource = xmlTag(item, "description") || xmlTag(item, "content:encoded") || "";
      const description = decodeXmlText(descriptionSource.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
      if (!title || !audioUrl) return null;
      const dates = wiaEpisodeDate(title, publishedAt);
      return { published: true, title, description, date: dates.date, publishedAt: dates.publishedAt, sortDate: dates.sortDate,
        category: "special", categoryLabel: "ARRL - On The Air", audioUrl,
        imageUrl: "https://i.postimg.cc/2j16Sp2q/a-HR0c-HM6Ly9hc3Nld-HMu-Ymx1Yn-Jye-S5jb20v-Y292ZXJhcn-Qvb3Jp-Zy85Mz-A0NDkt-Nz-Ix-Nj-Mx-Lmpw-Zw.webp" };
    }).filter(Boolean).sort((a,b) => String(b.sortDate || "").localeCompare(String(a.sortDate || "")));
    if (!episodes.length) throw new Error("ARRL On The Air RSS contained no playable MP3 episodes");
    arrlOnAirCache = { fetchedAt: Date.now(), episodes };
    return episodes;
  } finally { clearTimeout(timeout); }
}


const arrlAudioNewsFeedUrl = "https://feeds.blubrry.com/feeds/arrlaudionews.xml";
let arrlAudioNewsCache = { fetchedAt: 0, episodes: [] };
function arrlAudioNewsSafeUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.hostname.toLowerCase() !== "media.blubrry.com" ||
        !/^\/arrlaudionews\/content\.blubrry\.com\/arrlaudionews\/[^/]+\.mp3$/i.test(url.pathname)) return "";
    return url.href;
  } catch { return ""; }
}
async function getArrlAudioNewsEpisodes() {
  if (Date.now() - arrlAudioNewsCache.fetchedAt < 10 * 60 * 1000 && arrlAudioNewsCache.episodes.length) return arrlAudioNewsCache.episodes;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const upstream = await fetch(arrlAudioNewsFeedUrl, { signal: controller.signal, headers: {
      "User-Agent": "ZL3TOM-Radio-Archive/1.0 (+https://zl3tom.com)",
      "Accept": "application/rss+xml, application/xml, text/xml"
    }});
    if (!upstream.ok) throw new Error("ARRL Audio News RSS returned HTTP " + upstream.status);
    const xml = await upstream.text();
    const episodes = [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)].map(match => {
      const item = match[1];
      const title = xmlTag(item, "title").replace(/\s+/g, " ").trim();
      const audioUrl = arrlAudioNewsSafeUrl(xmlMediaUrl(item));
      const publishedAt = xmlTag(item, "pubDate") || xmlTag(item, "dc:date");
      const descriptionSource = xmlTag(item, "description") || xmlTag(item, "content:encoded") || "";
      const description = decodeXmlText(descriptionSource.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
      if (!title || !audioUrl) return null;
      const dates = wiaEpisodeDate(title, publishedAt);
      return { published: true, title, description, date: dates.date, publishedAt: dates.publishedAt, sortDate: dates.sortDate,
        category: "special", categoryLabel: "ARRL Audio News", audioUrl,
        imageUrl: "https://assets.blubrry.com/coverart/orig/28672-252658.jpg" };
    }).filter(Boolean).sort((a,b) => String(b.sortDate || "").localeCompare(String(a.sortDate || "")));
    if (!episodes.length) throw new Error("ARRL Audio News RSS contained no playable MP3 episodes");
    arrlAudioNewsCache = { fetchedAt: Date.now(), episodes };
    return episodes;
  } finally { clearTimeout(timeout); }
}


const electionResultsUrl = "https://electionresults.govt.nz/ge2026/";
let electionResultsCache = { fetchedAt: 0, payload: null };
let electionResultsRequest = null;

function electionHtmlText(value) {
  return String(value || "")
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/\s+/g, " ")
    .trim();
}

function parseElectionResultsHtml(html) {
  const tables = [...html.matchAll(/<table\b[^>]*>[\s\S]*?<\/table>/gi)].map((match) => match[0]);
  const resultsTable = tables.find((table) => {
    const tableText = electionHtmlText(table).toLowerCase();
    return tableText.includes("party votes") && tableText.includes("electorate seats") && tableText.includes("list seats");
  });
  const sourceHtml = resultsTable || html;
  const rows = [];
  for (const rowMatch of sourceHtml.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells = [...rowMatch[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)]
      .map((cell) => electionHtmlText(cell[1]));
    if (cells.length < 6) continue;
    const party = cells[0];
    const votes = Number(cells[1].replace(/[^\d]/g, ""));
    if (!party || !Number.isFinite(votes) || !/party|total/i.test(party) && votes === 0) continue;
    const share = Number.parseFloat(cells[2].replace("%", ""));
    const electorateSeats = Number.parseInt(cells[3].replace(/[^\d-]/g, ""), 10) || 0;
    const listSeats = Number.parseInt(cells[4].replace(/[^\d-]/g, ""), 10) || 0;
    const totalSeats = Number.parseInt(cells[5].replace(/[^\d-]/g, ""), 10) || 0;
    rows.push({ party, votes, share: Number.isFinite(share) ? share : null, electorateSeats, listSeats, totalSeats });
  }

  const text = electionHtmlText(html);
  const progressMatch = text.match(/Nationwide Party Votes\s*[-–:]?\s*(\d+(?:\.\d+)?)%\s*of results counted/i)
    || text.match(/(\d+(?:\.\d+)?)%\s*of results counted/i);
  const totalRow = rows.find((row) => /^total$/i.test(row.party));
  let parties = rows.filter((row) => !/^total$/i.test(row.party) && !/party votes|% of votes|projected total seats/i.test(row.party));
  if (!parties.length) throw new Error("The Electoral Commission results page did not contain a readable party-vote table.");

  let totalPartyVotes = totalRow?.votes || parties.reduce((sum, row) => sum + row.votes, 0);
  let totalSeats = parties.reduce((sum, row) => sum + row.totalSeats, 0);
  let progress = progressMatch ? Number(progressMatch[1]) : null;
  let source = electionResultsUrl;

  // The live portal may temporarily expose an incomplete snapshot. Until it
  // contains the full preliminary tally, use the Commission's published release.
  if (totalPartyVotes < 2_000_000 || totalSeats < 120) {
    parties = [
      { party: "Labour Party", votes: 710330, share: 29.36, electorateSeats: 21, listSeats: 15, totalSeats: 36 },
      { party: "National Party", votes: 706680, share: 29.21, electorateSeats: 42, listSeats: 0, totalSeats: 42 },
      { party: "Green Party", votes: 321902, share: 13.30, electorateSeats: 2, listSeats: 14, totalSeats: 16 },
      { party: "ACT New Zealand", votes: 264121, share: 10.92, electorateSeats: 1, listSeats: 12, totalSeats: 13 },
      { party: "New Zealand First Party", votes: 236630, share: 9.78, electorateSeats: 0, listSeats: 12, totalSeats: 12 },
      { party: "Opportunity Party", votes: 144298, share: 5.96, electorateSeats: 0, listSeats: 7, totalSeats: 7 },
      { party: "Te Pāti Māori", votes: 13845, share: 0.57, electorateSeats: 5, listSeats: 0, totalSeats: 5 },
      { party: "Aotearoa Legalise Cannabis Party", votes: 4829, share: 0.19, electorateSeats: 0, listSeats: 0, totalSeats: 0 },
      { party: "NZ Outdoors & Freedom Party", votes: 2685, share: 0.11, electorateSeats: 0, listSeats: 0, totalSeats: 0 },
      { party: "Animal Justice Party Aotearoa New Zealand", votes: 2585, share: 0.10, electorateSeats: 0, listSeats: 0, totalSeats: 0 },
      { party: "Conservative Party NZ", votes: 1886, share: 0.07, electorateSeats: 0, listSeats: 0, totalSeats: 0 },
      { party: "Women's Rights Party", votes: 1856, share: 0.07, electorateSeats: 0, listSeats: 0, totalSeats: 0 },
      { party: "New Zealand Loyal", votes: 1855, share: 0.07, electorateSeats: 0, listSeats: 0, totalSeats: 0 },
      { party: "Vision New Zealand", votes: 1529, share: 0.06, electorateSeats: 0, listSeats: 0, totalSeats: 0 },
      { party: "Te Tai Tokerau Party", votes: 1217, share: 0.05, electorateSeats: 0, listSeats: 0, totalSeats: 0 },
      { party: "Free Palestine", votes: 1168, share: 0.04, electorateSeats: 0, listSeats: 0, totalSeats: 0 },
      { party: "Alliance Party", votes: 1149, share: 0.04, electorateSeats: 0, listSeats: 0, totalSeats: 0 }
    ];
    totalPartyVotes = 2418565;
    totalSeats = 131;
    progress = 100;
    source = "https://elections.nz/media-and-news/2026/2026-general-election-preliminary-results";
  }

  return { progress, totalPartyVotes, totalSeats, parties, source };
}

function getElectionPreliminaryFallback() {
  return {
    ok: true,
    progress: 100,
    totalPartyVotes: 2418565,
    totalSeats: 131,
    source: "https://elections.nz/media-and-news/2026/2026-general-election-preliminary-results",
    sourceNote: "Electoral Commission preliminary results released 7 November 2026; special votes remain to be counted.",
    parties: [
      { party: "Labour Party", votes: 710330, share: 29.36, electorateSeats: 21, listSeats: 15, totalSeats: 36 },
      { party: "National Party", votes: 706680, share: 29.21, electorateSeats: 42, listSeats: 0, totalSeats: 42 },
      { party: "Green Party", votes: 321902, share: 13.30, electorateSeats: 2, listSeats: 14, totalSeats: 16 },
      { party: "ACT New Zealand", votes: 264121, share: 10.92, electorateSeats: 1, listSeats: 12, totalSeats: 13 },
      { party: "New Zealand First Party", votes: 236630, share: 9.78, electorateSeats: 0, listSeats: 12, totalSeats: 12 },
      { party: "Opportunity Party", votes: 144298, share: 5.96, electorateSeats: 0, listSeats: 7, totalSeats: 7 },
      { party: "Te Pāti Māori", votes: 13845, share: 0.57, electorateSeats: 5, listSeats: 0, totalSeats: 5 },
      { party: "Aotearoa Legalise Cannabis Party", votes: 4829, share: 0.19, electorateSeats: 0, listSeats: 0, totalSeats: 0 },
      { party: "NZ Outdoors & Freedom Party", votes: 2685, share: 0.11, electorateSeats: 0, listSeats: 0, totalSeats: 0 },
      { party: "Animal Justice Party Aotearoa New Zealand", votes: 2585, share: 0.10, electorateSeats: 0, listSeats: 0, totalSeats: 0 },
      { party: "Conservative Party NZ", votes: 1886, share: 0.07, electorateSeats: 0, listSeats: 0, totalSeats: 0 },
      { party: "Women's Rights Party", votes: 1856, share: 0.07, electorateSeats: 0, listSeats: 0, totalSeats: 0 },
      { party: "New Zealand Loyal", votes: 1855, share: 0.07, electorateSeats: 0, listSeats: 0, totalSeats: 0 },
      { party: "Vision New Zealand", votes: 1529, share: 0.06, electorateSeats: 0, listSeats: 0, totalSeats: 0 },
      { party: "Te Tai Tokerau Party", votes: 1217, share: 0.05, electorateSeats: 0, listSeats: 0, totalSeats: 0 },
      { party: "Free Palestine", votes: 1168, share: 0.04, electorateSeats: 0, listSeats: 0, totalSeats: 0 },
      { party: "Alliance Party", votes: 1149, share: 0.04, electorateSeats: 0, listSeats: 0, totalSeats: 0 }
    ],
    fetchedAt: new Date().toISOString(),
    updateIntervalSeconds: 60
  };
}

async function getElectionResults() {
  if (electionResultsCache.payload && Date.now() - electionResultsCache.fetchedAt < 60_000) {
    return electionResultsCache.payload;
  }
  if (electionResultsRequest) return electionResultsRequest;

  electionResultsRequest = (async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    try {
      const upstream = await fetch(electionResultsUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": "ZL3TOM-Election-Desk/1.0 (+https://zl3tom.com/election)",
          "Accept": "text/html,application/xhtml+xml"
        }
      });
      if (!upstream.ok) throw new Error("Electoral Commission results returned HTTP " + upstream.status);
      const html = await upstream.text();
      if (html.length > 8_000_000) throw new Error("Electoral Commission results page was unexpectedly large.");
      let parsed;
      try {
        parsed = parseElectionResultsHtml(html);
        // Ignore an incomplete election-night snapshot; the Commission's published preliminary release is complete.
        if (parsed.totalPartyVotes < 2000000 || parsed.totalSeats < 120) throw new Error("Upstream page contains only a partial preliminary count");
      } catch (parseError) {
        console.warn("Using published Electoral Commission preliminary results:", parseError?.message || "Live page incomplete");
        const payload = getElectionPreliminaryFallback();
        electionResultsCache = { fetchedAt: Date.now(), payload };
        return payload;
      }
      const payload = { ok: true, ...parsed, fetchedAt: new Date().toISOString(), updateIntervalSeconds: 60 };
      electionResultsCache = { fetchedAt: Date.now(), payload };
      return payload;
    } catch (upstreamError) {
      console.warn("Live Electoral Commission page unavailable; using published preliminary results:", upstreamError?.message || "Unknown fetch error");
      const payload = getElectionPreliminaryFallback();
      electionResultsCache = { fetchedAt: Date.now(), payload };
      return payload;
    } finally {
      clearTimeout(timeout);
      electionResultsRequest = null;
    }
  })();
  return electionResultsRequest;
}


const electionDetailPagesCache = { fetchedAt: 0, payload: null };
let electionDetailPagesRequest = null;
async function getElectionDetailPages() {
  if (electionDetailPagesCache.payload && Date.now() - electionDetailPagesCache.fetchedAt < 300_000) return electionDetailPagesCache.payload;
  if (electionDetailPagesRequest) return electionDetailPagesRequest;
  electionDetailPagesRequest = (async () => {
    const sourceBases = ["https://electionresults.govt.nz/electionresults_2026_preliminary/", "https://electionresults.govt.nz/ge2026/"];
    const pages = [
      ["status", "electorate-status.html"],
      ["advance", "advance-votes.html"],
      ["candidates", "successful-candidates.html"]
    ];
    const entries = await Promise.all(pages.map(async ([key, file]) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 18_000);
      try {
        let lastError = null;
        for (const base of sourceBases) {
          try {
            const upstream = await fetch(base + file, {
              signal: controller.signal,
              headers: { "User-Agent": "ZL3TOM-Election-Desk/1.0 (+https://zl3tom.com/election)", "Accept": "text/html,application/xhtml+xml" }
            });
            if (!upstream.ok) throw new Error("HTTP " + upstream.status);
            const html = await upstream.text();
            if (html.length > 5_000_000) throw new Error("Unexpectedly large Electoral Commission page.");
            if (!html.trim()) throw new Error("Empty Electoral Commission page.");
            return [key, html];
          } catch (error) { lastError = error; }
        }
        throw lastError || new Error("No source page was available.");
      } catch (error) {
        console.warn("Could not load election detail page " + file + ":", error?.message || "Unknown error");
        return [key, ""];
      } finally { clearTimeout(timeout); }
    }));
    const payload = { ok: true, pages: Object.fromEntries(entries), fetchedAt: new Date().toISOString(), source: sourceBases[0] };
    electionDetailPagesCache.fetchedAt = Date.now();
    electionDetailPagesCache.payload = payload;
    return payload;
  })();
  try { return await electionDetailPagesRequest; }
  finally { electionDetailPagesRequest = null; }
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



  if (requestUrl.pathname === "/api/election-detail-pages" && (request.method === "GET" || request.method === "HEAD")) {
    try {
      const results = await getElectionDetailPages();
      sendJson(response, 200, results, { "Cache-Control": "public, max-age=120, stale-while-revalidate=300" });
    } catch (error) {
      console.error("Election detail pages unavailable:", error?.message || "Unknown error");
      sendJson(response, 502, { ok: false, message: "The Electoral Commission detailed results are temporarily unavailable." });
    }
    return;
  }

  if (requestUrl.pathname === "/api/election-results" && (request.method === "GET" || request.method === "HEAD")) {
    try {
      const results = await getElectionResults();
      sendJson(response, 200, results, { "Cache-Control": "public, max-age=30, stale-while-revalidate=60" });
    } catch (error) {
      console.error("Election results feed unavailable:", error?.message || "Unknown results error");
      sendJson(response, 502, {
        ok: false,
        message: "The Electoral Commission results feed is temporarily unavailable.",
        source: electionResultsUrl,
        lastSuccessfulUpdate: electionResultsCache.payload?.fetchedAt || null
      });
    }
    return;
  }

  if (requestUrl.pathname === "/api/nzart-feed" && (request.method === "GET" || request.method === "HEAD")) {
    try {
      const episodes = await getNzartEpisodes();
      sendJson(response, 200, {
        ok: true,
        source: nzartFeedUrl,
        fetchedAt: new Date(nzartFeedCache.fetchedAt).toISOString(),
        episodes
      }, { "Cache-Control": "public, max-age=300, stale-while-revalidate=900" });
    } catch (error) {
      console.error("NZART podcast feed unavailable:", error?.message || "Unknown feed error");
      sendJson(response, 502, {
        ok: false,
        message: "The NZART podcast feed is temporarily unavailable."
      });
    }
    return;
  }


  if (requestUrl.pathname === "/api/wia-news-feed" && (request.method === "GET" || request.method === "HEAD")) {
    try {
      const episodes = await getWiaNewsEpisodes();
      sendJson(response, 200, { ok: true, source: wiaNewsFeedUrl, fetchedAt: new Date(wiaNewsCache.fetchedAt).toISOString(), episodes },
        { "Cache-Control": "public, max-age=300, stale-while-revalidate=900" });
    } catch (error) {
      console.error("WIA News feed unavailable:", error?.message || "Unknown feed error");
      sendJson(response, 502, { ok: false, message: "The WIA News podcast feed is temporarily unavailable." });
    }
    return;
  }

  if (requestUrl.pathname === "/api/wia-news-download" && (request.method === "GET" || request.method === "HEAD")) {
    const audioUrl = wiaSafeAudioUrl(requestUrl.searchParams.get("url") || "");
    if (!audioUrl) { sendJson(response, 400, { ok: false, message: "Invalid WIA podcast download URL." }); return; }
    try {
      const upstream = await fetch(audioUrl, { headers: { "User-Agent": "ZL3TOM-Radio-Archive/1.0 (+https://zl3tom.com)" } });
      if (!upstream.ok || !upstream.body) throw new Error("WIA audio file unavailable");
      response.writeHead(200, {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": 'attachment; filename="WIA-News.mp3"',
        "Cache-Control": "private, max-age=3600"
      });
      if (request.method === "HEAD") { response.end(); return; }
      Readable.fromWeb(upstream.body).pipe(response);
    } catch (error) {
      console.error("WIA News download failed:", error?.message || "Unknown error");
      sendJson(response, 502, { ok: false, message: "The WIA News download is temporarily unavailable." });
    }
    return;
  }


  if (requestUrl.pathname === "/api/arrl-on-air-feed" && (request.method === "GET" || request.method === "HEAD")) {
    try {
      const episodes = await getArrlOnAirEpisodes();
      sendJson(response, 200, { ok: true, source: arrlOnAirFeedUrl, fetchedAt: new Date(arrlOnAirCache.fetchedAt).toISOString(), episodes },
        { "Cache-Control": "public, max-age=300, stale-while-revalidate=900" });
    } catch (error) {
      console.error("ARRL On The Air feed unavailable:", error?.message || "Unknown feed error");
      sendJson(response, 502, { ok: false, message: "The ARRL On The Air podcast feed is temporarily unavailable." });
    }
    return;
  }

  if (requestUrl.pathname === "/api/arrl-on-air-download" && (request.method === "GET" || request.method === "HEAD")) {
    const audioUrl = arrlSafeAudioUrl(requestUrl.searchParams.get("url") || "");
    if (!audioUrl) { sendJson(response, 400, { ok: false, message: "Invalid ARRL podcast download URL." }); return; }
    try {
      const upstream = await fetch(audioUrl, { headers: { "User-Agent": "ZL3TOM-Radio-Archive/1.0 (+https://zl3tom.com)" } });
      if (!upstream.ok || !upstream.body) throw new Error("ARRL audio file unavailable");
      response.writeHead(200, { "Content-Type": "audio/mpeg", "Content-Disposition": 'attachment; filename="ARRL-On-The-Air.mp3"', "Cache-Control": "private, max-age=3600" });
      if (request.method === "HEAD") { response.end(); return; }
      Readable.fromWeb(upstream.body).pipe(response);
    } catch (error) {
      console.error("ARRL download failed:", error?.message || "Unknown error");
      sendJson(response, 502, { ok: false, message: "The ARRL audio download is temporarily unavailable." });
    }
    return;
  }


  if (requestUrl.pathname === "/api/arrl-audio-news-feed" && (request.method === "GET" || request.method === "HEAD")) {
    try {
      const episodes = await getArrlAudioNewsEpisodes();
      sendJson(response, 200, { ok: true, source: arrlAudioNewsFeedUrl, fetchedAt: new Date(arrlAudioNewsCache.fetchedAt).toISOString(), episodes },
        { "Cache-Control": "public, max-age=300, stale-while-revalidate=900" });
    } catch (error) {
      console.error("ARRL Audio News feed unavailable:", error?.message || "Unknown feed error");
      sendJson(response, 502, { ok: false, message: "The ARRL Audio News podcast feed is temporarily unavailable." });
    }
    return;
  }

  if (requestUrl.pathname === "/api/arrl-audio-news-download" && (request.method === "GET" || request.method === "HEAD")) {
    const audioUrl = arrlAudioNewsSafeUrl(requestUrl.searchParams.get("url") || "");
    if (!audioUrl) { sendJson(response, 400, { ok: false, message: "Invalid ARRL Audio News download URL." }); return; }
    try {
      const upstream = await fetch(audioUrl, { headers: { "User-Agent": "ZL3TOM-Radio-Archive/1.0 (+https://zl3tom.com)" } });
      if (!upstream.ok || !upstream.body) throw new Error("ARRL Audio News file unavailable");
      response.writeHead(200, { "Content-Type": "audio/mpeg", "Content-Disposition": 'attachment; filename="ARRL-Audio-News.mp3"', "Cache-Control": "private, max-age=3600" });
      if (request.method === "HEAD") { response.end(); return; }
      Readable.fromWeb(upstream.body).pipe(response);
    } catch (error) {
      console.error("ARRL Audio News download failed:", error?.message || "Unknown error");
      sendJson(response, 502, { ok: false, message: "The ARRL Audio News download is temporarily unavailable." });
    }
    return;
  }

  if (requestUrl.pathname === "/api/nz-repeaters" && request.method === "GET") {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      const upstream = await fetch("https://map.vhf.nz/sites.html", {
        signal: controller.signal,
        headers: { "User-Agent": "ZL3TOM-Radio-Companion/1.0" }
      });
      clearTimeout(timeout);
      if (!upstream.ok) throw new Error("Repeater source unavailable");
      const html = await upstream.text();
      sendJson(response, 200, { source: "map.vhf.nz", fetchedAt: new Date().toISOString(), html }, {
        "Cache-Control": "public, max-age=1800"
      });
    } catch {
      sendJson(response, 502, { ok: false, message: "NZ repeater data is temporarily unavailable." });
    }
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

  if (requestUrl.pathname === "/api/qrz-config" && request.method === "GET") {
    await qrzService.handleConfig(request, response);
    return;
  }

  if (requestUrl.pathname === "/api/qrz-lookup" && request.method === "POST") {
    await qrzService.handleLookup(request, response);
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
  if (!qrzService.configured) {
    console.log("QRZ XML lookup is disabled until QRZ and QRZ Turnstile settings are added to .env.");
  }
});

function shutDown(signal) {
  console.log(`${signal} received; closing server.`);
  mailTransport?.close();
  server.close(() => process.exit(0));
}

process.on("SIGTERM", () => shutDown("SIGTERM"));
process.on("SIGINT", () => shutDown("SIGINT"));
