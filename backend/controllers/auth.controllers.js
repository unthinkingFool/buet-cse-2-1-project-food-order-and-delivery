import bcrypt from "bcrypt";
import pool from "../config/db.js";
import genToken from "../utils/token.js";

export const signup = async (req, res) => {
  try {
    const { name, email, password, contact_no, role } = req.body;

    // Check if customer already exists
    const existingUser = await pool.query(
      `SELECT id FROM CUSTOMER WHERE email = $1`,
      [email],
    );

    if (existingUser.rows.length !== 0) {
      return res.status(400).json({
        message: "user already exists",
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        message: "password should be at least 6 characters",
      });
    }

    // Contact validation
    if (contact_no.length < 11) {
      return res.status(400).json({
        message: "contact_no should be at least 11 characters",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert customer
    const result = await pool.query(
      `INSERT INTO CUSTOMER
        (name, email, hashed_password, contact_no, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, contact_no, role`,
      [name, email, hashedPassword, contact_no, role],
    );

    const id = result.rows[0].id;

    // Generate JWT
    const token = await genToken(id);

    // Store token in cookie
    res.cookie("token", token, {
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return res.status(201).json({
      message: "success signing up",
      result: result.rows[0],
    });
  } catch (error) {
    console.error("SIGNUP ERROR:", error);

    return res.status(500).json({
      message: `error while signing up: ${error.message}`,
    });
  }
};

export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // if the customer exists in the database
    const result = await pool.query(
      `SELECT id, name, email, hashed_password, contact_no, role
       FROM CUSTOMER
       WHERE email = $1`,
      [email],
    );

    if (result.rows.length == 0) {
      // customer exists
      return res.status(400).json({
        message: "user does not exist",
      });
    }

    const isMatchPassword = await bcrypt.compare(
      password,
      result.rows[0].hashed_password,
    );

    if (!isMatchPassword) {
      return res.status(400).json({
        message: " incorrect password",
      });
    }

    const id = result.rows[0].id;
    const token = await genToken(id);

    res.cookie("token", token, {
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return res.status(200).json({
      message: "sign in successfully",
      name: result.rows[0].name,
      email:result.rows[0].email,
      role:result.rows[0].role
    });
  } catch (error) {
    return res.status(500).json({
      message: `error while signing in : ${error}`,
    });
  }
};

export const signout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({
      message: " successfully sign out",
    });
  } catch (error) {
    return res.status(500).json({
      message: `error signing out : ${error}`,
    });
  }
};
