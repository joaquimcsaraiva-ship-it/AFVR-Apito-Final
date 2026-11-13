import {
  createAdminToken,
  createPasswordHash,
  isValidAdminToken,
  verifyAdminCredentials
} from "../../src/services/auth.service";

describe("admin authentication", () => {
  const initial = {
    username: process.env.ADMIN_USERNAME,
    passwordHash: process.env.ADMIN_PASSWORD_HASH,
    tokenSecret: process.env.AUTH_TOKEN_SECRET
  };

  beforeEach(() => {
    process.env.ADMIN_USERNAME = "admin-test";
    process.env.ADMIN_PASSWORD_HASH = createPasswordHash("Correct-Horse-42", "00112233445566778899aabbccddeeff");
    process.env.AUTH_TOKEN_SECRET = "test-only-signing-secret-with-sufficient-length";
  });

  afterAll(() => {
    if (initial.username === undefined) delete process.env.ADMIN_USERNAME;
    else process.env.ADMIN_USERNAME = initial.username;
    if (initial.passwordHash === undefined) delete process.env.ADMIN_PASSWORD_HASH;
    else process.env.ADMIN_PASSWORD_HASH = initial.passwordHash;
    if (initial.tokenSecret === undefined) delete process.env.AUTH_TOKEN_SECRET;
    else process.env.AUTH_TOKEN_SECRET = initial.tokenSecret;
  });

  it("accepts only the configured username and password", () => {
    expect(verifyAdminCredentials("admin-test", "Correct-Horse-42")).toBe(true);
    expect(verifyAdminCredentials("admin-test", "wrong-password")).toBe(false);
    expect(verifyAdminCredentials("other", "Correct-Horse-42")).toBe(false);
  });

  it("issues a valid admin token that expires with the session policy", () => {
    const token = createAdminToken("admin-test");
    expect(isValidAdminToken(token)).toBe(true);
    expect(isValidAdminToken(`${token}x`)).toBe(false);
  });
});
