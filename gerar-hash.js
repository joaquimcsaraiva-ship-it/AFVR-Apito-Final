const { randomBytes, scryptSync } = require("node:crypto");

const password = "admin2810";
const salt = randomBytes(16).toString("hex");
const hash = scryptSync(password, Buffer.from(salt, "hex"), 64).toString("hex");

console.log(`scrypt:${salt}:${hash}`);