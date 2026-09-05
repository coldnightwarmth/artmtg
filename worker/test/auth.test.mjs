import assert from "node:assert/strict";
import { generateKeyPairSync, sign } from "node:crypto";
import test from "node:test";

import bs58 from "bs58";
import { createSignInMessage } from "@solana/wallet-standard-util";

import {
  AuthProofError,
  CHALLENGE_TTL_MS,
  assertSolanaAddress,
  createChallengeInput,
  verifyWalletProof,
} from "../src/auth.js";
import { testing } from "../src/index.js";

function base64(bytes) {
  return Buffer.from(bytes).toString("base64");
}

function makeProof(now = Date.UTC(2026, 7, 4, 18, 0, 0)) {
  const keyPair = generateKeyPairSync("ed25519");
  const publicKey = new Uint8Array(
    keyPair.publicKey.export({ format: "der", type: "spki" }).subarray(-32),
  );
  const address = bs58.encode(publicKey);
  const input = createChallengeInput({
    origin: "https://cards.art",
    address,
    statement: "Sign in to cards.art. This will not submit a transaction or cost SOL.",
    nonce: "1234567890abcdef1234567890abcdef12345678",
    requestId: "90efdbd5-c182-4051-a36f-e87c19d17a32",
    now,
  });
  const signedMessage = createSignInMessage(input);
  const signature = sign(null, signedMessage, keyPair.privateKey);
  const challenge = {
    id: input.requestId,
    wallet_address: address,
    input_json: JSON.stringify(input),
    issued_at: now,
    expires_at: now + CHALLENGE_TTL_MS,
    consumed_at: null,
  };
  const proof = {
    account: { address, publicKey: base64(publicKey) },
    signedMessage: base64(signedMessage),
    signature: base64(signature),
    signatureType: "ed25519",
  };
  return { address, challenge, input, proof };
}

test("validates canonical 32-byte Solana addresses", () => {
  const { address } = makeProof();
  assert.equal(assertSolanaAddress(address), address);
  assert.throws(() => assertSolanaAddress("1111111111111111111111111111111"), AuthProofError);
});

test("verifies a domain-bound SIWS proof", () => {
  const now = Date.UTC(2026, 7, 4, 18, 0, 0);
  const { address, challenge, proof } = makeProof(now);
  assert.equal(verifyWalletProof(challenge, proof, now + 1000).address, address);
});

test("rejects tampered, expired, and replayed proofs", () => {
  const now = Date.UTC(2026, 7, 4, 18, 0, 0);
  const { challenge, proof } = makeProof(now);
  assert.throws(
    () => verifyWalletProof(challenge, { ...proof, signature: base64(new Uint8Array(64)) }, now),
    (error) => error.code === "signature_invalid",
  );
  assert.throws(
    () => verifyWalletProof(challenge, proof, now + CHALLENGE_TTL_MS + 1),
    (error) => error.code === "challenge_expired",
  );
  assert.throws(
    () => verifyWalletProof({ ...challenge, consumed_at: now }, proof, now),
    (error) => error.code === "challenge_used",
  );
});

