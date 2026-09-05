import bs58 from "bs58";
import {
  parseSignInMessage,
  verifySignIn,
} from "@solana/wallet-standard-util";

export const SOLANA_MAINNET_CHAIN = "solana:mainnet";
export const SIWS_VERSION = "1";
export const CHALLENGE_TTL_MS = 5 * 60 * 1000;
export const MAX_SIGNED_MESSAGE_BYTES = 4096;

export class AuthProofError extends Error {
  constructor(message, status = 400, code = "invalid_proof") {
    super(message);
    this.name = "AuthProofError";
    this.status = status;
    this.code = code;
  }
}

export function assertSolanaAddress(address) {
  const normalized = String(address || "").trim();
  let bytes;
  try {
    bytes = bs58.decode(normalized);
  } catch {
    throw new AuthProofError("Invalid Solana wallet address", 400, "invalid_address");
  }
  if (bytes.length !== 32 || bs58.encode(bytes) !== normalized) {
    throw new AuthProofError("Invalid Solana wallet address", 400, "invalid_address");
  }
  return normalized;
}

export function createChallengeInput({
  origin,
  address,
  statement,
  nonce,
  requestId,
  now = Date.now(),
}) {
  const originUrl = new URL(origin);
  const walletAddress = assertSolanaAddress(address);
  const issuedAt = new Date(now).toISOString();
  const expirationTime = new Date(now + CHALLENGE_TTL_MS).toISOString();
  return {
    domain: originUrl.host,
    address: walletAddress,
    statement,
    uri: originUrl.origin,
    version: SIWS_VERSION,
    chainId: SOLANA_MAINNET_CHAIN,
    nonce,
    issuedAt,
    expirationTime,
    requestId,
  };
}

export function challengeRowToInput(challenge) {
  let input;
  try {
    input = JSON.parse(challenge.input_json);
  } catch {
    throw new AuthProofError("Stored challenge is invalid", 500, "challenge_invalid");
  }
  return input;
}

export function verifyWalletProof(challenge, proof, now = Date.now()) {
  if (!challenge || challenge.consumed_at) {
    throw new AuthProofError("This sign-in request has already been used", 409, "challenge_used");
  }
  if (Number(challenge.expires_at) < now) {
    throw new AuthProofError("This sign-in request has expired", 410, "challenge_expired");
  }

  const address = assertSolanaAddress(proof?.account?.address);
  if (address !== challenge.wallet_address) {
    throw new AuthProofError("The signed wallet does not match this request", 400, "address_mismatch");
  }
  if (proof?.signatureType && proof.signatureType !== "ed25519") {
    throw new AuthProofError("Unsupported wallet signature type", 400, "signature_type");
  }

  const publicKey = decodeBase64Bytes(proof?.account?.publicKey, 32, "public key");
  const signature = decodeBase64Bytes(proof?.signature, 64, "signature");
  const signedMessage = decodeBase64Bytes(
    proof?.signedMessage,
    null,
    "signed message",
    MAX_SIGNED_MESSAGE_BYTES,
  );
  if (bs58.encode(publicKey) !== address) {
    throw new AuthProofError("The public key does not match the wallet address", 400, "public_key_mismatch");
  }

  const input = challengeRowToInput(challenge);
  const parsed = parseSignInMessage(signedMessage);
  if (!parsed || parsed.address !== address) {
    throw new AuthProofError("The wallet signed an invalid login message", 400, "message_invalid");
  }
  const output = {
    account: {
      address,
      publicKey,
      chains: [SOLANA_MAINNET_CHAIN],
      features: [],
    },
    signedMessage,
    signature,
    ...(proof?.signatureType ? { signatureType: proof.signatureType } : {}),
  };
  if (!verifySignIn(input, output)) {
    throw new AuthProofError("The wallet signature could not be verified", 401, "signature_invalid");
  }

  const issuedAt = Date.parse(parsed.issuedAt || "");
  const expirationTime = Date.parse(parsed.expirationTime || "");
  if (
    !Number.isFinite(issuedAt)
    || !Number.isFinite(expirationTime)
    || issuedAt !== Number(challenge.issued_at)
    || expirationTime !== Number(challenge.expires_at)
  ) {
    throw new AuthProofError("The login timestamps do not match", 400, "timestamp_mismatch");
  }
  return { address, input, output };
}

export function decodeBase64Bytes(value, exactLength, label, maximumLength = exactLength) {
  const encoded = String(value || "");
  if (!encoded || encoded.length > Math.max(64, (maximumLength || 0) * 2 + 16)) {
    throw new AuthProofError(`Invalid ${label}`, 400, "encoding_invalid");
  }
  let binary;
  try {
    binary = atob(encoded);
  } catch {
    throw new AuthProofError(`Invalid ${label}`, 400, "encoding_invalid");
  }
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  if (
    (Number.isInteger(exactLength) && bytes.length !== exactLength)
    || (Number.isInteger(maximumLength) && bytes.length > maximumLength)
  ) {
    throw new AuthProofError(`Invalid ${label}`, 400, "encoding_invalid");
  }
  return bytes;
}
