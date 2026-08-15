import { generateOTP } from "../utils/otp.js";
import transporter from "../config/mail.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const result = await pool.query(
      `SELECT email FROM CUSTOMER WHERE email = $1`,
      [email],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email",
      });
    }

    const otp = generateOTP();

    const otpHash = await bcrypt.hash(otp, 10);

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query(
      `
            DELETE FROM PASSWORD_RESET
            WHERE email = $1
            `,
      [email],
    );

    await pool.query(
      `
            INSERT INTO PASSWORD_RESET
            (
                email,
                otp_hash,
                expires_at
            )
            VALUES ($1, $2, $3)
            `,
      [email,  otpHash, expiresAt],
    );

    // ==========================
    // 10. Send OTP email
    // ==========================

    await transporter.sendMail({
      from: process.env.EMAIL_USER,

      to: email,

      subject: "KhaiDai Password Reset OTP",

      text: `
Your KhaiDai password reset OTP is:

${otp}

This OTP will expire in 10 minutes.

If you did not request a password reset,
please ignore this email.
            `,
    });

    // ==========================
    // 11. Response
    // ==========================

    return res.status(200).json({
      success: true,

      message: "OTP has been sent to your email",
      otp: `${otp}`,
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      success: false,

      message: "Something went wrong",
    });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const result = await pool.query(
      `
            SELECT *
            FROM PASSWORD_RESET
            WHERE email = $1
            ORDER BY created_at DESC
            LIMIT 1
            `,
      [email],
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "OTP not found or expired",
      });
    }

    const resetRequest = result.rows[0];

    if (new Date(resetRequest.expires_at) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    if (resetRequest.verified) {
      return res.status(400).json({
        success: false,
        message: "OTP has already been used",
      });
    }

    // ==========================
    // 6. Compare OTP
    // ==========================

    const isValidOTP = await bcrypt.compare(otp, resetRequest.otp_hash);

    if (!isValidOTP) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // ==========================
    // 7. Mark OTP verified
    // ==========================

    await pool.query(
      `
            UPDATE PASSWORD_RESET
            SET verified = TRUE
            WHERE id = $1
            `,
      [resetRequest.id],
    );

    // ==========================
    // 8. Success
    // ==========================

    return res.status(200).json({
      success: true,

      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);

    return res.status(500).json({
      success: false,

      message: "Something went wrong",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const resetResult = await pool.query(
      `
            SELECT *
            FROM PASSWORD_RESET
            WHERE email = $1
            AND verified = TRUE
            ORDER BY created_at DESC
            LIMIT 1
            `,
      [email],
    );

    if (resetResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "OTP verification required",
      });
    }

    const resetRequest = resetResult.rows[0];

    if (new Date(resetRequest.expires_at) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    const updateResult = await pool.query(
      `
            UPDATE CUSTOMER
            SET hashed_password = $1
            WHERE email = $2
            `,
      [hashedPassword, email],
    );

    if (updateResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User account not found",
      });
    }

    await pool.query(
      `
            DELETE FROM PASSWORD_RESET
            WHERE id = $1
            `,
      [resetRequest.id],
    );

    return res.status(200).json({
      success: true,

      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      success: false,

      message: "Something went wrong",
    });
  }
};
