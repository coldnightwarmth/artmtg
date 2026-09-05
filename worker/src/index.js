import {
  AuthProofError,
  assertSolanaAddress,
  createChallengeInput,
  verifyWalletProof,
} from "./auth.js";
import {
  fetchLiveWalletHoldings,
  readLiveCardStatuses,
  refreshLiveCardStatuses,
} from "./live-data.js";

const API_PREFIX = "/api";
const CLIENT_HEADER = "x-cards-art-client";
const CLIENT_HEADER_VALUE = "wallet-auth-v1";
const CSRF_HEADER = "x-csrf-token";
const JSON_CONTENT_TYPE = "application/json; charset=utf-8";
const MAX_JSON_BODY_BYTES = 64 * 1024;
const MAX_BINDER_JSON_BODY_BYTES = 4 * 1024 * 1024;
const MAX_BINDER_CARD_ORDER_LENGTH = 25_000;
const MAX_BINDER_COVER_STICKERS = 24;
const DEFAULT_SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;
const DEFAULT_AUTH_STATEMENT = "Sign in to cards.art to create and customize your card binder. This will not submit a transaction or cost SOL.";

class HttpError extends Error {
  constructor(status, message, code = "request_failed") {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
  }
}

export default {
  async fetch(request, env, executionContext) {
    const requestId = crypto.randomUUID();
    try {
      const response = await routeRequest(request, env, requestId);
      if (
        request.method === "POST"
        && new URL(request.url).pathname === `${API_PREFIX}/auth/challenge`
        && executionContext?.waitUntil
      ) {
        executionContext.waitUntil(
          cleanupExpiredAuthState(env).catch((error) => {
            console.error("wallet auth cleanup failed", { requestId, error });
          }),
        );
      }
      return response;
    } catch (error) {
      const normalized = normalizeError(error);
      if (normalized.status >= 500) {
        console.error("wallet auth request failed", { requestId, error });
      }
      return jsonResponse(
        { error: normalized.code, message: normalized.message, requestId },
        normalized.status,
        request,
        env,
        { cacheControl: "no-store" },
      );
    }
  },

  async scheduled(_controller, env) {
    await Promise.all([
      cleanupExpiredAuthState(env),
      refreshLiveCardStatuses(env),
    ]);
  },
};

async function cleanupExpiredAuthState(env) {
  const now = Date.now();
  await env.DB.batch([
    env.DB.prepare("DELETE FROM auth_challenges WHERE expires_at < ?").bind(now - 24 * 60 * 60 * 1000),
    env.DB.prepare("DELETE FROM auth_sessions WHERE expires_at < ? OR revoked_at IS NOT NULL").bind(now),
    env.DB.prepare("DELETE FROM auth_rate_limits WHERE expires_at < ?").bind(now),
  ]);
}

async function routeRequest(request, env, requestId) {
  const url = new URL(request.url);
  if (!url.pathname.startsWith(API_PREFIX)) {
    throw new HttpError(404, "Not found", "not_found");
  }

  if (request.method === "OPTIONS") {
    requireAllowedOrigin(request, env);
    return new Response(null, {
      status: 204,
      headers: responseHeaders(request, env, { preflight: true, cacheControl: "no-store" }),
    });
  }

  if (url.pathname === `${API_PREFIX}/health` && request.method === "GET") {
    return jsonResponse({ ok: true }, 200, request, env, { cacheControl: "no-store" });
  }
  if (url.pathname === `${API_PREFIX}/card-statuses` && request.method === "GET") {
    const payload = await readLiveCardStatuses(env);
    return jsonResponse(payload, 200, request, env, {
      cacheControl: "public, max-age=300, stale-while-revalidate=43200",
    });
  }
  if (url.pathname === `${API_PREFIX}/trade-statuses` && request.method === "GET") {
    const payload = await readGlobalTradeStatuses(env);
    return jsonResponse(payload, 200, request, env, {
      cacheControl: "public, max-age=30, stale-while-revalidate=60",
    });
  }
  const holdingsMatch = url.pathname.match(/^\/api\/wallets\/([^/]+)\/holdings$/);
  if (holdingsMatch && request.method === "GET") {
    const address = assertSolanaAddress(decodeURIComponent(holdingsMatch[1]));
    await applyRateLimit(request, env, "wallet-holdings", 120, 10 * 60 * 1000, address);
    const payload = await fetchLiveWalletHoldings(address, env);
    return jsonResponse(payload, 200, request, env, { cacheControl: "no-store" });
  }
  if (url.pathname === `${API_PREFIX}/auth/challenge` && request.method === "POST") {
    return createChallenge(request, env, requestId);
  }
  if (url.pathname === `${API_PREFIX}/auth/verify` && request.method === "POST") {
    return verifyChallenge(request, env, requestId);
  }
  if (url.pathname === `${API_PREFIX}/auth/session` && request.method === "GET") {
    return getSession(request, env);
  }
  if (url.pathname === `${API_PREFIX}/auth/logout` && request.method === "POST") {
    return logout(request, env);
  }
  if (url.pathname === `${API_PREFIX}/me/binder` && request.method === "GET") {
    return getOwnerBinder(request, env);
  }
  if (url.pathname === `${API_PREFIX}/me/binder` && request.method === "PUT") {
    return updateOwnerBinder(request, env);
  }

  const binderMatch = url.pathname.match(/^\/api\/binders\/([^/]+)$/);
  if (binderMatch && request.method === "GET") {
    return getPublicBinder(request, env, decodeURIComponent(binderMatch[1]));
  }
  throw new HttpError(404, "Not found", "not_found");
}

