import pool from "../config/db.js";

export const getBroadcastedShopOrders = async (req, res) => {
  try {
    const rider_id = req.id;

    if (!rider_id) {
      return res.status(401).json({
        message: "Rider is not authenticated",
      });
    }

    // Make sure the authenticated user is actually a rider
    const riderResult = await pool.query(
      `
      SELECT id, name, email, role
      FROM CUSTOMER
      WHERE id = $1
        AND role = 'rider'
      `,
      [rider_id],
    );

    if (riderResult.rows.length === 0) {
      return res.status(403).json({
        message: "Only riders can access broadcasted shop orders",
      });
    }

    const result = await pool.query(
      `
      SELECT
        -- Shop order
        so.id AS shop_order_id,
        so.order_id,
        so.restaurant_id,
        so.owner_id,
        so.subtotal,
        so.assigned_rider_id,
        so.status AS shop_order_status,
        so.created_at AS shop_order_created_at,
        so.updated_at AS shop_order_updated_at,

        -- Delivery assignment
        da.id AS delivery_assignment_id,
        da.total_amount,
        da.assigned_to,
        da.assignment_status,
        da.accepted_at,
        da.created_at AS assignment_created_at,

        -- Restaurant
        r.name AS restaurant_name,
        r.image_link AS restaurant_image,
        r.address AS restaurant_address,
        r.city AS restaurant_city,
        r.latitude AS restaurant_latitude,
        r.longitude AS restaurant_longitude,

        -- Customer delivery information
        fo.customer_id,
        fo.payment_method,
        fo.delivery_address,
        fo.latitude AS delivery_latitude,
        fo.longitude AS delivery_longitude,
        fo.total_amount AS order_total_amount,

        -- Broadcast information
        sbt.id AS broadcast_id

      FROM SHOP_ORDER_BROADCASTED_TO sbt

      JOIN SHOP_ORDER_DELIVERY_ASSIGNMENT da
        ON da.id = sbt.delivery_assignment_id

      JOIN SHOP_ORDER so
        ON so.id = sbt.shop_order_id

      JOIN RESTAURANT r
        ON r.id = so.restaurant_id

      JOIN FOOD_ORDER fo
        ON fo.id = so.order_id

      WHERE sbt.customer_id = $1

        -- Only show offers that are still available
        AND da.assignment_status = 'broadcasted'
        AND da.assigned_to IS NULL

        -- The shop order itself must still be available
        AND so.assigned_rider_id IS NULL
        AND so.status = 'out_for_delivery'

      ORDER BY sbt.id DESC
      `,
      [rider_id],
    );

    // Get items for every broadcasted shop order
    const shopOrders = [];

    for (const order of result.rows) {
      const itemsResult = await pool.query(
        `
        SELECT
          oi.id,
          oi.item_id,
          i.name,
          i.image_link,
          oi.price,
          oi.quantity,
          (oi.price * oi.quantity) AS item_total

        FROM ORDER_ITEM oi

        JOIN ITEM i
          ON i.id = oi.item_id

        WHERE oi.shop_order_id = $1

        ORDER BY oi.id
        `,
        [order.shop_order_id],
      );

      shopOrders.push({
        broadcast_id: order.broadcast_id,

        shop_order_id: order.shop_order_id,
        order_id: order.order_id,

        delivery_assignment_id: order.delivery_assignment_id,

        restaurant: {
          id: order.restaurant_id,
          name: order.restaurant_name,
          image: order.restaurant_image,
          address: order.restaurant_address,
          city: order.restaurant_city,
          latitude: order.restaurant_latitude,
          longitude: order.restaurant_longitude,
        },

        delivery: {
          customer_id: order.customer_id,
          address: order.delivery_address,
          latitude: order.delivery_latitude,
          longitude: order.delivery_longitude,
        },

        items: itemsResult.rows,

        payment: {
          method: order.payment_method,
          shop_order_amount: order.subtotal,
          complete_order_amount: order.order_total_amount,
        },

        status: {
          shop_order: order.shop_order_status,
          assignment: order.assignment_status,
        },

        assignment: {
          id: order.delivery_assignment_id,
          assigned_to: order.assigned_to,
          accepted_at: order.accepted_at,
          total_amount: order.total_amount,
        },

        created_at: order.shop_order_created_at,
      });
    }

    return res.status(200).json({
      message: "Broadcasted shop orders fetched successfully",
      rider: riderResult.rows[0],
      count: shopOrders.length,
      shopOrders,
    });
  } catch (error) {
    console.error("GET BROADCASTED SHOP ORDERS ERROR:", error);

    return res.status(500).json({
      message: "Error while fetching broadcasted shop orders",
      error: error.message,
    });
  }
};

