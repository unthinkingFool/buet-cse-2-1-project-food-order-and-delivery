import { Pool } from "pg";
import dotenv from "dotenv"

dotenv.config()

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,

  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

export async function connectDB() {
  try {
    const client = await pool.connect();

    console.log("✅ PostgreSQL connected successfully.");

    const res = await client.query("SELECT NOW()");
    console.log("🕒 Database Time:", res.rows[0].now);

    client.release();
  } catch (error) {
    console.error("❌ PostgreSQL connection failed.");
    console.error(error.message);
    process.exit(1);
  }
}

export default pool;