async function createChallenge(request, env, requestId) {
  const origin = requireUnsafeRequest(request, env);
  await applyRateLimit(request, env, "challenge", 20, 10 * 60 * 1000);
  const body = await readJson(request);
  const address = assertSolanaAddress(body.address);
  await applyRateLimit(
    request,
    env,
    "challenge-wallet",
    10,
    10 * 60 * 1000,
    `${getRequesterIdentity(request)}:${address}`,
  );

  const now = Date.now();
  const challengeId = requestId;
  const nonce = randomHex(20);
  const input = createChallengeInput({
    origin,
    address,
    statement: String(env.AUTH_STATEMENT || DEFAULT_AUTH_STATEMENT),
    nonce,
    requestId: challengeId,
    now,
  });
  const expiresAt = Date.parse(input.expirationTime);
  await env.DB.prepare(
    `INSERT INTO auth_challenges
      (id, wallet_address, nonce, input_json, issued_at, expires_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).bind(
    challengeId,
    address,
    nonce,
    JSON.stringify(input),
    now,
    expiresAt,
  ).run();

  return jsonResponse(
    { challengeId, input, expiresAt },
    201,
    request,
    env,
    { cacheControl: "no-store" },
  );
}

async function verifyChallenge(request, env) {
  requireUnsafeRequest(request, env);
  await applyRateLimit(request, env, "verify", 30, 10 * 60 * 1000);
  const body = await readJson(request);
  const challengeId = String(body.challengeId || "");
  if (!/^[0-9a-f-]{36}$/i.test(challengeId)) {
    throw new HttpError(400, "Invalid sign-in request", "challenge_invalid");
  }

  const challenge = await env.DB.prepare(
    `SELECT id, wallet_address, input_json, issued_at, expires_at, consumed_at
     FROM auth_challenges
     WHERE id = ?`,
  ).bind(challengeId).first();
  if (!challenge) throw new HttpError(404, "Sign-in request not found", "challenge_not_found");

  const verified = verifyWalletProof(challenge, body.proof, Date.now());
  await applyRateLimit(request, env, "verify-wallet", 15, 10 * 60 * 1000, verified.address);

  const now = Date.now();
  const consumeToken = crypto.randomUUID();
  const sessionToken = randomBase64Url(32);
  const sessionTokenHash = await sha256Hex(sessionToken);
  const sessionTtlSeconds = getSessionTtlSeconds(env);
  const expiresAt = now + sessionTtlSeconds * 1000;
  const results = await env.DB.batch([
    env.DB.prepare(
      `UPDATE auth_challenges
       SET consumed_at = ?, consume_token = ?
       WHERE id = ? AND consumed_at IS NULL AND expires_at >= ?`,
    ).bind(now, consumeToken, challengeId, now),
    env.DB.prepare(
      `INSERT INTO wallet_users (wallet_address, created_at, last_login_at)
       SELECT wallet_address, ?, ? FROM auth_challenges
       WHERE id = ? AND consume_token = ?
       ON CONFLICT(wallet_address) DO UPDATE SET last_login_at = excluded.last_login_at`,
    ).bind(now, now, challengeId, consumeToken),
    env.DB.prepare(
      `INSERT INTO binder_profiles (wallet_address, created_at, updated_at)
       SELECT wallet_address, ?, ? FROM auth_challenges
       WHERE id = ? AND consume_token = ?
       ON CONFLICT(wallet_address) DO NOTHING`,
    ).bind(now, now, challengeId, consumeToken),
    env.DB.prepare(
      `INSERT INTO auth_sessions (token_hash, wallet_address, created_at, expires_at)
       SELECT ?, wallet_address, ?, ? FROM auth_challenges
       WHERE id = ? AND consume_token = ?`,
    ).bind(sessionTokenHash, now, expiresAt, challengeId, consumeToken),
  ]);

  if (Number(results[0]?.meta?.changes || 0) !== 1 || Number(results[3]?.meta?.changes || 0) !== 1) {
    throw new HttpError(409, "This sign-in request has already been used", "challenge_used");
  }

  const csrfToken = await deriveCsrfToken(sessionToken);
  return jsonResponse(
    {
      authenticated: true,
      csrfToken,
      profile: profileSummary(verified.address, true),
      session: { expiresAt },
    },
    200,
    request,
    env,
    {
      cacheControl: "no-store",
      setCookie: createSessionCookie(request, sessionToken, sessionTtlSeconds),
    },
  );
}

async function getSession(request, env) {
  const session = await requireSession(request, env, { optional: true });
  if (!session) {
    return jsonResponse({ authenticated: false }, 200, request, env, { cacheControl: "no-store" });
  }
  return jsonResponse(
    {
      authenticated: true,
      csrfToken: await deriveCsrfToken(session.rawToken),
      profile: profileSummary(session.wallet_address, true),
      session: { expiresAt: session.expires_at },
    },
    200,
    request,
    env,
    { cacheControl: "no-store" },
  );
}

async function logout(request, env) {
  requireUnsafeRequest(request, env);
  const session = await requireSession(request, env, { optional: true });
  if (session) {
    await requireCsrf(request, session.rawToken);
    await env.DB.prepare("UPDATE auth_sessions SET revoked_at = ? WHERE token_hash = ?")
      .bind(Date.now(), session.token_hash)
      .run();
  }
  return jsonResponse(
    { authenticated: false },
    200,
    request,
    env,
    { cacheControl: "no-store", setCookie: clearSessionCookie(request) },
  );
}

async function getPublicBinder(request, env, rawAddress) {
  const address = assertSolanaAddress(rawAddress);
  const row = await env.DB.prepare(
    `SELECT wallet_address, is_public, is_discoverable, card_order_json, trade_card_ids_json,
            cover_json, table_json, schema_version, revision, created_at, updated_at
     FROM binder_profiles WHERE wallet_address = ?`,
  ).bind(address).first();
  let cacheControl = "no-cache";
  if (row && !row.is_public) {
    const session = await requireSession(request, env, { optional: true });
    if (session?.wallet_address !== address) {
      throw new HttpError(404, "Binder not found", "binder_not_found");
    }
    cacheControl = "no-store";
  }
  return jsonResponse(
    binderDocument(address, row),
    200,
    request,
    env,
    { cacheControl, robots: "noindex" },
  );
}

async function getOwnerBinder(request, env) {
  const session = await requireSession(request, env);
  const row = await env.DB.prepare(
    `SELECT wallet_address, is_public, is_discoverable, card_order_json, trade_card_ids_json,
            cover_json, table_json, schema_version, revision, created_at, updated_at
     FROM binder_profiles WHERE wallet_address = ?`,
  ).bind(session.wallet_address).first();
  return jsonResponse(
    {
      ...binderDocument(session.wallet_address, row),
      csrfToken: await deriveCsrfToken(session.rawToken),
    },
    200,
    request,
    env,
    { cacheControl: "no-store" },
  );
}

async function readGlobalTradeStatuses(env) {
  const result = await env.DB.prepare(
    `SELECT trade_card_ids_json, updated_at
     FROM binder_profiles
     WHERE trade_card_ids_json IS NOT NULL`,
  ).all();
  return buildGlobalTradeStatusDocument(result?.results || []);
}

function buildGlobalTradeStatusDocument(rows, generatedAt = Date.now()) {
  const tradeCardIds = new Set();
  let updatedAt = 0;
  for (const row of rows || []) {
    updatedAt = Math.max(updatedAt, Number(row?.updated_at) || 0);
    const storedIds = parseStoredJson(row?.trade_card_ids_json, []);
    for (const candidate of Array.isArray(storedIds) ? storedIds : []) {
      const stableId = String(candidate || "").trim();
      if (stableId && stableId.length <= 256) tradeCardIds.add(stableId);
    }
  }
  return {
    generatedAt,
    updatedAt: updatedAt || null,
    tradeCardIds: [...tradeCardIds].sort(),
  };
}

async function updateOwnerBinder(request, env) {
  requireUnsafeRequest(request, env);
  const session = await requireSession(request, env);
  await requireCsrf(request, session.rawToken);
  await applyRateLimit(request, env, "binder-write", 30, 10 * 60 * 1000, session.wallet_address);
  const body = await readJson(request, MAX_BINDER_JSON_BODY_BYTES);
  const document = validateBinderUpdate(body);
  document.cover = await authorizeBinderCoverStickers(
    session.wallet_address,
    document.cover,
    env,
  );
  const now = Date.now();
  const result = await env.DB.prepare(
    `UPDATE binder_profiles
     SET is_public = ?, is_discoverable = ?, card_order_json = ?, trade_card_ids_json = ?,
         cover_json = ?, table_json = ?, revision = revision + 1, updated_at = ?
     WHERE wallet_address = ? AND revision = ?`,
  ).bind(
    document.isPublic ? 1 : 0,
    document.isDiscoverable ? 1 : 0,
    JSON.stringify(document.cardOrder),
    JSON.stringify(document.tradeCardIds),
    JSON.stringify(document.cover),
    JSON.stringify(document.table),
    now,
    session.wallet_address,
    document.revision,
  ).run();
  if (Number(result.meta?.changes || 0) !== 1) {
    throw new HttpError(409, "This binder changed in another session. Reload and try again.", "revision_conflict");
  }
  return getOwnerBinder(request, env);
}

async function requireSession(request, env, { optional = false } = {}) {
  const rawToken = readSessionCookie(request);
  if (!rawToken) {
    if (optional) return null;
    throw new HttpError(401, "Wallet sign-in required", "authentication_required");
  }
  const tokenHash = await sha256Hex(rawToken);
  const session = await env.DB.prepare(
    `SELECT token_hash, wallet_address, expires_at
     FROM auth_sessions
     WHERE token_hash = ? AND revoked_at IS NULL AND expires_at >= ?`,
  ).bind(tokenHash, Date.now()).first();
  if (!session) {
    if (optional) return null;
    throw new HttpError(401, "Wallet sign-in required", "authentication_required");
  }
  return { ...session, rawToken };
}

async function requireCsrf(request, rawSessionToken) {
  const provided = request.headers.get(CSRF_HEADER) || "";
  const expected = await deriveCsrfToken(rawSessionToken);
  if (!provided || !timingSafeEqual(provided, expected)) {
    throw new HttpError(403, "Invalid security token", "csrf_invalid");
  }
}

function requireUnsafeRequest(request, env) {
  const origin = requireAllowedOrigin(request, env);
  if (request.headers.get(CLIENT_HEADER) !== CLIENT_HEADER_VALUE) {
    throw new HttpError(400, "Unsupported client", "client_invalid");
  }
  if (!String(request.headers.get("content-type") || "").toLowerCase().startsWith("application/json")) {
    throw new HttpError(415, "JSON request required", "content_type_invalid");
  }
  return origin;
}

function requireAllowedOrigin(request, env) {
  const origin = request.headers.get("origin") || "";
  if (!isAllowedOrigin(env, origin)) {
    throw new HttpError(403, "Origin not allowed", "origin_invalid");
  }
  return origin;
}

function isAllowedOrigin(env, origin) {
  if (getAllowedOrigins(env).has(origin)) return true;
  if (String(env.ALLOW_LOCALHOST_ORIGINS || "").toLowerCase() !== "true") return false;

  let parsed;
  try {
    parsed = new URL(origin);
  } catch {
    return false;
  }
  if (parsed.origin !== origin || !["http:", "https:"].includes(parsed.protocol)) return false;
  return isLoopbackHostname(parsed.hostname);
}

function isLoopbackHostname(hostname) {
  const normalized = String(hostname || "").toLowerCase();
  if (
    normalized === "localhost"
    || normalized.endsWith(".localhost")
    || normalized === "::1"
    || normalized === "[::1]"
  ) {
    return true;
  }
  const octets = normalized.split(".");
  return octets.length === 4
    && octets[0] === "127"
    && octets.every((octet) => /^\d{1,3}$/.test(octet) && Number(octet) <= 255);
}

function getAllowedOrigins(env) {
  return new Set(
    String(env.ALLOWED_ORIGINS || "https://cards.art")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );
}

async function readJson(request, maxBytes = MAX_JSON_BODY_BYTES) {
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new HttpError(413, "Request is too large", "request_too_large");
  }
  const text = await request.text();
  if (new TextEncoder().encode(text).length > maxBytes) {
    throw new HttpError(413, "Request is too large", "request_too_large");
  }
  try {
    const value = JSON.parse(text || "{}");
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error();
    return value;
  } catch {
    throw new HttpError(400, "Invalid JSON request", "json_invalid");
  }
}

async function applyRateLimit(request, env, scope, maximum, windowMs, identity = "") {
  const now = Date.now();
  const windowStartedAt = Math.floor(now / windowMs) * windowMs;
  const source = identity || getRequesterIdentity(request);
  const salt = String(env.RATE_LIMIT_SALT || "cards-art-rate-limit-v1");
  const bucketKey = await sha256Hex(`${salt}:${scope}:${source}:${windowStartedAt}`);
  await env.DB.prepare(
    `INSERT INTO auth_rate_limits (bucket_key, request_count, window_started_at, expires_at)
     VALUES (?, 1, ?, ?)
     ON CONFLICT(bucket_key) DO UPDATE SET request_count = request_count + 1`,
  ).bind(bucketKey, windowStartedAt, windowStartedAt + windowMs + 60_000).run();
  const bucket = await env.DB.prepare(
    "SELECT request_count FROM auth_rate_limits WHERE bucket_key = ?",
  ).bind(bucketKey).first();
  if (Number(bucket?.request_count || 0) > maximum) {
    throw new HttpError(429, "Too many requests. Please wait and try again.", "rate_limited");
  }
}

function getRequesterIdentity(request) {
  return request.headers.get("cf-connecting-ip")
    || request.headers.get("x-forwarded-for")?.split(",", 1)[0]?.trim()
    || "local";
}

function validateBinderUpdate(body) {
  const revision = Number(body.revision);
  if (!Number.isInteger(revision) || revision < 0) {
    throw new HttpError(400, "Invalid binder revision", "binder_invalid");
  }
  if (typeof body.isPublic !== "boolean" || typeof body.isDiscoverable !== "boolean") {
    throw new HttpError(400, "Invalid binder visibility", "binder_invalid");
  }
  const cardOrder = Array.isArray(body.cardOrder) ? body.cardOrder : null;
  if (!cardOrder || cardOrder.length > MAX_BINDER_CARD_ORDER_LENGTH) {
    throw new HttpError(400, "Invalid card order", "binder_invalid");
  }
  const normalizedOrder = cardOrder.map((value) => String(value || "").trim());
  if (
    normalizedOrder.some((value) => !value || value.length > 256)
    || new Set(normalizedOrder).size !== normalizedOrder.length
  ) {
    throw new HttpError(400, "Invalid card order", "binder_invalid");
  }
  const tradeCardIds = Array.isArray(body.tradeCardIds) ? body.tradeCardIds : [];
  if (tradeCardIds.length > MAX_BINDER_CARD_ORDER_LENGTH) {
    throw new HttpError(400, "Invalid trade card list", "binder_invalid");
  }
  const normalizedTradeCardIds = tradeCardIds.map((value) => String(value || "").trim());
  if (
    normalizedTradeCardIds.some((value) => !value || value.length > 256)
    || new Set(normalizedTradeCardIds).size !== normalizedTradeCardIds.length
  ) {
    throw new HttpError(400, "Invalid trade card list", "binder_invalid");
  }
  const cover = validateSettingsObject(body.cover, {
    theme: validateSettingId,
    material: validateSettingId,
    baseColor: validateHexColor,
    accentColor: validateHexColor,
    emblem: validateSettingId,
    artworkKey: validateArtworkKey,
    artworkDataUrl: validateBinderArtworkDataUrl,
    artworkX: (value) => validateFiniteRange(value, -0.5, 1.5),
    artworkY: (value) => validateFiniteRange(value, -0.5, 1.5),
    artworkScale: (value) => validateFiniteRange(value, 0.25, 4),
    artworkRotation: validateBinderCoverRotation,
    backArtworkDataUrl: validateBinderArtworkDataUrl,
    backArtworkX: (value) => validateFiniteRange(value, -0.5, 1.5),
    backArtworkY: (value) => validateFiniteRange(value, -0.5, 1.5),
    backArtworkScale: (value) => validateFiniteRange(value, 0.25, 4),
    backArtworkRotation: validateBinderCoverRotation,
    frontText: validateBinderInsideText,
    frontTextColor: validateHexColor,
    frontTextX: (value) => validateFiniteRange(value, 0.1, 0.9),
    frontTextY: (value) => validateFiniteRange(value, 0.06, 0.94),
    frontTextWidth: (value) => validateFiniteRange(value, 0.2, 0.94),
    frontTextHeight: (value) => validateFiniteRange(value, 0.1, 0.9),
    frontFontSize: (value) => Number.isInteger(value) && value >= 18 && value <= 96,
    frontTextRotation: validateBinderCoverRotation,
    backText: validateBinderInsideText,
    backTextColor: validateHexColor,
    backTextX: (value) => validateFiniteRange(value, 0.1, 0.9),
    backTextY: (value) => validateFiniteRange(value, 0.06, 0.94),
    backTextWidth: (value) => validateFiniteRange(value, 0.2, 0.94),
    backTextHeight: (value) => validateFiniteRange(value, 0.1, 0.9),
    backFontSize: (value) => Number.isInteger(value) && value >= 18 && value <= 96,
    backTextRotation: validateBinderCoverRotation,
    insideText: validateBinderInsideText,
    insideTextColor: validateHexColor,
    insideTextX: (value) => validateFiniteRange(value, 0.1, 0.9),
    insideTextY: (value) => validateFiniteRange(value, 0.06, 0.94),
    insideTextWidth: (value) => validateFiniteRange(value, 0.2, 0.94),
    insideTextHeight: (value) => validateFiniteRange(value, 0.1, 0.9),
    insideFontSize: (value) => Number.isInteger(value) && value >= 18 && value <= 96,
    insideTextRotation: validateBinderCoverRotation,
    insideLinks: (value) => validateBinderInsideLinks(value, body.cover?.insideText),
    stickers: validateBinderCoverStickers,
  }, "cover", 3_000_000);
  const table = validateSettingsObject(body.table, {
    theme: validateSettingId,
    surface: validateSettingId,
    layout: validateSettingId,
    cameraPreset: validateSettingId,
    showSideBinders: (value) => typeof value === "boolean",
  }, "table");
  return {
    revision,
    isPublic: body.isPublic,
    isDiscoverable: body.isPublic && body.isDiscoverable,
    cardOrder: normalizedOrder,
    tradeCardIds: normalizedTradeCardIds,
    cover,
    table,
  };
}

function validateSettingsObject(value, validators, label, maximumBytes = 8192) {
  const settings = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const keys = Object.keys(settings);
  if (keys.some((key) => !Object.hasOwn(validators, key))) {
    throw new HttpError(400, `Invalid ${label} settings`, "binder_invalid");
  }
  const serialized = JSON.stringify(settings);
  if (new TextEncoder().encode(serialized).length > maximumBytes) {
    throw new HttpError(400, `Invalid ${label} settings`, "binder_invalid");
  }
  for (const [key, entry] of Object.entries(settings)) {
    if (!validators[key](entry)) {
      throw new HttpError(400, `Invalid ${label} settings`, "binder_invalid");
    }
  }
  return settings;
}

function validateFiniteRange(value, minimum, maximum) {
  return typeof value === "number"
    && Number.isFinite(value)
    && value >= minimum
    && value <= maximum;
}

function validateBinderArtworkDataUrl(value) {
  return typeof value === "string"
    && value.length <= 1_350_000
    && /^data:image\/(?:png|jpe?g|webp);base64,[a-z0-9+/]+=*$/i.test(value);
}

function validateBinderInsideText(value) {
  return typeof value === "string" && value.length > 0 && value.length <= 2000;
}

function validateBinderCoverRotation(value) {
  return validateFiniteRange(value, -180, 180);
}

function validateBinderInsideLinks(value, textValue) {
  if (!Array.isArray(value) || value.length > 24) return false;
  const text = typeof textValue === "string" ? textValue : "";
  let previousEnd = 0;
  for (const link of value) {
    if (!link || typeof link !== "object" || Array.isArray(link)) return false;
    if (Object.keys(link).some((key) => !["start", "end", "url"].includes(key))) return false;
    if (
      !Number.isInteger(link.start)
      || !Number.isInteger(link.end)
      || link.start < previousEnd
      || link.start < 0
      || link.end <= link.start
      || link.end > text.length
      || !validateBinderLinkUrl(link.url)
    ) return false;
    previousEnd = link.end;
  }
  return true;
}

function validateBinderLinkUrl(value) {
  if (typeof value !== "string" || value.length > 2048) return false;
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

function validateBinderCoverStickers(value) {
  if (!Array.isArray(value) || value.length > MAX_BINDER_COVER_STICKERS) return false;
  const mints = new Set();
  for (const sticker of value) {
    if (!sticker || typeof sticker !== "object" || Array.isArray(sticker)) return false;
    if (Object.keys(sticker).some((key) => !["mint", "surface", "x", "y", "scale", "rotation"].includes(key))) {
      return false;
    }
    const mint = String(sticker.mint || "").trim();
    if (
      !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(mint)
      || mints.has(mint)
      || !["front", "back", "inside"].includes(sticker.surface)
      || !validateFiniteRange(sticker.x, -0.25, 1.25)
      || !validateFiniteRange(sticker.y, -0.25, 1.25)
      || !validateFiniteRange(sticker.scale, 0.08, 1.5)
      || (sticker.rotation !== undefined && !validateBinderCoverRotation(sticker.rotation))
    ) return false;
    mints.add(mint);
  }
  return true;
}

async function authorizeBinderCoverStickers(address, cover, env) {
  const requested = Array.isArray(cover?.stickers) ? cover.stickers : [];
  if (!requested.length) return cover;
  const holdings = await fetchLiveWalletHoldings(address, env);
  const heldByMint = new Map(
    (holdings.swagPackAssets || []).map((asset) => [String(asset.mint || ""), asset]),
  );
  const authorized = requested.map((sticker) => {
    const asset = heldByMint.get(sticker.mint);
    if (!asset) {
      throw new HttpError(
        403,
        "Every binder sticker must be a Swag Pack piece held by this wallet",
        "sticker_not_owned",
      );
    }
    return {
      ...sticker,
      name: String(asset.name || "Swag Pack sticker").slice(0, 120),
      imageUrl: String(asset.imageUrl || "").slice(0, 2048),
    };
  });
  return { ...cover, stickers: authorized };
}

function validateSettingId(value) {
  return typeof value === "string" && /^[a-z0-9][a-z0-9_-]{0,63}$/i.test(value);
}

function validateHexColor(value) {
  return typeof value === "string" && /^#[0-9a-f]{6}(?:[0-9a-f]{2})?$/i.test(value);
}

function validateArtworkKey(value) {
  return typeof value === "string"
    && value.length <= 128
    && /^[a-z0-9][a-z0-9/_-]*$/i.test(value)
    && !value.includes("..");
}

function binderDocument(address, row) {
  return {
    walletAddress: address,
    exists: Boolean(row),
    isPublic: row ? Boolean(row.is_public) : true,
    isDiscoverable: row ? Boolean(row.is_discoverable) : false,
    cardOrder: parseStoredJson(row?.card_order_json, []),
    tradeCardIds: parseStoredJson(row?.trade_card_ids_json, []),
    cover: parseStoredJson(row?.cover_json, {}),
    table: parseStoredJson(row?.table_json, {}),
    schemaVersion: Number(row?.schema_version || 1),
    revision: Number(row?.revision || 0),
    createdAt: row?.created_at || null,
    updatedAt: row?.updated_at || null,
    path: `/${address}`,
  };
}

function profileSummary(address, exists) {
  return {
    walletAddress: address,
    exists,
    binderPath: `/${address}`,
  };
}

function parseStoredJson(value, fallback) {
  try {
    return value == null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

function getSessionTtlSeconds(env) {
  const value = Number(env.SESSION_TTL_SECONDS || DEFAULT_SESSION_TTL_SECONDS);
  return Number.isFinite(value)
    ? Math.max(60 * 60, Math.min(30 * 24 * 60 * 60, Math.round(value)))
    : DEFAULT_SESSION_TTL_SECONDS;
}

function getSessionCookieName(request) {
  return new URL(request.url).protocol === "https:"
    ? "__Host-cards_session"
    : "cards_session_dev";
}

function createSessionCookie(request, token, maxAgeSeconds) {
  const secure = new URL(request.url).protocol === "https:";
  return [
    `${getSessionCookieName(request)}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    secure ? "Secure" : "",
    `Max-Age=${maxAgeSeconds}`,
  ].filter(Boolean).join("; ");
}

