const { randomBytes, scryptSync } = require("node:crypto");

function createPasswordHash(password, salt = randomBytes(16).toString("hex")) {
  const hash = scryptSync(password, Buffer.from(salt, "hex"), 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

console.log(createPasswordHash("admin123"));