test("session cookies use host-only secure production flags", () => {
  const cookie = testing.createSessionCookie(
    new Request("https://api.cards.art/api/auth/verify"),
    "token",
    604800,
  );
  assert.match(cookie, /^__Host-cards_session=token;/);
  assert.match(cookie, /; Path=\//);
  assert.match(cookie, /; HttpOnly/);
  assert.match(cookie, /; SameSite=Lax/);
  assert.match(cookie, /; Secure/);
  assert.doesNotMatch(cookie, /Domain=/);
});

test("local development accepts loopback origins on any port only when enabled", () => {
  const productionEnv = { ALLOWED_ORIGINS: "https://cards.art,https://www.cards.art" };
  const localEnv = { ...productionEnv, ALLOW_LOCALHOST_ORIGINS: "true" };

  assert.equal(testing.isAllowedOrigin(productionEnv, "https://cards.art"), true);
  assert.equal(testing.isAllowedOrigin(productionEnv, "http://localhost:5173"), false);
  assert.equal(testing.isAllowedOrigin(localEnv, "http://localhost:5173"), true);
  assert.equal(testing.isAllowedOrigin(localEnv, "http://binder.localhost:9000"), true);
  assert.equal(testing.isAllowedOrigin(localEnv, "http://127.0.0.42:4321"), true);
  assert.equal(testing.isAllowedOrigin(localEnv, "http://[::1]:8000"), true);
  assert.equal(testing.isAllowedOrigin(localEnv, "https://localhost.evil.example"), false);
  assert.equal(testing.isAllowedOrigin(localEnv, "https://example.com"), false);
});

test("binder updates reject duplicates and stale input shapes", () => {
  assert.throws(
    () => testing.validateBinderUpdate({ revision: 0, cardOrder: ["a", "a"] }),
    (error) => error.code === "binder_invalid",
  );
  const update = testing.validateBinderUpdate({
    revision: 2,
    isPublic: true,
    isDiscoverable: false,
    cardOrder: ["cardnft1:mint"],
    tradeCardIds: ["cardnft1:mint"],
    cover: { theme: "classic" },
    table: { showSideBinders: false },
  });
  assert.equal(update.revision, 2);
  assert.deepEqual(update.cardOrder, ["cardnft1:mint"]);
  assert.deepEqual(update.tradeCardIds, ["cardnft1:mint"]);
  assert.throws(
    () => testing.validateBinderUpdate({
      revision: 0,
      isPublic: true,
      isDiscoverable: false,
      cardOrder: [],
      tradeCardIds: ["cardnft1:mint", "cardnft1:mint"],
    }),
    (error) => error.code === "binder_invalid",
  );
  assert.throws(
    () => testing.validateBinderUpdate({
      revision: 0,
      isPublic: true,
      isDiscoverable: false,
      cardOrder: [],
      cover: { artworkKey: "https://example.com/untrusted.svg" },
    }),
    (error) => error.code === "binder_invalid",
  );
  assert.throws(
    () => testing.validateBinderUpdate({
      revision: 0,
      isPublic: "yes",
      isDiscoverable: false,
      cardOrder: [],
    }),
    (error) => error.code === "binder_invalid",
  );
});

test("binder updates accept a full large supported-card order", () => {
  const cardOrder = Array.from({ length: 25_000 }, (_, index) => `collection:card-${index}`);
  const update = testing.validateBinderUpdate({
    revision: 7,
    isPublic: true,
    isDiscoverable: false,
    cardOrder,
    cover: {},
    table: {},
  });
  assert.equal(update.cardOrder.length, 25_000);
  assert.equal(update.cardOrder.at(-1), "collection:card-24999");
});

test("global trade statuses combine marks from every wallet binder", () => {
  const document = testing.buildGlobalTradeStatusDocument([
    {
      trade_card_ids_json: JSON.stringify(["cardnft2:card-4", "poncho:card-7"]),
      updated_at: 120,
    },
    {
      trade_card_ids_json: JSON.stringify(["poncho:card-7", "clear:card-3"]),
      updated_at: 240,
    },
    { trade_card_ids_json: "malformed", updated_at: 180 },
  ], 300);
  assert.deepEqual(document, {
    generatedAt: 300,
    updatedAt: 240,
    tradeCardIds: ["cardnft2:card-4", "clear:card-3", "poncho:card-7"],
  });
});

test("binder updates accept positioned cover art and linked inside-cover text", () => {
  const update = testing.validateBinderUpdate({
    revision: 3,
    isPublic: true,
    isDiscoverable: false,
    cardOrder: [],
    cover: {
      baseColor: "#315b88",
      artworkDataUrl: `data:image/webp;base64,${"A".repeat(256)}`,
      artworkX: 0.42,
      artworkY: 0.61,
      artworkScale: 1.35,
      artworkRotation: -18,
      backArtworkDataUrl: `data:image/png;base64,${"B".repeat(256)}`,
      backArtworkX: 0.58,
      backArtworkY: 0.39,
      backArtworkScale: 0.85,
      backArtworkRotation: 27,
      frontText: "front title",
      frontTextColor: "#f0cf70",
      frontTextX: 0.52,
      frontTextY: 0.24,
      frontTextWidth: 0.62,
      frontTextHeight: 0.2,
      frontFontSize: 54,
      frontTextRotation: -8,
      backText: "back title",
      backTextColor: "#ffffff",
      backTextX: 0.48,
      backTextY: 0.72,
      backTextWidth: 0.7,
      backTextHeight: 0.22,
      backFontSize: 38,
      backTextRotation: 11,
      insideText: "visit cards.art",
      insideTextColor: "#efe3b6",
      insideTextX: 0.5,
      insideTextY: 0.48,
      insideTextWidth: 0.72,
      insideTextHeight: 0.3,
      insideFontSize: 42,
      insideTextRotation: 6,
      insideLinks: [{ start: 6, end: 15, url: "https://cards.art/" }],
    },
    table: {},
  });
  assert.equal(update.cover.baseColor, "#315b88");
  assert.equal(update.cover.insideTextColor, "#efe3b6");
  assert.equal(update.cover.artworkScale, 1.35);
  assert.equal(update.cover.backArtworkScale, 0.85);
  assert.equal(update.cover.artworkRotation, -18);
  assert.equal(update.cover.frontText, "front title");
  assert.equal(update.cover.backTextRotation, 11);
  assert.equal(update.cover.insideTextRotation, 6);
  assert.deepEqual(update.cover.insideLinks, [
    { start: 6, end: 15, url: "https://cards.art/" },
  ]);

  assert.throws(
    () => testing.validateBinderUpdate({
      revision: 3,
      isPublic: true,
      isDiscoverable: false,
      cardOrder: [],
      cover: {
        insideText: "unsafe",
        insideLinks: [{ start: 0, end: 6, url: "javascript:alert(1)" }],
      },
      table: {},
    }),
    (error) => error.code === "binder_invalid",
  );
  assert.throws(
    () => testing.validateBinderUpdate({
      revision: 3,
      isPublic: true,
      isDiscoverable: false,
      cardOrder: [],
      cover: { frontText: "no spinning", frontTextRotation: 181 },
      table: {},
    }),
    (error) => error.code === "binder_invalid",
  );
});

test("binder updates accept only the trusted Swag Pack sticker input shape", () => {
  const sticker = {
    mint: "12FHUPi4u9sGyXwVvbJ1QcMNteSVKL4sUE8BJFjdcmta",
    surface: "inside",
    x: 0.57,
    y: 0.41,
    scale: 0.36,
    rotation: -32,
  };
  const update = testing.validateBinderUpdate({
    revision: 4,
    isPublic: true,
    isDiscoverable: false,
    cardOrder: [],
    cover: { stickers: [sticker] },
    table: {},
  });
  assert.deepEqual(update.cover.stickers, [sticker]);

  for (const invalidSticker of [
    { ...sticker, surface: "spine" },
    { ...sticker, scale: 4 },
    { ...sticker, rotation: 181 },
    { ...sticker, imageUrl: "https://example.com/untrusted.png" },
  ]) {
    assert.throws(
      () => testing.validateBinderUpdate({
        revision: 4,
        isPublic: true,
        isDiscoverable: false,
        cardOrder: [],
        cover: { stickers: [invalidSticker] },
        table: {},
      }),
      (error) => error.code === "binder_invalid",
    );
  }
  assert.throws(
    () => testing.validateBinderUpdate({
      revision: 4,
      isPublic: true,
      isDiscoverable: false,
      cardOrder: [],
      cover: { stickers: [sticker, sticker] },
      table: {},
    }),
    (error) => error.code === "binder_invalid",
  );
});

test("binder sticker saves are enriched from live holdings and reject unowned mints", async () => {
  const originalFetch = globalThis.fetch;
  const heldMint = "12FHUPi4u9sGyXwVvbJ1QcMNteSVKL4sUE8BJFjdcmta";
  globalThis.fetch = async (_url, options = {}) => {
    const request = options.body ? JSON.parse(options.body) : null;
    if (request?.method === "getAssetsByOwner") {
      return new Response(JSON.stringify({
        result: {
          total: 1,
          items: [{
            id: heldMint,
            grouping: [{
              group_key: "collection",
              group_value: "C22esis7kQMbX9JGWsMaKvsh1X5GeBmHPju28jiKDyAP",
            }],
            content: {
              metadata: { json_name: "Golem", name: "swag pack" },
              links: { image: "https://gateway.irys.xyz/golem.png" },
              files: [{ uri: "https://gateway.irys.xyz/golem.png", mime: "image/png" }],
            },
          }],
        },
      }), { headers: { "content-type": "application/json" } });
    }
    return new Response(JSON.stringify({ error: { message: "unavailable" } }), {
      status: 503,
      headers: { "content-type": "application/json" },
    });
  };

  try {
    const cover = await testing.authorizeBinderCoverStickers(
      makeProof().address,
      { stickers: [{ mint: heldMint, surface: "front", x: 0.5, y: 0.5, scale: 0.32 }] },
      { HELIUS_RPC_URL: "https://helius.test" },
    );
    assert.deepEqual(cover.stickers, [{
      mint: heldMint,
      surface: "front",
      x: 0.5,
      y: 0.5,
      scale: 0.32,
      name: "Golem",
      imageUrl: "https://gateway.irys.xyz/golem.png",
    }]);
    await assert.rejects(
      testing.authorizeBinderCoverStickers(
        makeProof().address,
        {
          stickers: [{
            mint: "11111111111111111111111111111111",
            surface: "back",
            x: 0.5,
            y: 0.5,
            scale: 0.32,
          }],
        },
        { HELIUS_RPC_URL: "https://helius.test" },
      ),
      (error) => error.code === "sticker_not_owned" && error.status === 403,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