function clearSessionCookie(request) {
  const secure = new URL(request.url).protocol === "https:";
  return [
    `${getSessionCookieName(request)}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    secure ? "Secure" : "",
    "Max-Age=0",
  ].filter(Boolean).join("; ");
}

function readSessionCookie(request) {
  const name = getSessionCookieName(request);
  for (const part of String(request.headers.get("cookie") || "").split(";")) {
    const separator = part.indexOf("=");
    if (separator === -1) continue;
    if (part.slice(0, separator).trim() === name) {
      return part.slice(separator + 1).trim();
    }
  }
  return "";
}

async function deriveCsrfToken(rawSessionToken) {
  return sha256Hex(`cards.art:csrf:v1:${rawSessionToken}`);
}

function timingSafeEqual(left, right) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

function randomHex(byteLength) {
  return [...crypto.getRandomValues(new Uint8Array(byteLength))]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

function randomBase64Url(byteLength) {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/g, "");
}

async function sha256Hex(value) {
  const input = typeof value === "string" ? new TextEncoder().encode(value) : value;
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", input));
  return [...digest].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function jsonResponse(payload, status, request, env, options = {}) {
  const headers = responseHeaders(request, env, options);
  headers.set("content-type", JSON_CONTENT_TYPE);
  if (options.setCookie) headers.set("set-cookie", options.setCookie);
  return new Response(JSON.stringify(payload), { status, headers });
}

function responseHeaders(request, env, options = {}) {
  const headers = new Headers({
    "cache-control": options.cacheControl || "no-store",
    "referrer-policy": "no-referrer",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
  });
  headers.append("vary", "Origin");
  if (options.robots) headers.set("x-robots-tag", options.robots);
  const origin = request.headers.get("origin") || "";
  if (isAllowedOrigin(env, origin)) {
    headers.set("access-control-allow-origin", origin);
    headers.set("access-control-allow-credentials", "true");
  }
  if (options.preflight) {
    headers.set("access-control-allow-methods", "GET,POST,PUT,OPTIONS");
    headers.set("access-control-allow-headers", `Content-Type,${CLIENT_HEADER},${CSRF_HEADER}`);
    headers.set("access-control-max-age", "600");
  }
  return headers;
}

function normalizeError(error) {
  if (error instanceof HttpError || error instanceof AuthProofError) {
    return {
      status: Number(error.status) || 400,
      code: error.code || "request_failed",
      message: error.message || "Request failed",
    };
  }
  return { status: 500, code: "internal_error", message: "Something went wrong" };
}

export const testing = {
  authorizeBinderCoverStickers,
  binderDocument,
  buildGlobalTradeStatusDocument,
  createSessionCookie,
  isAllowedOrigin,
  timingSafeEqual,
  validateBinderUpdate,
  validateBinderCoverStickers,
};
