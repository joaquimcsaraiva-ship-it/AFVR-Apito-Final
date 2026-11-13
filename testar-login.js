require("dotenv/config");

const { verifyAdminCredentials } = require("./dist/src/services/auth.service");

console.log(
  verifyAdminCredentials("admin", "admin123")
);