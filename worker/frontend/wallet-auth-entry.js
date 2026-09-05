import { SolanaSignIn, SolanaSignMessage } from "@solana/wallet-standard-features";
import { createSignInMessage } from "@solana/wallet-standard-util";
import { getWallets } from "@wallet-standard/app";
import bs58 from "bs58";

const STANDARD_CONNECT = "standard:connect";
const STANDARD_DISCONNECT = "standard:disconnect";
const STANDARD_EVENTS = "standard:events";
const SOLANA_MAINNET_CHAIN = "solana:mainnet";
const CLIENT_HEADER = "x-cards-art-client";
const CLIENT_HEADER_VALUE = "wallet-auth-v1";
const API_REQUEST_TIMEOUT_MS = 15_000;
const walletRegistry = getWallets();

export class WalletAuthClientError extends Error {
  constructor(message, code = "wallet_auth_failed", cause = null) {
    super(message, cause ? { cause } : undefined);
    this.name = "WalletAuthClientError";
    this.code = code;
  }
}

export function getCompatibleSolanaWallets() {
  return walletRegistry.get()
    .filter(isCompatibleSolanaWallet)
    .sort((left, right) => left.name.localeCompare(right.name, undefined, { sensitivity: "base" }));
}

export function isCanonicalSolanaAddress(value) {
  const address = String(value || "").trim();
  try {
    const bytes = bs58.decode(address);
    return bytes.length === 32 && bs58.encode(bytes) === address;
  } catch {
    return false;
  }
}

export function watchCompatibleSolanaWallets(listener) {
  const notify = () => listener(getCompatibleSolanaWallets());
  const offRegister = walletRegistry.on("register", notify);
  const offUnregister = walletRegistry.on("unregister", notify);
  return () => {
    offRegister();
    offUnregister();
  };
}

export async function signInWithSolanaWallet(wallet, apiBaseUrl) {
  if (!isCompatibleSolanaWallet(wallet)) {
    throw new WalletAuthClientError("This wallet cannot sign in to cards.art.", "wallet_unsupported");
  }

  let account;
  try {
    const result = await wallet.features[STANDARD_CONNECT].connect();
    account = selectSolanaAccount(result?.accounts || wallet.accounts);
  } catch (error) {
    throw normalizeWalletError(error, "Wallet connection was cancelled.", "connect_rejected");
  }
  if (!account) {
    throw new WalletAuthClientError("No Solana account was returned by this wallet.", "account_missing");
  }

  const challenge = await apiRequest(apiBaseUrl, "/auth/challenge", {
    method: "POST",
    body: { address: account.address },
  });
  let signed;
  try {
    if (wallet.features[SolanaSignIn]) {
      const outputs = await wallet.features[SolanaSignIn].signIn(challenge.input);
      signed = outputs?.[0];
    } else {
      const message = createSignInMessage(challenge.input);
      const outputs = await wallet.features[SolanaSignMessage].signMessage({ account, message });
      signed = outputs?.[0] ? { ...outputs[0], account } : null;
    }
  } catch (error) {
    throw normalizeWalletError(error, "Wallet signature was cancelled.", "signature_rejected");
  }
  if (!signed?.account || !signed?.signedMessage || !signed?.signature) {
    throw new WalletAuthClientError("The wallet returned an incomplete signature.", "signature_missing");
  }

  const session = await apiRequest(apiBaseUrl, "/auth/verify", {
    method: "POST",
    body: {
      challengeId: challenge.challengeId,
      proof: {
        account: {
          address: signed.account.address,
          publicKey: bytesToBase64(signed.account.publicKey),
        },
        signedMessage: bytesToBase64(signed.signedMessage),
        signature: bytesToBase64(signed.signature),
        ...(signed.signatureType ? { signatureType: signed.signatureType } : {}),
      },
    },
  });
  return { wallet, account: signed.account, session };
}

export async function getWalletAuthSession(apiBaseUrl) {
  return apiRequest(apiBaseUrl, "/auth/session", { method: "GET" });
}

