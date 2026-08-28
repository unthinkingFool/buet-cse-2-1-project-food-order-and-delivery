import { generateOTP } from "../utils/otp.js";
import transporter from "../config/mail.js";
import bcrypt from "bcrypt";
import pool from "../config/db.js";

// ============================================================
// SEND DELIVERY OTP
// Rider clicks "Mark As Delivered"
// OTP is generated and sent to the customer email
// ============================================================

export const sendDeliveryOTP = async (req, res) => {
  try {
    const rider_id = req.id;

    const { shop_order_id } = req.body;

    // ========================================================
    // AUTHENTICATION
    // ========================================================

    if (!rider_id) {
      return res.status(401).json({
        success: false,
        message: "Rider is not authenticated",
      });
    }

    // ========================================================
    // CHECK SHOP ORDER ID
    // ========================================================

    if (!shop_order_id) {
      return res.status(400).json({
        success: false,
        message: "shop_order_id is required",
      });
    }

    // ========================================================
    // MAKE SURE USER IS A RIDER
    // ========================================================

    const riderResult = await pool.query(
      `
      SELECT id, name, email, role
      FROM CUSTOMER
      WHERE id = $1
        AND role = 'rider'
      `,
      [rider_id]
    );

    if (riderResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Only riders can generate delivery OTP",
      });
    }

    // ========================================================
    // GET SHOP ORDER + CUSTOMER
    // ========================================================

    const orderResult = await pool.query(
      `
      SELECT
          so.id AS shop_order_id,
          so.order_id,
          so.assigned_rider_id,
          so.status,

          fo.customer_id,

          c.name AS customer_name,
          c.email AS customer_email

      FROM SHOP_ORDER so

      JOIN FOOD_ORDER fo
        ON so.order_id = fo.id

      JOIN CUSTOMER c
        ON fo.customer_id = c.id

      WHERE so.id = $1
      `,
      [shop_order_id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Shop order not found",
      });
    }

    const order = orderResult.rows[0];

    // ========================================================
    // CHECK RIDER ASSIGNMENT
    // ========================================================

    if (
      order.assigned_rider_id === null ||
      Number(order.assigned_rider_id) !== Number(rider_id)
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this shop order",
      });
    }

    // ========================================================
    // CHECK ORDER STATUS
    // ========================================================

    if (order.status !== "out_for_delivery") {
      return res.status(400).json({
        success: false,
        message: "OTP can only be generated for an out-for-delivery order",
      });
    }

    // ========================================================
    // GENERATE OTP
    // ========================================================

    const otp = generateOTP();

    // ========================================================
    // HASH OTP
    // ========================================================

    const otpHash = await bcrypt.hash(otp, 10);

    // OTP expires after 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // ========================================================
    // REMOVE PREVIOUS OTP
    // ========================================================

    await pool.query(
      `
      DELETE FROM DELIVERY_OTP
      WHERE shop_order_id = $1
      `,
      [shop_order_id]
    );

    // ========================================================
    // SAVE NEW OTP
    // ========================================================

    await pool.query(
      `
      INSERT INTO DELIVERY_OTP
      (
          order_id,
          shop_order_id,
          rider_id,
          customer_email,
          otp_hash,
          expires_at
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        order.order_id,
        order.shop_order_id,
        rider_id,
        order.customer_email,
        otpHash,
        expiresAt,
      ]
    );

    // ========================================================
    // SEND EMAIL
    // ========================================================

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: order.customer_email,

      subject: "KhaiDai Delivery Verification OTP",

      text: `
Hello ${order.customer_name},

Your KhaiDai delivery verification OTP is:

${otp}

This OTP will expire in 10 minutes.

Please provide this OTP to your delivery rider when your order arrives.

If you did not request this delivery verification, please contact KhaiDai support.

Thank you,
KhaiDai
      `,
    });

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(200).json({
      success: true,
      message: "Delivery OTP has been sent to the customer email",
    });

  } catch (error) {
    console.error("SEND DELIVERY OTP ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Error while sending delivery OTP",
    });
  }
};


// ============================================================
// VERIFY DELIVERY OTP
// Rider enters OTP provided by customer
// ============================================================

export const verifyDeliveryOTP = async (req, res) => {
  const client = await pool.connect();

  try {
    const rider_id = req.id;

    const { shop_order_id, otp } = req.body;

    // ========================================================
    // AUTHENTICATION
    // ========================================================

    if (!rider_id) {
      return res.status(401).json({
        success: false,
        message: "Rider is not authenticated",
      });
    }

    // ========================================================
    // VALIDATE INPUT
    // ========================================================

    if (!shop_order_id || !otp) {
      return res.status(400).json({
        success: false,
        message: "shop_order_id and OTP are required",
      });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: "OTP must be a 6-digit number",
      });
    }

    // ========================================================
    // MAKE SURE USER IS A RIDER
    // ========================================================

    if (req.role !== "rider") {
      return res.status(403).json({
        success: false,
        message: "Only riders can verify delivery OTP",
      });
    }

    // ========================================================
    // START TRANSACTION
    // ========================================================

    await client.query("BEGIN");

    // ========================================================
    // GET SHOP ORDER
    // LOCK IT
    // ========================================================

    const shopOrderResult = await client.query(
      `
      SELECT
          id,
          order_id,
          assigned_rider_id,
          status
      FROM SHOP_ORDER
      WHERE id = $1
      FOR UPDATE
      `,
      [shop_order_id]
    );

    if (shopOrderResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message: "Shop order not found",
      });
    }

    const shopOrder = shopOrderResult.rows[0];

    // ========================================================
    // CHECK RIDER ASSIGNMENT
    // ========================================================

    if (
      shopOrder.assigned_rider_id === null ||
      Number(shopOrder.assigned_rider_id) !== Number(rider_id)
    ) {
      await client.query("ROLLBACK");

      return res.status(403).json({
        success: false,
        message: "You are not assigned to this shop order",
      });
    }

    // ========================================================
    // CHECK ORDER STATUS
    // ========================================================

    if (shopOrder.status !== "out_for_delivery") {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message: "This shop order is not out for delivery",
      });
    }

    // ========================================================
    // GET LATEST OTP
    // LOCK OTP ROW
    // ========================================================

    const otpResult = await client.query(
      `
      SELECT
          id,
          otp_hash,
          expires_at,
          verified,
          rider_id,
          customer_email
      FROM DELIVERY_OTP
      WHERE shop_order_id = $1
        AND rider_id = $2
      ORDER BY created_at DESC
      LIMIT 1
      FOR UPDATE
      `,
      [shop_order_id, rider_id]
    );

    if (otpResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message: "Delivery OTP not found",
      });
    }

    const deliveryOTP = otpResult.rows[0];

    // ========================================================
    // CHECK IF OTP ALREADY USED
    // ========================================================

    if (deliveryOTP.verified) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message: "This OTP has already been used",
      });
    }

    // ========================================================
    // CHECK EXPIRATION
    // ========================================================

    if (new Date(deliveryOTP.expires_at) < new Date()) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message: "Delivery OTP has expired",
      });
    }

    // ========================================================
    // COMPARE OTP
    // ========================================================

    const isValidOTP = await bcrypt.compare(
      otp,
      deliveryOTP.otp_hash
    );

    if (!isValidOTP) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message: "Invalid delivery OTP",
      });
    }

    // ========================================================
    // MARK OTP VERIFIED
    // ========================================================

    await client.query(
      `
      UPDATE DELIVERY_OTP
      SET verified = TRUE
      WHERE id = $1
      `,
      [deliveryOTP.id]
    );

    // ========================================================
    // UPDATE SHOP ORDER
    // ========================================================

    const updatedOrderResult = await client.query(
      `
      UPDATE SHOP_ORDER
      SET
          status = 'delivered',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING
          id,
          order_id,
          assigned_rider_id,
          status,
          updated_at
      `,
      [shop_order_id]
    );

    // ========================================================
    // COMPLETE DELIVERY ASSIGNMENT
    // ========================================================

    const updatedAssignmentResult = await client.query(
      `
      UPDATE SHOP_ORDER_DELIVERY_ASSIGNMENT
      SET
          assignment_status = 'completed'
      WHERE shop_order_id = $1
        AND assigned_to = $2
      RETURNING
          id,
          shop_order_id,
          assigned_to,
          assignment_status,
          accepted_at
      `,
      [shop_order_id, rider_id]
    );

    // ========================================================
    // COMMIT
    // ========================================================

    await client.query("COMMIT");

    // ========================================================
    // SUCCESS
    // ========================================================

    return res.status(200).json({
      success: true,
      message: "Delivery OTP verified successfully. Order marked as delivered.",

      shopOrder: updatedOrderResult.rows[0],

      deliveryAssignment:
        updatedAssignmentResult.rows[0] || null,
    });

  } catch (error) {
    await client.query("ROLLBACK");

    console.error("VERIFY DELIVERY OTP ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Error while verifying delivery OTP",
    });

  } finally {
    client.release();
  }
};