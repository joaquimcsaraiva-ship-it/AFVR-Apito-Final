import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "afvr_admin";
export const ADMIN_SESSION_SECONDS = 7 * 24 * 60 * 60;

function equalText(left: string, right: string): boolean {
  return timingSafeEqual(createHash("sha256").update(left).digest(), createHash("sha256").update(right).digest());
}

export function createPasswordHash(password: string, salt = randomBytes(16).toString("hex")): string {
  const hash = scryptSync(password, Buffer.from(salt, "hex"), 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

export function verifyAdminCredentials(username: string, password: string): boolean {
  const expectedUsername = process.env.ADMIN_USERNAME ?? "";
  const storedHash = process.env.ADMIN_PASSWORD_HASH ?? "";
  const tokenSecret = process.env.AUTH_TOKEN_SECRET ?? "";
  const [algorithm, salt, expectedHex] = storedHash.split(":");
  if (!expectedUsername || !salt || !expectedHex || algorithm !== "scrypt" || !tokenSecret) return false;

  try {
    const expected = Buffer.from(expectedHex, "hex");
    const supplied = scryptSync(password, Buffer.from(salt, "hex"), expected.length);
    return equalText(username, expectedUsername) && timingSafeEqual(supplied, expected);
  } catch {
    return false;
  }
}

export function createAdminToken(username: string): string {
  const secret = process.env.AUTH_TOKEN_SECRET;
  if (!secret) throw new Error("A autenticação de administração não está configurada.");
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ sub: username, role: "admin", iat: now, exp: now + ADMIN_SESSION_SECONDS }))
    .toString("base64url");
  const body = `${header}.${payload}`;
  const signature = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${signature}`;
}

export function isValidAdminToken(token: string): boolean {
  const secret = process.env.AUTH_TOKEN_SECRET;
  const username = process.env.ADMIN_USERNAME;
  if (!secret || !username) return false;
  try {
    const [headerPart, payloadPart, signaturePart, extra] = token.split(".");
    if (!headerPart || !payloadPart || !signaturePart || extra !== undefined) return false;
    const header = JSON.parse(Buffer.from(headerPart, "base64url").toString("utf8")) as { alg?: string };
    if (header.alg !== "HS256") return false;
    const body = `${headerPart}.${payloadPart}`;
    const expected = createHmac("sha256", secret).update(body).digest();
    const supplied = Buffer.from(signaturePart, "base64url");
    if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return false;
    const payload = JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8")) as { sub?: string; role?: string; exp?: number };
    return payload.sub === username && payload.role === "admin" && typeof payload.exp === "number" && payload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export function readAdminToken(cookieHeader: string | undefined): string | null {
  const token = cookieHeader?.split(";").map((part) => part.trim())
    .find((part) => part.startsWith(`${ADMIN_COOKIE}=`))?.slice(ADMIN_COOKIE.length + 1);
  if (!token) return null;
  try {
    return decodeURIComponent(token);
  } catch {
    return null;
  }
}
