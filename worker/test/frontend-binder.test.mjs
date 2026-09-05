import assert from "node:assert/strict";
import test from "node:test";

import bs58 from "bs58";

import {
  getGlobalTradeStatuses,
  getOwnerWalletBinder,
  signInWithSolanaWallet,
  updateOwnerWalletBinder,
} from "../frontend/wallet-auth-entry.js";

test("global trade status client reads the shared binder marks", async () => {
  const originalFetch = globalThis.fetch;
  let requestedUrl = "";
  globalThis.fetch = async (url) => {
    requestedUrl = String(url);
    return new Response(JSON.stringify({ tradeCardIds: ["poncho:card-7"] }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };
  try {
    const document = await getGlobalTradeStatuses("https://api.cards.art/api/");
    assert.equal(requestedUrl, "https://api.cards.art/api/trade-statuses");
    assert.deepEqual(document.tradeCardIds, ["poncho:card-7"]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("wallet-standard sign-in completes the challenge and verification flow", async () => {
  const originalFetch = globalThis.fetch;
  const publicKey = Uint8Array.from({ length: 32 }, (_, index) => index + 1);
  const address = bs58.encode(publicKey);
  const account = {
    address,
    publicKey,
    chains: ["solana:mainnet"],
    features: ["solana:signIn"],
  };
  const signedMessage = new TextEncoder().encode("signed login message");
  const signature = new Uint8Array(64).fill(7);
  const challengeInput = {
    domain: "localhost:8000",
    address,
    uri: "http://localhost:8000",
    version: "1",
    chainId: "solana:mainnet",
    nonce: "1234567890abcdef",
  };
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    const payload = calls.length === 1
      ? { challengeId: "challenge-id", input: challengeInput }
      : { authenticated: true, profile: { walletAddress: address }, csrfToken: "csrf" };
    return new Response(JSON.stringify(payload), {
      status: calls.length === 1 ? 201 : 200,
      headers: { "content-type": "application/json" },
    });
  };
  const wallet = {
    name: "Mock wallet",
    chains: ["solana:mainnet"],
    accounts: [],
    features: {
      "standard:connect": {
        version: "1.0.0",
        connect: async () => ({ accounts: [account] }),
      },
      "solana:signIn": {
        version: "1.0.0",
        signIn: async (input) => {
          assert.deepEqual(input, challengeInput);
          return [{ account, signedMessage, signature, signatureType: "ed25519" }];
        },
      },
    },
  };

  try {
    const result = await signInWithSolanaWallet(wallet, "http://localhost:8787/api/");
    assert.equal(result.account.address, address);
    assert.equal(result.session.authenticated, true);
    assert.equal(calls.length, 2);
    assert.equal(calls[0].url, "http://localhost:8787/api/auth/challenge");
    assert.equal(JSON.parse(calls[0].options.body).address, address);
    assert.equal(calls[1].url, "http://localhost:8787/api/auth/verify");
    const verification = JSON.parse(calls[1].options.body);
    assert.equal(verification.challengeId, "challenge-id");
    assert.equal(verification.proof.account.address, address);
    assert.equal(verification.proof.publicKey, undefined);
    assert.equal(verification.proof.signatureType, "ed25519");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("owner binder client reads and replaces the full revisioned document", async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    return new Response(JSON.stringify({
      walletAddress: "OwnerWallet111111111111111111111111111111",
      revision: calls.length,
      csrfToken: "fresh-csrf",
    }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };

  try {
    await getOwnerWalletBinder("https://api.cards.art/api/");
    const document = {
      revision: 4,
      isPublic: true,
      isDiscoverable: false,
      cardOrder: ["cardnft1:mint-a", "poncho:mint-b"],
      tradeCardIds: ["poncho:mint-b"],
      cover: { theme: "classic" },
      table: { showSideBinders: false },
    };
    await updateOwnerWalletBinder(
      "https://api.cards.art/api/",
      document,
      "csrf-token",
    );

    assert.equal(calls.length, 2);
    assert.equal(calls[0].url, "https://api.cards.art/api/me/binder");
    assert.equal(calls[0].options.method, "GET");
    assert.equal(calls[0].options.credentials, "include");
    assert.ok(calls[0].options.signal instanceof AbortSignal);

    assert.equal(calls[1].url, "https://api.cards.art/api/me/binder");
    assert.equal(calls[1].options.method, "PUT");
    assert.equal(calls[1].options.credentials, "include");
    assert.equal(calls[1].options.headers.get("x-cards-art-client"), "wallet-auth-v1");
    assert.equal(calls[1].options.headers.get("x-csrf-token"), "csrf-token");
    assert.deepEqual(JSON.parse(calls[1].options.body), document);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("wallet client aborts a stalled owner binder request", async () => {
  const originalFetch = globalThis.fetch;
  const originalSetTimeout = globalThis.setTimeout;
  const originalClearTimeout = globalThis.clearTimeout;
  globalThis.setTimeout = (callback) => {
    queueMicrotask(callback);
    return 1;
  };
  globalThis.clearTimeout = () => {};
  globalThis.fetch = (_url, options) => new Promise((_resolve, reject) => {
    options.signal.addEventListener("abort", () => {
      const error = new Error("aborted");
      error.name = "AbortError";
      reject(error);
    }, { once: true });
  });

  try {
    await assert.rejects(
      () => getOwnerWalletBinder("https://api.cards.art/api"),
      (error) => error.code === "api_timeout",
    );
  } finally {
    globalThis.fetch = originalFetch;
    globalThis.setTimeout = originalSetTimeout;
    globalThis.clearTimeout = originalClearTimeout;
  }
});

test("wallet client surfaces an expired owner session", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({
    error: "authentication_required",
    message: "Wallet sign-in required",
  }), {
    status: 401,
    headers: { "content-type": "application/json" },
  });

  try {
    await assert.rejects(
      () => getOwnerWalletBinder("https://api.cards.art/api"),
      (error) => error.code === "authentication_required",
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
