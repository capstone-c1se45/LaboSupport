import mysql from "mysql2/promise";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";
import dotenvFlow from "dotenv-flow";
import { nanoidNumbersOnly } from "../src/untils/nanoid.js";

dotenvFlow.config();

try {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT,
  });

  console.log("✅ Connected to MySQL");



  const roleAdminId = nanoidNumbersOnly(10);
  const roleUserId = nanoidNumbersOnly(10);

  const roles = [
    [roleAdminId, "admin", "Quản trị hệ thống"],
    [roleUserId, "user", "Người dùng thường"],
  ];

  await connection.query(
    "INSERT INTO Role (role_id, role_name, description) VALUES ?",
    [roles]
  );
  console.log("✅ Seeded roles: admin, user");

  // === Insert Users ===
  const passwordAdmin = await bcrypt.hash("admin123", 10);
  const passwordUser = await bcrypt.hash("user123", 10);

  const users = [
    [
      nanoidNumbersOnly(12),
      "admin",
      passwordAdmin,
      "Administrator",
      "admin@example.com",
      faker.phone.number("09########"),
      roleAdminId,
    ],
    [
      nanoidNumbersOnly(12),
      "user01",
      passwordUser,
      faker.person.fullName(),
      faker.internet.email(),
      faker.phone.number("09########"),
      roleUserId,
    ],
  ];

  await connection.query(
    `INSERT INTO User (user_id, username, password_hash, full_name, email, phone, role_id)
     VALUES ?`,
    [users]
  );

  console.log("✅ Seeded users: admin, user01");

  await connection.end();
  console.log("✅ Database seed completed successfully!");
} catch (err) {
  console.error("❌ Seed failed:", err);
  process.exit(1);
}