export async function signOutWalletAuthSession(apiBaseUrl, csrfToken = "") {
  return apiRequest(apiBaseUrl, "/auth/logout", {
    method: "POST",
    csrfToken,
    body: {},
  });
}

export async function getPublicWalletBinder(apiBaseUrl, address) {
  return apiRequest(apiBaseUrl, `/binders/${encodeURIComponent(address)}`, { method: "GET" });
}

export async function getGlobalTradeStatuses(apiBaseUrl) {
  return apiRequest(apiBaseUrl, "/trade-statuses", { method: "GET" });
}

export async function getOwnerWalletBinder(apiBaseUrl) {
  return apiRequest(apiBaseUrl, "/me/binder", { method: "GET" });
}

export async function updateOwnerWalletBinder(apiBaseUrl, document, csrfToken = "") {
  return apiRequest(apiBaseUrl, "/me/binder", {
    method: "PUT",
    csrfToken,
    body: {
      revision: document.revision,
      isPublic: document.isPublic,
      isDiscoverable: document.isDiscoverable,
      cardOrder: document.cardOrder,
      tradeCardIds: document.tradeCardIds || [],
      cover: document.cover || {},
      table: document.table || {},
    },
  });
}

export function subscribeToWalletAccountChanges(wallet, listener) {
  const events = wallet?.features?.[STANDARD_EVENTS];
  if (!events?.on) return () => {};
  return events.on("change", (properties = {}) => {
    if (!Object.prototype.hasOwnProperty.call(properties, "accounts")) return;
    listener(selectSolanaAccount(properties.accounts || []));
  });
}

export async function disconnectSolanaWallet(wallet) {
  try {
    await wallet?.features?.[STANDARD_DISCONNECT]?.disconnect?.();
  } catch {
    // Session revocation is authoritative even when a wallet ignores disconnect.
  }
}

function isCompatibleSolanaWallet(wallet) {
  if (!wallet?.features?.[STANDARD_CONNECT]) return false;
  if (!wallet.chains?.includes(SOLANA_MAINNET_CHAIN)) return false;
  return Boolean(
    wallet.features[SolanaSignIn]
    || wallet.features[SolanaSignMessage],
  );
}

function selectSolanaAccount(accounts) {
  return (accounts || []).find((account) => (
    account?.chains?.includes(SOLANA_MAINNET_CHAIN)
    && account?.publicKey instanceof Uint8Array
  )) || null;
}

async function apiRequest(apiBaseUrl, path, options) {
  const method = options.method || "GET";
  const headers = new Headers({ accept: "application/json" });
  if (method !== "GET") {
    headers.set("content-type", "application/json");
    headers.set(CLIENT_HEADER, CLIENT_HEADER_VALUE);
    if (options.csrfToken) headers.set("x-csrf-token", options.csrfToken);
  }
  let response;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_REQUEST_TIMEOUT_MS);
  try {
    response = await fetch(`${normalizeApiBaseUrl(apiBaseUrl)}${path}`, {
      method,
      headers,
      credentials: "include",
      signal: controller.signal,
      ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    });
  } catch (error) {
    throw new WalletAuthClientError(
      error?.name === "AbortError"
        ? "The wallet service took too long to respond. Try again."
        : "Wallet sign-in is temporarily unavailable.",
      error?.name === "AbortError" ? "api_timeout" : "api_unavailable",
      error,
    );
  } finally {
    clearTimeout(timeout);
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new WalletAuthClientError(
      payload.message || "Wallet sign-in failed.",
      payload.error || "api_error",
    );
  }
  return payload;
}

function normalizeApiBaseUrl(value) {
  return String(value || "/api").replace(/\/+$/, "");
}

function bytesToBase64(value) {
  const bytes = value instanceof Uint8Array ? value : new Uint8Array(value || []);
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return btoa(binary);
}

function normalizeWalletError(error, fallbackMessage, code) {
  const message = String(error?.message || "").trim();
  return new WalletAuthClientError(message || fallbackMessage, code, error);
}
