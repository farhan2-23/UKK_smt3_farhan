import crypto from "node:crypto"
import mariadb from "mariadb"

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error("DATABASE_URL belum diatur.")
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16)
  const derivedKey = crypto.scryptSync(password, salt, 64)
  return `scrypt:${salt.toString("hex")}:${derivedKey.toString("hex")}`
}

async function main() {
  const url = new URL(databaseUrl)
  const connection = await mariadb.createConnection({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.slice(1)),
  })

  try {
    await connection.execute(
      `INSERT INTO users (fullname, email, password, role, created_at, updated_at)
       VALUES (?, ?, ?, 'admin', NOW(), NOW())
       ON DUPLICATE KEY UPDATE
         fullname = VALUES(fullname),
         password = VALUES(password),
         role = 'admin',
         created_at = IF(created_at = '0000-00-00 00:00:00', NOW(), created_at),
         updated_at = NOW()`,
      ["Administrator", "admin@gmail.com", hashPassword("12345678")],
    )
  } finally {
    await connection.end()
  }
}

main()
  .catch((error) => {
    console.error("Gagal membuat akun admin:", error)
    process.exitCode = 1
  })
