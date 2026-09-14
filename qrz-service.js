import { createHash, createHmac, randomBytes } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const QRZ_ENDPOINT = "https://xmldata.qrz.com/xml/current/";
const TURNSTILE_ENDPOINT = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const AGENT = "ZL3TOM-Web-Callsign-Lookup/1.0";
const COOKIE_NAME = "zl3tom_qrz_id";
const HOME_LAT = -43.5321;
const HOME_LON = 172.6362;

function intSetting(env, name, fallback, minimum = 1) {
  const value = Number.parseInt(env[name] || String(fallback), 10);
  return Number.isFinite(value) ? Math.max(minimum, value) : fallback;
}

function xmlDecode(value = "") {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function xmlBlock(xml, tag) {
  const safe = escapeRegExp(tag);
  return xml.match(new RegExp(`<${safe}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${safe}>`, "i"))?.[1] || "";
}

function xmlValue(xml, tag) {
  const safe = escapeRegExp(tag);
  const value = xml.match(new RegExp(`<${safe}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${safe}>`, "i"))?.[1];
  return value == null ? "" : xmlDecode(value.trim());
}

function yesNo(value) {
  const normal = String(value || "").trim().toLowerCase();
  if (["1", "y", "yes", "true"].includes(normal)) return "Yes";
  if (["0", "n", "no", "false"].includes(normal)) return "No";
  return "";
}

function toRadians(value) {
  return value * Math.PI / 180;
}

function distanceAndBearing(lat, lon) {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return {};
  const phi1 = toRadians(HOME_LAT);
  const phi2 = toRadians(lat);
  const deltaPhi = toRadians(lat - HOME_LAT);
  const deltaLambda = toRadians(lon - HOME_LON);
  const a = Math.sin(deltaPhi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;
  const distanceKm = Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
  const bearing = Math.round((Math.atan2(y, x) * 180 / Math.PI + 360) % 360);
  return { distanceKm, bearing };
}

function safeCallsign(value) {
  const callsign = typeof value === "string" ? value.trim().toUpperCase().replace(/\s+/g, "") : "";
  if (callsign.length < 3 || callsign.length > 20) return "";
  if (!/^[A-Z0-9][A-Z0-9/-]*[A-Z0-9]$/.test(callsign)) return "";
  if (!/[A-Z]/.test(callsign) || !/[0-9]/.test(callsign)) return "";
  return callsign;
}

function parseCookies(header = "") {
  const result = new Map();
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index <= 0) continue;
    result.set(part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1).trim()));
  }
  return result;
}

function timingSafeStringEqual(left, right) {
  const a = Buffer.from(left || "");
  const b = Buffer.from(right || "");
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let index = 0; index < a.length; index += 1) difference |= a[index] ^ b[index];
  return difference === 0;
}

function hashIdentifier(value) {
  return createHash("sha256").update(String(value)).digest("hex");
}

function sendJson(response, statusCode, payload, headers = {}) {
  const body = JSON.stringify(payload);
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store",
    ...headers
  });
  response.end(body);
}

async function readJson(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 8 * 1024) throw Object.assign(new Error("Request body is too large."), { statusCode: 413 });
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
  } catch {
    throw Object.assign(new Error("The lookup request was not valid JSON."), { statusCode: 400 });
  }
}

function requestIp(request) {
  const cloudflare = request.headers["cf-connecting-ip"];
  if (typeof cloudflare === "string" && cloudflare.trim()) return cloudflare.trim();
  const forwarded = request.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) return forwarded.split(",")[0].trim();
  return request.socket.remoteAddress || "unknown";
}

function allowedOrigin(request) {
  const origin = request.headers.origin;
  return !origin || ["https://zl3tom.com", "https://www.zl3tom.com", "http://localhost:3000", "http://127.0.0.1:3000"].includes(origin);
}

