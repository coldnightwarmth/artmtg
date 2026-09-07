// node_modules/@solana/wallet-standard-features/lib/esm/signIn.js
var SolanaSignIn = "solana:signIn";

// node_modules/@solana/wallet-standard-features/lib/esm/signMessage.js
var SolanaSignMessage = "solana:signMessage";

// node_modules/@solana/wallet-standard-util/lib/esm/signIn.js
var DOMAIN = "(?<domain>[^\\n]+?) wants you to sign in with your Solana account:\\n";
var ADDRESS = "(?<address>[^\\n]+)(?:\\n|$)";
var STATEMENT = "(?:\\n(?<statement>[\\S\\s]*?)(?:\\n|$))??";
var URI = "(?:\\nURI: (?<uri>[^\\n]+))?";
var VERSION = "(?:\\nVersion: (?<version>[^\\n]+))?";
var CHAIN_ID = "(?:\\nChain ID: (?<chainId>[^\\n]+))?";
var NONCE = "(?:\\nNonce: (?<nonce>[^\\n]+))?";
var ISSUED_AT = "(?:\\nIssued At: (?<issuedAt>[^\\n]+))?";
var EXPIRATION_TIME = "(?:\\nExpiration Time: (?<expirationTime>[^\\n]+))?";
var NOT_BEFORE = "(?:\\nNot Before: (?<notBefore>[^\\n]+))?";
var REQUEST_ID = "(?:\\nRequest ID: (?<requestId>[^\\n]+))?";
var RESOURCES = "(?:\\nResources:(?<resources>(?:\\n- [^\\n]+)*))?";
var FIELDS = `${URI}${VERSION}${CHAIN_ID}${NONCE}${ISSUED_AT}${EXPIRATION_TIME}${NOT_BEFORE}${REQUEST_ID}${RESOURCES}`;
var MESSAGE = new RegExp(`^${DOMAIN}${ADDRESS}${STATEMENT}${FIELDS}\\n*$`);
function createSignInMessage(input) {
  const text = createSignInMessageText(input);
  return new TextEncoder().encode(text);
}
function createSignInMessageText(input) {
  let message = `${input.domain} wants you to sign in with your Solana account:
`;
  message += `${input.address}`;
  if (input.statement) {
    message += `

${input.statement}`;
  }
  const fields = [];
  if (input.uri) {
    fields.push(`URI: ${input.uri}`);
  }
  if (input.version) {
    fields.push(`Version: ${input.version}`);
  }
  if (input.chainId) {
    fields.push(`Chain ID: ${input.chainId}`);
  }
  if (input.nonce) {
    fields.push(`Nonce: ${input.nonce}`);
  }
  if (input.issuedAt) {
    fields.push(`Issued At: ${input.issuedAt}`);
  }
  if (input.expirationTime) {
    fields.push(`Expiration Time: ${input.expirationTime}`);
  }
  if (input.notBefore) {
    fields.push(`Not Before: ${input.notBefore}`);
  }
  if (input.requestId) {
    fields.push(`Request ID: ${input.requestId}`);
  }
  if (input.resources) {
    fields.push(`Resources:`);
    for (const resource of input.resources) {
      fields.push(`- ${resource}`);
    }
  }
  if (fields.length) {
    message += `

${fields.join("\n")}`;
  }
  return message;
}