export const acceptShopOrder = async (req, res) => {
  const client = await pool.connect();

  try {
    const rider_id = req.id;
    const { shop_order_id } = req.body;

    if (!rider_id) {
      return res.status(401).json({
        message: "Rider is not authenticated",
      });
    }

    if (!shop_order_id) {
      return res.status(400).json({
        message: "shop_order_id is required",
      });
    }

    // Make sure the authenticated user is a rider
    const riderResult = await client.query(
      `
      SELECT id, name, email, role
      FROM CUSTOMER
      WHERE id = $1
        AND role = 'rider'
      `,
      [rider_id],
    );

    if (riderResult.rows.length === 0) {
      return res.status(403).json({
        message: "Only riders can accept shop orders",
      });
    }

    await client.query("BEGIN");

    // ============================================================
    // CHECK IF RIDER ALREADY HAS AN ACTIVE SHOP ORDER
    // ============================================================

    const activeOrderResult = await client.query(
      `
      SELECT
        id,
        order_id,
        status
      FROM SHOP_ORDER
      WHERE assigned_rider_id = $1
        AND status NOT IN ('delivered', 'cancelled')
      LIMIT 1
      FOR UPDATE
      `,
      [rider_id],
    );

    if (activeOrderResult.rows.length > 0) {
      await client.query("ROLLBACK");

      return res.status(409).json({
        message: "You already have an active delivery",
        activeShopOrder: activeOrderResult.rows[0],
      });
    }

    // ============================================================
    // LOCK THE DELIVERY ASSIGNMENT
    // ============================================================

    const assignmentResult = await client.query(
      `
      SELECT
        da.id,
        da.order_id,
        da.shop_order_id,
        da.restaurant_id,
        da.total_amount,
        da.assigned_to,
        da.assignment_status,
        da.accepted_at

      FROM SHOP_ORDER_DELIVERY_ASSIGNMENT da

      WHERE da.shop_order_id = $1

      FOR UPDATE
      `,
      [shop_order_id],
    );

    if (assignmentResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Delivery assignment not found",
      });
    }

    const assignment = assignmentResult.rows[0];

    // ============================================================
    // CHECK WHETHER THIS RIDER RECEIVED THE BROADCAST
    // ============================================================

    const broadcastResult = await client.query(
      `
      SELECT id
      FROM SHOP_ORDER_BROADCASTED_TO
      WHERE shop_order_id = $1
        AND delivery_assignment_id = $2
        AND customer_id = $3
      `,
      [shop_order_id, assignment.id, rider_id],
    );

    if (broadcastResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(403).json({
        message: "This delivery was not broadcasted to you",
      });
    }

    // ============================================================
    // CHECK WHETHER SOMEONE ELSE ALREADY ACCEPTED IT
    // ============================================================

    if (
      assignment.assigned_to !== null ||
      assignment.assignment_status !== "broadcasted"
    ) {
      await client.query("ROLLBACK");

      return res.status(409).json({
        message: "This delivery has already been accepted by another rider",
      });
    }

    // ============================================================
    // LOCK THE SHOP ORDER
    // ============================================================

    const shopOrderResult = await client.query(
      `
      SELECT
        id,
        order_id,
        restaurant_id,
        owner_id,
        subtotal,
        assigned_rider_id,
        status

      FROM SHOP_ORDER

      WHERE id = $1

      FOR UPDATE
      `,
      [shop_order_id],
    );

    if (shopOrderResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Shop order not found",
      });
    }

    const shopOrder = shopOrderResult.rows[0];

    // ============================================================
    // DOUBLE PROTECTION
    // ============================================================

    if (shopOrder.assigned_rider_id !== null) {
      await client.query("ROLLBACK");

      return res.status(409).json({
        message: "This shop order has already been assigned to another rider",
      });
    }

    if (shopOrder.status !== "out_for_delivery") {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message: "This shop order is no longer available for delivery",
      });
    }

    // ============================================================
    // ASSIGN RIDER TO SHOP_ORDER
    // ============================================================

    const updatedShopOrderResult = await client.query(
      `
      UPDATE SHOP_ORDER

      SET
        assigned_rider_id = $1,
        updated_at = CURRENT_TIMESTAMP

      WHERE id = $2

      RETURNING
        id,
        order_id,
        restaurant_id,
        owner_id,
        subtotal,
        assigned_rider_id,
        status,
        created_at,
        updated_at
      `,
      [rider_id, shop_order_id],
    );

    // ============================================================
    // UPDATE DELIVERY ASSIGNMENT
    // ============================================================

    const updatedAssignmentResult = await client.query(
      `
      UPDATE SHOP_ORDER_DELIVERY_ASSIGNMENT

      SET
        assigned_to = $1,
        assignment_status = 'assigned',
        accepted_at = CURRENT_TIMESTAMP

      WHERE id = $2

      RETURNING
        id,
        order_id,
        shop_order_id,
        restaurant_id,
        total_amount,
        assigned_to,
        assignment_status,
        accepted_at,
        created_at
      `,
      [rider_id, assignment.id],
    );

    // ============================================================
    // COMMIT
    // ============================================================

    await client.query("COMMIT");

    return res.status(200).json({
      message: "Shop order accepted successfully",

      shopOrder: updatedShopOrderResult.rows[0],

      deliveryAssignment: updatedAssignmentResult.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("ACCEPT SHOP ORDER ERROR:", error);

    return res.status(500).json({
      message: "Error while accepting shop order",
      error: error.message,
    });
  } finally {
    client.release();
  }
};
