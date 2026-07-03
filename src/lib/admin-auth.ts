/**
 * Lightweight HMAC-signed session cookie for the single-owner admin panel.
 *
 * Cookie value: `<base64url(payload)>.<base64url(signature)>`
 * Payload: `{ "iat": number, "exp": number }` (no PII; the holder is "the owner")
 * Signature: HMAC-SHA256 over the payload, keyed with `ADMIN_SESSION_SECRET`.
 *
 * Verification re-derives the signature from the payload and compares using
 * a constant-time check; expired tokens are rejected.
 */

export const ADMIN_COOKIE = 'aircrushin_admin'
const ONE_DAY = 60 * 60 * 24
const SESSION_TTL_SECONDS = 7 * ONE_DAY

function base64UrlEncode(bytes: Uint8Array): string {
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlDecode(input: string): Uint8Array<ArrayBuffer> {
  const pad = input.length % 4 === 0 ? '' : '='.repeat(4 - (input.length % 4))
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/') + pad
  const bin = atob(b64)
  const out = new Uint8Array(new ArrayBuffer(bin.length))
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

async function hmacKey(): Promise<CryptoKey> {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret || secret.length < 16) {
    throw new Error(
      'ADMIN_SESSION_SECRET is missing or too short. Set a 32+ char random string.',
    )
  }
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a[i]! ^ b[i]!
  return diff === 0
}

export interface SessionPayload {
  iat: number
  exp: number
}

export async function signSession(): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const payload: SessionPayload = { iat: now, exp: now + SESSION_TTL_SECONDS }
  const payloadBytes = new TextEncoder().encode(JSON.stringify(payload))
  const key = await hmacKey()
  const sigBuf = await crypto.subtle.sign('HMAC', key, payloadBytes)
  return `${base64UrlEncode(payloadBytes)}.${base64UrlEncode(new Uint8Array(sigBuf))}`
}

export async function verifySession(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token || typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length !== 2) return null
  const [payloadB64, sigB64] = parts as [string, string]
  let payloadBytes: Uint8Array<ArrayBuffer>
  let sigBytes: Uint8Array<ArrayBuffer>
  try {
    payloadBytes = base64UrlDecode(payloadB64)
    sigBytes = base64UrlDecode(sigB64)
  } catch {
    return null
  }
  const key = await hmacKey()
  const expectedBuf = await crypto.subtle.sign('HMAC', key, payloadBytes)
  if (!timingSafeEqual(new Uint8Array(expectedBuf), sigBytes)) return null
  let parsed: SessionPayload
  try {
    parsed = JSON.parse(new TextDecoder().decode(payloadBytes)) as SessionPayload
  } catch {
    return null
  }
  if (typeof parsed.exp !== 'number') return null
  if (parsed.exp * 1000 < Date.now()) return null
  return parsed
}

export function buildSessionCookie(token: string): string {
  const maxAge = SESSION_TTL_SECONDS
  return [
    `${ADMIN_COOKIE}=${token}`,
    'Path=/',
    `Max-Age=${maxAge}`,
    'HttpOnly',
    'SameSite=Lax',
    process.env.NODE_ENV === 'production' ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ')
}

export function buildLogoutCookie(): string {
  return [
    `${ADMIN_COOKIE}=`,
    'Path=/',
    'Max-Age=0',
    'HttpOnly',
    'SameSite=Lax',
    process.env.NODE_ENV === 'production' ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ')
}

export function getCookie(cookieHeader: string | null | undefined, name: string): string | undefined {
  if (!cookieHeader) return undefined
  const parts = cookieHeader.split(/;\s*/)
  for (const part of parts) {
    const eq = part.indexOf('=')
    if (eq === -1) continue
    const k = part.slice(0, eq).trim()
    if (k === name) return decodeURIComponent(part.slice(eq + 1))
  }
  return undefined
}
