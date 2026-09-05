import { generateKeyPairSync, sign } from "node:crypto";

import { createSignInMessage } from "@solana/wallet-standard-util";
import bs58 from "bs58";

const API_BASE_URL = "http://127.0.0.1:8787/api";
const ORIGIN = "http://localhost:8000";
const CLIENT_HEADER = "x-cards-art-client";
const CLIENT_HEADER_VALUE = "wallet-auth-v1";

function toBase64(value) {
  return Buffer.from(value).toString("base64");
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`${options.method || "GET"} ${path} failed: ${response.status} ${JSON.stringify(payload)}`);
  }
  return { response, payload };
}

const keyPair = generateKeyPairSync("ed25519");
const publicKey = new Uint8Array(
  keyPair.publicKey.export({ format: "der", type: "spki" }).subarray(-32),
);
const address = bs58.encode(publicKey);
const unsafeHeaders = {
  origin: ORIGIN,
  "content-type": "application/json",
  [CLIENT_HEADER]: CLIENT_HEADER_VALUE,
};

const { payload: challenge } = await request("/auth/challenge", {
  method: "POST",
  headers: unsafeHeaders,
  body: JSON.stringify({ address }),
});
const signedMessage = createSignInMessage(challenge.input);
const signature = sign(null, signedMessage, keyPair.privateKey);
const { response: verifyResponse, payload: verified } = await request("/auth/verify", {
  method: "POST",
  headers: unsafeHeaders,
  body: JSON.stringify({
    challengeId: challenge.challengeId,
    proof: {
      account: { address, publicKey: toBase64(publicKey) },
      signedMessage: toBase64(signedMessage),
      signature: toBase64(signature),
      signatureType: "ed25519",
    },
  }),
});
const cookie = String(verifyResponse.headers.get("set-cookie") || "").split(";", 1)[0];
if (!verified.authenticated || !cookie) throw new Error("verification did not create a session");

const authenticatedHeaders = { origin: ORIGIN, cookie };
const { payload: session } = await request("/auth/session", { headers: authenticatedHeaders });
const { payload: binder } = await request("/me/binder", { headers: authenticatedHeaders });
const { payload: updated } = await request("/me/binder", {
  method: "PUT",
  headers: {
    ...unsafeHeaders,
    cookie,
    "x-csrf-token": verified.csrfToken,
  },
  body: JSON.stringify({
    revision: binder.revision,
    isPublic: true,
    isDiscoverable: false,
    cardOrder: [],
    tradeCardIds: [],
    cover: {},
    table: {},
  }),
});
const { payload: publicBinder } = await request(`/binders/${address}`, {
  headers: { origin: ORIGIN },
});

if (
  !session.authenticated
  || session.profile?.walletAddress !== address
  || updated.revision !== binder.revision + 1
  || publicBinder.walletAddress !== address
) {
  throw new Error("local wallet binder smoke test returned inconsistent data");
}

console.log(`Local wallet sign-in and binder customization passed for ${address}.`);
