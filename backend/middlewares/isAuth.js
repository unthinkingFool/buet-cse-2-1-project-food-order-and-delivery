import jwt from "jsonwebtoken";
import pool from "../config/db.js";
export const isAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(400).json({
        message: "token not found while authenticating",
      });
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (!decode) {
      return res.status(400).json({
        message: "token not verified while authenticating",
      });
    }

    console.log("Decoded token:", decode);

    req.id = decode.id;

    const result = await pool.query(`SELECT role FROM CUSTOMER WHERE id = $1`, [
      decode.id,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    req.role = result.rows[0].role;

    next();
  } catch (error) {
    console.error("IS AUTH ERROR:", error);

    return res.status(400).json({
      message: `error while authenticating (isAuth error) : ${error.message}`,
    });
  }
};