// node_modules/@wallet-standard/app/lib/esm/wallets.js
var __classPrivateFieldGet = function(receiver, state, kind, f) {
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = function(receiver, state, value, kind, f) {
  if (kind === "m") throw new TypeError("Private method is not writable");
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
};
var _AppReadyEvent_detail;
var wallets = void 0;
var registeredWalletsSet = /* @__PURE__ */ new Set();
function addRegisteredWallet(wallet) {
  cachedWalletsArray = void 0;
  registeredWalletsSet.add(wallet);
}
function removeRegisteredWallet(wallet) {
  cachedWalletsArray = void 0;
  registeredWalletsSet.delete(wallet);
}
var listeners = {};
function getWallets() {
  if (wallets)
    return wallets;
  wallets = Object.freeze({ register, get, on });
  if (typeof window === "undefined")
    return wallets;
  const api = Object.freeze({ register });
  try {
    window.addEventListener("wallet-standard:register-wallet", ({ detail: callback }) => callback(api));
  } catch (error) {
    console.error("wallet-standard:register-wallet event listener could not be added\n", error);
  }
  try {
    window.dispatchEvent(new AppReadyEvent(api));
  } catch (error) {
    console.error("wallet-standard:app-ready event could not be dispatched\n", error);
  }
  return wallets;
}
function register(...wallets2) {
  wallets2 = wallets2.filter((wallet) => !registeredWalletsSet.has(wallet));
  if (!wallets2.length)
    return () => {
    };
  wallets2.forEach((wallet) => addRegisteredWallet(wallet));
  listeners["register"]?.forEach((listener) => guard(() => listener(...wallets2)));
  return function unregister() {
    wallets2.forEach((wallet) => removeRegisteredWallet(wallet));
    listeners["unregister"]?.forEach((listener) => guard(() => listener(...wallets2)));
  };
}
var cachedWalletsArray;
function get() {
  if (!cachedWalletsArray) {
    cachedWalletsArray = [...registeredWalletsSet];
  }
  return cachedWalletsArray;
}
function on(event, listener) {
  listeners[event]?.push(listener) || (listeners[event] = [listener]);
  return function off() {
    listeners[event] = listeners[event]?.filter((existingListener) => listener !== existingListener);
  };
}
function guard(callback) {
  try {
    callback();
  } catch (error) {
    console.error(error);
  }
}
var AppReadyEvent = class extends Event {
  get detail() {
    return __classPrivateFieldGet(this, _AppReadyEvent_detail, "f");
  }
  get type() {
    return "wallet-standard:app-ready";
  }
  constructor(api) {
    super("wallet-standard:app-ready", {
      bubbles: false,
      cancelable: false,
      composed: false
    });
    _AppReadyEvent_detail.set(this, void 0);
    __classPrivateFieldSet(this, _AppReadyEvent_detail, api, "f");
  }
  /** @deprecated */
  preventDefault() {
    throw new Error("preventDefault cannot be called");
  }
  /** @deprecated */
  stopImmediatePropagation() {
    throw new Error("stopImmediatePropagation cannot be called");
  }
  /** @deprecated */
  stopPropagation() {
    throw new Error("stopPropagation cannot be called");
  }
};
_AppReadyEvent_detail = /* @__PURE__ */ new WeakMap();

// node_modules/base-x/src/esm/index.js
function base(ALPHABET2) {
  if (ALPHABET2.length >= 255) {
    throw new TypeError("Alphabet too long");
  }
  const BASE_MAP = new Uint8Array(256);
  for (let j = 0; j < BASE_MAP.length; j++) {
    BASE_MAP[j] = 255;
  }
  for (let i = 0; i < ALPHABET2.length; i++) {
    const x = ALPHABET2.charAt(i);
    const xc = x.charCodeAt(0);
    if (BASE_MAP[xc] !== 255) {
      throw new TypeError(x + " is ambiguous");
    }
    BASE_MAP[xc] = i;
  }
  const BASE = ALPHABET2.length;
  const LEADER = ALPHABET2.charAt(0);
  const FACTOR = Math.log(BASE) / Math.log(256);
  const iFACTOR = Math.log(256) / Math.log(BASE);
  function encode(source) {
    if (source instanceof Uint8Array) {
    } else if (ArrayBuffer.isView(source)) {
      source = new Uint8Array(source.buffer, source.byteOffset, source.byteLength);
    } else if (Array.isArray(source)) {
      source = Uint8Array.from(source);
    }
    if (!(source instanceof Uint8Array)) {
      throw new TypeError("Expected Uint8Array");
    }
    if (source.length === 0) {
      return "";
    }
    let zeroes = 0;
    let length = 0;
    let pbegin = 0;
    const pend = source.length;
    while (pbegin !== pend && source[pbegin] === 0) {
      pbegin++;
      zeroes++;
    }
    const size = (pend - pbegin) * iFACTOR + 1 >>> 0;
    const b58 = new Uint8Array(size);
    while (pbegin !== pend) {
      let carry = source[pbegin];
      let i = 0;
      for (let it1 = size - 1; (carry !== 0 || i < length) && it1 !== -1; it1--, i++) {
        carry += 256 * b58[it1] >>> 0;
        b58[it1] = carry % BASE >>> 0;
        carry = carry / BASE >>> 0;
      }
      if (carry !== 0) {
        throw new Error("Non-zero carry");
      }
      length = i;
      pbegin++;
    }
    let it2 = size - length;
    while (it2 !== size && b58[it2] === 0) {
      it2++;
    }
    let str = LEADER.repeat(zeroes);
    for (; it2 < size; ++it2) {
      str += ALPHABET2.charAt(b58[it2]);
    }
    return str;
  }
  function decodeUnsafe(source) {
    if (typeof source !== "string") {
      throw new TypeError("Expected String");
    }
    if (source.length === 0) {
      return new Uint8Array();
    }
    let psz = 0;
    let zeroes = 0;
    let length = 0;
    while (source[psz] === LEADER) {
      zeroes++;
      psz++;
    }
    const size = (source.length - psz) * FACTOR + 1 >>> 0;
    const b256 = new Uint8Array(size);
    while (psz < source.length) {
      const charCode = source.charCodeAt(psz);
      if (charCode > 255) {
        return;
      }
      let carry = BASE_MAP[charCode];
      if (carry === 255) {
        return;
      }
      let i = 0;
      for (let it3 = size - 1; (carry !== 0 || i < length) && it3 !== -1; it3--, i++) {
        carry += BASE * b256[it3] >>> 0;
        b256[it3] = carry % 256 >>> 0;
        carry = carry / 256 >>> 0;
      }
      if (carry !== 0) {
        throw new Error("Non-zero carry");
      }
      length = i;
      psz++;
    }
    let it4 = size - length;
    while (it4 !== size && b256[it4] === 0) {
      it4++;
    }
    const vch = new Uint8Array(zeroes + (size - it4));
    let j = zeroes;
    while (it4 !== size) {
      vch[j++] = b256[it4++];
    }
    return vch;
  }
  function decode(string) {
    const buffer = decodeUnsafe(string);
    if (buffer) {
      return buffer;
    }
    throw new Error("Non-base" + BASE + " character");
  }
  return {
    encode,
    decodeUnsafe,
    decode
  };
}
var esm_default = base;

// node_modules/bs58/src/esm/index.js
var ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
var esm_default2 = esm_default(ALPHABET);

// frontend/wallet-auth-entry.js
var STANDARD_CONNECT = "standard:connect";
var STANDARD_DISCONNECT = "standard:disconnect";
var STANDARD_EVENTS = "standard:events";
var SOLANA_MAINNET_CHAIN = "solana:mainnet";
var CLIENT_HEADER = "x-cards-art-client";
var CLIENT_HEADER_VALUE = "wallet-auth-v1";
var API_REQUEST_TIMEOUT_MS = 15e3;
var walletRegistry = getWallets();
var WalletAuthClientError = class extends Error {
  constructor(message, code = "wallet_auth_failed", cause = null) {
    super(message, cause ? { cause } : void 0);
    this.name = "WalletAuthClientError";
    this.code = code;
  }
};
function getCompatibleSolanaWallets() {
  return walletRegistry.get().filter(isCompatibleSolanaWallet).sort((left, right) => left.name.localeCompare(right.name, void 0, { sensitivity: "base" }));
}
function isCanonicalSolanaAddress(value) {
  const address = String(value || "").trim();
  try {
    const bytes = esm_default2.decode(address);
    return bytes.length === 32 && esm_default2.encode(bytes) === address;
  } catch {
    return false;
  }
}
function watchCompatibleSolanaWallets(listener) {
  const notify = () => listener(getCompatibleSolanaWallets());
  const offRegister = walletRegistry.on("register", notify);
  const offUnregister = walletRegistry.on("unregister", notify);
  return () => {
    offRegister();
    offUnregister();
  };
}
async function signInWithSolanaWallet(wallet, apiBaseUrl) {
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
    body: { address: account.address }
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
          publicKey: bytesToBase64(signed.account.publicKey)
        },
        signedMessage: bytesToBase64(signed.signedMessage),
        signature: bytesToBase64(signed.signature),
        ...signed.signatureType ? { signatureType: signed.signatureType } : {}
      }
    }
  });
  return { wallet, account: signed.account, session };
}
async function getWalletAuthSession(apiBaseUrl) {
  return apiRequest(apiBaseUrl, "/auth/session", { method: "GET" });
}
async function signOutWalletAuthSession(apiBaseUrl, csrfToken = "") {
  return apiRequest(apiBaseUrl, "/auth/logout", {
    method: "POST",
    csrfToken,
    body: {}
  });
}
async function getPublicWalletBinder(apiBaseUrl, address, options = {}) {
  return apiRequest(apiBaseUrl, `/binders/${encodeURIComponent(address)}`, {
    method: "GET",
    credentials: options.credentials
  });
}
async function getPublicWalletBinders(apiBaseUrl, options = {}) {
  const parameters = new URLSearchParams();
  const limit = Number(options.limit);
  if (Number.isInteger(limit) && limit > 0) parameters.set("limit", String(limit));
  const cursor = String(options.cursor || "").trim();
  if (cursor) parameters.set("cursor", cursor);
  const version = String(options.version || "").trim();
  if (version) parameters.set("v", version);
  const query = parameters.size ? `?${parameters}` : "";
  return apiRequest(apiBaseUrl, `/binders${query}`, {
    method: "GET",
    credentials: "omit"
  });
}
async function getPublicWalletBinderCover(apiBaseUrl, address) {
  return apiRequest(apiBaseUrl, `/binder-covers/${encodeURIComponent(address)}`, {
    method: "GET",
    credentials: "omit"
  });
}
async function getGlobalTradeStatuses(apiBaseUrl) {
  return apiRequest(apiBaseUrl, "/trade-statuses", { method: "GET" });
}
async function getOwnerWalletBinder(apiBaseUrl) {
  return apiRequest(apiBaseUrl, "/me/binder", { method: "GET" });
}
async function updateOwnerWalletBinder(apiBaseUrl, document, csrfToken = "") {
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
      table: document.table || {}
    }
  });
}
function subscribeToWalletAccountChanges(wallet, listener) {
  const events = wallet?.features?.[STANDARD_EVENTS];
  if (!events?.on) return () => {
  };
  return events.on("change", (properties = {}) => {
    if (!Object.prototype.hasOwnProperty.call(properties, "accounts")) return;
    listener(selectSolanaAccount(properties.accounts || []));
  });
}
async function disconnectSolanaWallet(wallet) {
  try {
    await wallet?.features?.[STANDARD_DISCONNECT]?.disconnect?.();
  } catch {
  }
}
function isCompatibleSolanaWallet(wallet) {
  if (!wallet?.features?.[STANDARD_CONNECT]) return false;
  if (!wallet.chains?.includes(SOLANA_MAINNET_CHAIN)) return false;
  return Boolean(
    wallet.features[SolanaSignIn] || wallet.features[SolanaSignMessage]
  );
}
function selectSolanaAccount(accounts) {
  return (accounts || []).find((account) => account?.chains?.includes(SOLANA_MAINNET_CHAIN) && account?.publicKey instanceof Uint8Array) || null;
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
      credentials: options.credentials || "include",
      signal: controller.signal,
      ...options.body ? { body: JSON.stringify(options.body) } : {}
    });
  } catch (error) {
    throw new WalletAuthClientError(
      error?.name === "AbortError" ? "The wallet service took too long to respond. Try again." : "Wallet sign-in is temporarily unavailable.",
      error?.name === "AbortError" ? "api_timeout" : "api_unavailable",
      error
    );
  } finally {
    clearTimeout(timeout);
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new WalletAuthClientError(
      payload.message || "Wallet sign-in failed.",
      payload.error || "api_error"
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
  for (let offset = 0; offset < bytes.length; offset += 32768) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 32768));
  }
  return btoa(binary);
}
function normalizeWalletError(error, fallbackMessage, code) {
  const message = String(error?.message || "").trim();
  return new WalletAuthClientError(message || fallbackMessage, code, error);
}
export {
  WalletAuthClientError,
  disconnectSolanaWallet,
  getCompatibleSolanaWallets,
  getGlobalTradeStatuses,
  getOwnerWalletBinder,
  getPublicWalletBinder,
  getPublicWalletBinderCover,
  getPublicWalletBinders,
  getWalletAuthSession,
  isCanonicalSolanaAddress,
  signInWithSolanaWallet,
  signOutWalletAuthSession,
  subscribeToWalletAccountChanges,
  updateOwnerWalletBinder,
  watchCompatibleSolanaWallets
};
