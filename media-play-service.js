import { createHash } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";

const LEGACY_MEDIA = new Set([
  "qso-one-audio",
  "qso-one-video"
]);

const ALLOWED_HOSTS = new Set([
  "archive.org",
  "nzart.org.nz",
  "www.nzart.org.nz",
  "wia-files.com",
  "www.wia-files.com",
  "media.blubrry.com",
  "youtube.com",
  "www.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com"
]);

function normaliseMediaUrl(value) {
  if (typeof value !== "string" || value.length > 2048) {
    return null;
  }

  try {
    const url = new URL(value);

    if (url.protocol !== "https:") return null;
    if (!ALLOWED_HOSTS.has(url.hostname.toLowerCase())) return null;
    if (url.username || url.password) return null;

    url.hash = "";

    // Remove common tracking parameters without changing the media path.
    for (const key of [...url.searchParams.keys()]) {
      if (/^(utm_|fbclid$|gclid$|mc_cid$|mc_eid$)/i.test(key)) {
        url.searchParams.delete(key);
      }
    }

    url.searchParams.sort();

    return url.toString();
  } catch {
    return null;
  }
}

function createMediaId(mediaUrl) {
  return `media-${createHash("sha256")
    .update(mediaUrl)
    .digest("hex")
    .slice(0, 32)}`;
}

export function createMediaPlayService({ rootDir }) {
  const dataDirectory = path.join(rootDir, "data");
  mkdirSync(dataDirectory, { recursive: true });

  const database = new DatabaseSync(
    path.join(dataDirectory, "media-plays.sqlite")
  );

  database.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 5000;

    CREATE TABLE IF NOT EXISTS media_plays (
      media_id TEXT PRIMARY KEY,
      play_count INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );
  `);

  const getStatement = database.prepare(`
    SELECT play_count
    FROM media_plays
    WHERE media_id = ?
  `);

  const allCountsStatement = database.prepare(`
    SELECT media_id, play_count
    FROM media_plays
  `);

  const recordStatement = database.prepare(`
    INSERT INTO media_plays (media_id, play_count, updated_at)
    VALUES (?, 1, ?)
    ON CONFLICT(media_id) DO UPDATE SET
      play_count = play_count + 1,
      updated_at = excluded.updated_at
  `);

  function getCounts() {
    return Object.fromEntries(
      allCountsStatement.all().map(row => [row.media_id, row.play_count])
    );
  }

  function getCount(mediaUrl) {
    const normalised = normaliseMediaUrl(mediaUrl);
    if (!normalised) return null;

    const mediaId = createMediaId(normalised);
    return getStatement.get(mediaId)?.play_count ?? 0;
  }

  function recordPlay(mediaUrlOrLegacyId) {
    let mediaId;

    if (LEGACY_MEDIA.has(mediaUrlOrLegacyId)) {
      mediaId = mediaUrlOrLegacyId;
    } else {
      const normalised = normaliseMediaUrl(mediaUrlOrLegacyId);
      if (!normalised) return false;
      mediaId = createMediaId(normalised);
    }

    recordStatement.run(mediaId, new Date().toISOString());
    return true;
  }

  return { getCounts, getCount, recordPlay };
}