export function createQrzService({ rootDir, env = process.env }) {
  const username = env.QRZ_USERNAME || "";
  const password = env.QRZ_PASSWORD || "";
  const siteKey = env.QRZ_TURNSTILE_SITE_KEY || "";
  const turnstileSecret = env.QRZ_TURNSTILE_SECRET_KEY || "";
  const configured = Boolean(username && password && siteKey && turnstileSecret);
  const cacheHours = intSetting(env, "QRZ_CACHE_HOURS", 24);
  const negativeMinutes = intSetting(env, "QRZ_NOT_FOUND_CACHE_MINUTES", 15);
  const cookieDays = intSetting(env, "QRZ_BROWSER_COOKIE_DAYS", 30);
  const limitMinute = intSetting(env, "QRZ_RATE_MINUTE", 5);
  const limitHour = intSetting(env, "QRZ_RATE_HOUR", 30);
  const limitDay = intSetting(env, "QRZ_RATE_DAY", 100);
  const globalHour = intSetting(env, "QRZ_GLOBAL_RATE_HOUR", 300);
  const hostnames = new Set((env.QRZ_TURNSTILE_ALLOWED_HOSTNAMES || "zl3tom.com,www.zl3tom.com")
    .split(",").map((item) => item.trim().toLowerCase()).filter(Boolean));
  const cookieKey = createHash("sha256").update(`zl3tom-qrz-cookie:${turnstileSecret}`).digest();
  const dataDir = path.join(rootDir, "data");
  mkdirSync(dataDir, { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(path.join(dataDir, "qrz.sqlite"));
  db.exec("PRAGMA journal_mode=WAL; PRAGMA synchronous=NORMAL;");
  db.exec(`
    CREATE TABLE IF NOT EXISTS qrz_cache (
      callsign TEXT PRIMARY KEY,
      status TEXT NOT NULL,
      payload TEXT,
      fetched_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS qrz_rate (
      scope TEXT NOT NULL,
      key_hash TEXT NOT NULL,
      ts INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS qrz_rate_lookup ON qrz_rate(scope, key_hash, ts);
  `);

  let sessionKey = "";
  let lastCleanup = 0;
  const inFlight = new Map();

  function browserIdentity(request) {
    const cookies = parseCookies(request.headers.cookie || "");
    const existing = cookies.get(COOKIE_NAME) || "";
    const separator = existing.lastIndexOf(".");
    if (separator > 0) {
      const id = existing.slice(0, separator);
      const signature = existing.slice(separator + 1);
      const expected = createHmac("sha256", cookieKey).update(id).digest("base64url");
      if (/^[A-Za-z0-9_-]{20,100}$/.test(id) && timingSafeStringEqual(signature, expected)) {
        return { id, cookie: "" };
      }
    }
    const id = randomBytes(24).toString("base64url");
    const signature = createHmac("sha256", cookieKey).update(id).digest("base64url");
    return {
      id,
      cookie: `${COOKIE_NAME}=${encodeURIComponent(`${id}.${signature}`)}; Path=/; Max-Age=${cookieDays * 86400}; HttpOnly; Secure; SameSite=Lax`
    };
  }

  function cleanup(now) {
    if (now - lastCleanup < 10 * 60 * 1000) return;
    lastCleanup = now;
    db.prepare("DELETE FROM qrz_rate WHERE ts < ?").run(now - 24 * 60 * 60 * 1000);
    db.prepare("DELETE FROM qrz_cache WHERE expires_at < ?").run(now - 24 * 60 * 60 * 1000);
  }

  function countSince(scope, keyHash, since) {
    return Number(db.prepare("SELECT COUNT(*) AS count FROM qrz_rate WHERE scope = ? AND key_hash = ? AND ts >= ?")
      .get(scope, keyHash, since)?.count || 0);
  }

  function record(scope, keyHash, now) {
    db.prepare("INSERT INTO qrz_rate(scope, key_hash, ts) VALUES (?, ?, ?)").run(scope, keyHash, now);
  }

  function userRateLimit(ipAddress, browserId, now) {
    cleanup(now);
    const keys = [hashIdentifier(`ip:${ipAddress}`), hashIdentifier(`browser:${browserId}`)];
    const windows = [
      ["minute", 60 * 1000, limitMinute],
      ["hour", 60 * 60 * 1000, limitHour],
      ["day", 24 * 60 * 60 * 1000, limitDay]
    ];
    for (const key of keys) {
      for (const [scope, duration, limit] of windows) {
        if (countSince(`user-${scope}`, key, now - duration) >= limit) return { limited: true, retryAfter: scope === "minute" ? 60 : scope === "hour" ? 3600 : 86400 };
      }
    }
    for (const key of keys) for (const [scope] of windows) record(`user-${scope}`, key, now);
    return { limited: false };
  }

  function globalMissAllowed(now) {
    const key = hashIdentifier("global-qrz-upstream");
    if (countSince("global-hour", key, now - 60 * 60 * 1000) >= globalHour) return false;
    record("global-hour", key, now);
    return true;
  }

  async function verifyTurnstile(token, ipAddress) {
    if (!token) return false;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);
    try {
      const body = new URLSearchParams({ secret: turnstileSecret, response: token, remoteip: ipAddress });
      const response = await fetch(TURNSTILE_ENDPOINT, { method: "POST", body, signal: controller.signal });
      const result = await response.json();
      return result.success === true && hostnames.has(String(result.hostname || "").toLowerCase());
    } catch {
      return false;
    } finally {
      clearTimeout(timer);
    }
  }

  async function qrzRequest(parameters) {
    const url = new URL(QRZ_ENDPOINT);
    for (const [key, value] of Object.entries(parameters)) url.searchParams.set(key, value);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": AGENT, "Accept": "application/xml,text/xml;q=0.9,*/*;q=0.5" },
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`QRZ returned HTTP ${response.status}`);
      return await response.text();
    } finally {
      clearTimeout(timer);
    }
  }

  async function login() {
    const xml = await qrzRequest({ username, password, agent: AGENT });
    const session = xmlBlock(xml, "Session");
    const key = xmlValue(session, "Key");
    if (!key) throw new Error(xmlValue(session, "Error") || "QRZ login did not return a session key.");
    sessionKey = key;
    return key;
  }

  async function lookupUpstream(callsign) {
    let key = sessionKey || await login();
    let xml = await qrzRequest({ s: key, callsign });
    let session = xmlBlock(xml, "Session");
    let error = xmlValue(session, "Error");
    if (error && /session|key|timeout|expired|invalid/i.test(error)) {
      sessionKey = "";
      key = await login();
      xml = await qrzRequest({ s: key, callsign });
      session = xmlBlock(xml, "Session");
      error = xmlValue(session, "Error");
    }
    const callsignBlock = xmlBlock(xml, "Callsign");
    if (!callsignBlock) {
      if (error && !/not found|unknown|no record/i.test(error)) throw new Error(error);
      return { found: false, qrzCount: xmlValue(session, "Count") };
    }
    const lat = Number.parseFloat(xmlValue(callsignBlock, "lat"));
    const lon = Number.parseFloat(xmlValue(callsignBlock, "lon"));
    const geometry = distanceAndBearing(lat, lon);
    const payload = {
      callsign: xmlValue(callsignBlock, "call") || callsign,
      lookupCallsign: callsign,
      name: [xmlValue(callsignBlock, "fname"), xmlValue(callsignBlock, "name")].filter(Boolean).join(" ").trim(),
      nickname: xmlValue(callsignBlock, "nickname"),
      country: xmlValue(callsignBlock, "country"),
      dxcc: xmlValue(callsignBlock, "dxcc"),
      grid: xmlValue(callsignBlock, "grid"),
      licenseClass: xmlValue(callsignBlock, "class"),
      cqZone: xmlValue(callsignBlock, "cqzone"),
      ituZone: xmlValue(callsignBlock, "ituzone"),
      qslManager: xmlValue(callsignBlock, "qslmgr"),
      lotw: yesNo(xmlValue(callsignBlock, "lotw")),
      eqsl: yesNo(xmlValue(callsignBlock, "eqsl")),
      mailQsl: yesNo(xmlValue(callsignBlock, "mqsl")),
      aliases: xmlValue(callsignBlock, "aliases"),
      previousCallsign: xmlValue(callsignBlock, "p_call"),
      ...geometry,
      qrzUrl: `https://www.qrz.com/db/${encodeURIComponent(xmlValue(callsignBlock, "call") || callsign)}`
    };
    return { found: true, payload, qrzCount: xmlValue(session, "Count") };
  }

  function cacheGet(callsign, now) {
    const row = db.prepare("SELECT status, payload, fetched_at, expires_at FROM qrz_cache WHERE callsign = ? AND expires_at > ?").get(callsign, now);
    if (!row) return null;
    return { status: row.status, payload: row.payload ? JSON.parse(row.payload) : null, fetchedAt: Number(row.fetched_at) };
  }

  function cachePut(callsign, status, payload, now, ttlMs) {
    db.prepare(`INSERT INTO qrz_cache(callsign, status, payload, fetched_at, expires_at) VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(callsign) DO UPDATE SET status=excluded.status, payload=excluded.payload, fetched_at=excluded.fetched_at, expires_at=excluded.expires_at`)
      .run(callsign, status, payload ? JSON.stringify(payload) : null, now, now + ttlMs);
  }

  async function performLookup(callsign, now) {
    const cached = cacheGet(callsign, now);
    if (cached) return { ...cached, cached: true };
    if (!globalMissAllowed(now)) throw Object.assign(new Error("The QRZ lookup service is temporarily busy. Please try again later."), { statusCode: 503 });
    if (inFlight.has(callsign)) return inFlight.get(callsign);
    const task = (async () => {
      const result = await lookupUpstream(callsign);
      if (!result.found) {
        cachePut(callsign, "not_found", null, Date.now(), negativeMinutes * 60 * 1000);
        return { status: "not_found", payload: null, cached: false };
      }
      cachePut(callsign, "ok", result.payload, Date.now(), cacheHours * 60 * 60 * 1000);
      if (result.qrzCount) console.log(`QRZ XML lookup ${callsign}; QRZ 24h count: ${result.qrzCount}`);
      return { status: "ok", payload: result.payload, cached: false };
    })().finally(() => inFlight.delete(callsign));
    inFlight.set(callsign, task);
    return task;
  }

  async function handleConfig(request, response) {
    const identity = browserIdentity(request);
    sendJson(response, 200, { enabled: configured, siteKey: configured ? siteKey : "" }, identity.cookie ? { "Set-Cookie": identity.cookie } : {});
  }

  async function handleLookup(request, response) {
    const identity = browserIdentity(request);
    const cookieHeader = identity.cookie ? { "Set-Cookie": identity.cookie } : {};
    if (!configured) return sendJson(response, 503, { ok: false, message: "QRZ lookup is not configured yet." }, cookieHeader);
    if (!allowedOrigin(request)) return sendJson(response, 403, { ok: false, message: "This request was not accepted." }, cookieHeader);
    let body;
    try { body = await readJson(request); }
    catch (error) { return sendJson(response, error.statusCode || 400, { ok: false, message: error.message }, cookieHeader); }
    const callsign = safeCallsign(body.callsign);
    const token = typeof body.turnstileToken === "string" ? body.turnstileToken.trim() : "";
    if (!callsign) return sendJson(response, 400, { ok: false, message: "Enter a valid amateur radio callsign." }, cookieHeader);
    if (!token) return sendJson(response, 400, { ok: false, message: "Please complete the security check." }, cookieHeader);
    const now = Date.now();
    const ipAddress = requestIp(request);
    const rate = userRateLimit(ipAddress, identity.id, now);
    if (rate.limited) return sendJson(response, 429, { ok: false, message: "Too many callsign lookups. Please wait before trying again." }, { ...cookieHeader, "Retry-After": String(rate.retryAfter) });
    if (!(await verifyTurnstile(token, ipAddress))) return sendJson(response, 400, { ok: false, message: "The security check expired or failed. Please try it again." }, cookieHeader);
    try {
      const result = await performLookup(callsign, now);
      if (result.status === "not_found") return sendJson(response, 404, { ok: false, notFound: true, callsign, message: `No QRZ callsign record was found for ${callsign}.`, cached: result.cached }, cookieHeader);
      return sendJson(response, 200, { ok: true, data: result.payload, cached: result.cached, cacheHours }, cookieHeader);
    } catch (error) {
      console.error("QRZ lookup failed:", error?.message || "Unknown QRZ error");
      return sendJson(response, error.statusCode || 502, { ok: false, message: error.statusCode === 503 ? error.message : "QRZ could not be reached just now. Please try again later." }, cookieHeader);
    }
  }

  return { configured, handleConfig, handleLookup };
}
