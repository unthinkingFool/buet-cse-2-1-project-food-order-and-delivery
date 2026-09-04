import pool from "../config/db.js";
import axios from "axios";
import crypto from "crypto";

export const initiatePayment = async (req, res) => {
  const client = await pool.connect();

  try {
    const customer_id = req.id;
    const { order_id } = req.body;

    if (!order_id) {
      return res.status(400).json({
        message: "order_id is required",
      });
    }

    // ============================================================
    // 1. GET THE FOOD ORDER
    // ============================================================

    const orderResult = await client.query(
      `
      SELECT
        fo.id,
        fo.customer_id,
        fo.payment_method,
        fo.total_amount,
        fo.delivery_address
      FROM FOOD_ORDER fo
      WHERE fo.id = $1
        AND fo.customer_id = $2
      `,
      [order_id, customer_id],
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const order = orderResult.rows[0];

    // ============================================================
    // 2. MAKE SURE THIS IS AN ONLINE PAYMENT
    // ============================================================

    if (order.payment_method !== "online") {
      return res.status(400).json({
        message: "This order does not require online payment",
      });
    }

    // ============================================================
    // 3. CHECK WHETHER PAYMENT ALREADY EXISTS
    // ============================================================

    const existingPaymentResult = await client.query(
      `
      SELECT
        id,
        transaction_id,
        amount,
        status
      FROM PAYMENT
      WHERE order_id = $1
      `,
      [order_id],
    );

    if (existingPaymentResult.rows.length > 0) {
      const existingPayment = existingPaymentResult.rows[0];

      if (existingPayment.status === "paid") {
        return res.status(400).json({
          message: "This order has already been paid",
        });
      }

      // We can reuse pending payments later if needed.
      // For now, prevent duplicate payment creation.
      if (existingPayment.status === "pending") {
        return res.status(400).json({
          message: "A payment is already pending for this order",
          transaction_id: existingPayment.transaction_id,
        });
      }
    }

    // ============================================================
    // 4. GENERATE UNIQUE TRANSACTION ID
    // ============================================================

    const transaction_id = `KHAIDAI_${order.id}_${Date.now()}_${crypto
      .randomBytes(4)
      .toString("hex")}`;

    const amount = Number(order.total_amount);

    // ============================================================
    // 5. CREATE PAYMENT RECORD
    // ============================================================

    await client.query("BEGIN");

    const paymentResult = await client.query(
      `
      INSERT INTO PAYMENT (
        order_id,
        payment_provider,
        method,
        transaction_id,
        amount,
        status
      )
      VALUES (
        $1,
        'bkash',
        'online',
        $2,
        $3,
        'pending'
      )
      RETURNING *
      `,
      [order.id, transaction_id, amount],
    );

    const payment = paymentResult.rows[0];

    // ============================================================
    // 6. SSLCOMMERZ CONFIG
    // ============================================================

    const isSandbox =
      process.env.SSLCOMMERZ_IS_SANDBOX !== "false";

    const sslcommerzUrl = isSandbox
      ? "https://sandbox.sslcommerz.com/gwprocess/v4/api.php"
      : "https://securepay.sslcommerz.com/gwprocess/v4/api.php";

    // ============================================================
    // 7. CALLBACK URLS
    // ============================================================

    const serverUrl = process.env.SERVER_URL;
    const clientUrl = process.env.CLIENT_URL;

    const successUrl =
      `${serverUrl}/api/payment/success`;

    const failUrl =
      `${serverUrl}/api/payment/fail`;

    const cancelUrl =
      `${serverUrl}/api/payment/cancel`;

    const ipnUrl =
      `${serverUrl}/api/payment/ipn`;

    // ============================================================
    // 8. CUSTOMER INFORMATION
    // ============================================================

    const customerResult = await client.query(
      `
      SELECT
        id,
        name,
        email,
        contact_no
      FROM CUSTOMER
      WHERE id = $1
      `,
      [customer_id],
    );

    if (customerResult.rows.length === 0) {
      throw new Error("Customer not found");
    }

    const customer = customerResult.rows[0];

    // ============================================================
    // 9. SSLCOMMERZ REQUEST
    // ============================================================

    const sslcommerzData = new URLSearchParams();

    sslcommerzData.append(
      "store_id",
      process.env.SSLCOMMERZ_STORE_ID,
    );

    sslcommerzData.append(
      "store_passwd",
      process.env.SSLCOMMERZ_STORE_PASSWORD,
    );

    sslcommerzData.append(
      "total_amount",
      amount.toFixed(2),
    );

    sslcommerzData.append(
      "currency",
      "BDT",
    );

    sslcommerzData.append(
      "tran_id",
      transaction_id,
    );

    sslcommerzData.append(
      "success_url",
      successUrl,
    );

    sslcommerzData.append(
      "fail_url",
      failUrl,
    );

    sslcommerzData.append(
      "cancel_url",
      cancelUrl,
    );

    sslcommerzData.append(
      "ipn_url",
      ipnUrl,
    );

    // ============================================================
    // CUSTOMER INFORMATION
    // ============================================================

    sslcommerzData.append(
      "cus_name",
      customer.name,
    );

    sslcommerzData.append(
      "cus_email",
      customer.email,
    );

    sslcommerzData.append(
      "cus_add1",
      order.delivery_address,
    );

    sslcommerzData.append(
      "cus_city",
      "Dhaka",
    );

    sslcommerzData.append(
      "cus_country",
      "Bangladesh",
    );

    sslcommerzData.append(
      "cus_phone",
      customer.contact_no,
    );

    // ============================================================
    // SHIPPING INFORMATION
    // ============================================================

    sslcommerzData.append(
      "shipping_method",
      "NO",
    );

    // ============================================================
    // PRODUCT INFORMATION
    // ============================================================

    sslcommerzData.append(
      "product_name",
      "KhaiDai Food Order",
    );

    sslcommerzData.append(
      "product_category",
      "Food",
    );

    sslcommerzData.append(
      "product_profile",
      "general",
    );

    // ============================================================
    // OPTIONAL CUSTOM VALUES
    // ============================================================

    sslcommerzData.append(
      "value_a",
      String(order.id),
    );

    sslcommerzData.append(
      "value_b",
      String(customer.id),
    );

    // ============================================================
    // 10. SEND REQUEST TO SSLCOMMERZ
    // ============================================================

    const sslResponse = await axios.post(
      sslcommerzUrl,
      sslcommerzData.toString(),
      {
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
        timeout: 30000,
      },
    );

    const sslData = sslResponse.data;

    console.log(
      "SSLCOMMERZ INIT RESPONSE:",
      sslData,
    );

    // ============================================================
    // 11. CHECK GATEWAY URL
    // ============================================================

    if (
      !sslData ||
      !sslData.GatewayPageURL
    ) {
      await client.query("ROLLBACK");

      console.error(
        "SSLCOMMERZ INIT FAILED:",
        sslData,
      );

      return res.status(502).json({
        message:
          "Unable to initialize SSLCOMMERZ payment",
        sslcommerz_response: sslData,
      });
    }

    // ============================================================
    // 12. COMMIT PAYMENT
    // ============================================================

    await client.query("COMMIT");

    // ============================================================
    // 13. RETURN GATEWAY URL
    // ============================================================

    return res.status(200).json({
      message: "Payment initialized successfully",

      payment: {
        id: payment.id,
        order_id: payment.order_id,
        transaction_id: payment.transaction_id,
        amount: payment.amount,
        status: payment.status,
      },

      gateway_url: sslData.GatewayPageURL,
    });

  } catch (error) {
    await client.query("ROLLBACK");

    console.error(
      "INITIATE PAYMENT ERROR:",
      error.response?.data || error,
    );

    return res.status(500).json({
      message: "Error while initiating payment",
      error:
        error.response?.data ||
        error.message,
    });
  } finally {
    client.release();
  }
};