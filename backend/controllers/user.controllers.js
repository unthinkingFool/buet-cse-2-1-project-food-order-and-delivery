import pool from "../config/db.js";

export const getCurrentUser = async (req, res) => {
  try {
    const id = req.id;

    if (!id) {
      return res.status(400).json({
        message: "could not find user id after authntication",
      });
    }

    const result = await pool.query(
      `SELECT
        id,
        name,
        email,
        hashed_password,
        contact_no,
        role,
        latitude,
        longitude,
        ST_AsGeoJSON(location)::json AS location
       FROM CUSTOMER
       WHERE id = $1`,
      [id],
    );

    if (result.rows.length == 0) {
      return res.status(400).json({
        message: "could not find user after authntication",
      });
    }

    const user = result.rows[0];

    return res.status(200).json(user);
  } catch (error) {
    return res.status(400).json({
      message: `error while getting current user : ${error}`,
    });
  }
};

export const updateUserLocation = async (req, res) => {
  const client = await pool.connect();
  try {
    const id = req.id;

    const { latitude, longitude } = req.body;

    if (!id) {
      return res.status(401).json({
        message: "User is not authenticated",
      });
    }

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        message: "Latitude and longitude are required",
      });
    }

    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return res.status(400).json({
        message: "Invalid latitude or longitude",
      });
    }

    await client.query("BEGIN");
    const result = await client.query(
      `UPDATE CUSTOMER
   SET
     latitude = $1::numeric,
     longitude = $2::numeric,
     location = ST_SetSRID(
       ST_MakePoint(
         $2::double precision,
         $1::double precision
       ),
       4326
     )::geography,
     updated_at = CURRENT_TIMESTAMP
   WHERE id = $3::integer
   RETURNING
     id,
     latitude,
     longitude,
     ST_AsGeoJSON(location)::json AS location`,
      [latitude, longitude, id],
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        message: "User not found",
      });
    }

    await client.query("COMMIT");

    return res.status(200).json({
      message: "Location updated successfully",
      location: result.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("UPDATE LOCATION ERROR:", error);

    return res.status(500).json({
      message: `error while updating location: ${error.message}`,
    });
  } finally {
    await client.query("ROLLBACK").catch(() => {});
    client.release();
  }
};

export const getMyReceivedOrders = async (req, res) => {
  try {
    const customer_id = req.id;

    // Make sure the logged-in user is a customer
    const customerResult = await pool.query(
      `SELECT id, role
       FROM CUSTOMER
       WHERE id = $1`,
      [customer_id],
    );

    if (customerResult.rows.length === 0) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    if (customerResult.rows[0].role !== "customer") {
      return res.status(403).json({
        message: "Only customers can view received orders",
      });
    }

    const result = await pool.query(
      `
      SELECT
        so.id AS shop_order_id,
        so.order_id,
        so.restaurant_id,
        so.owner_id,
        so.subtotal,
        so.assigned_rider_id,
        so.status,
        so.created_at,
        so.updated_at,

        -- Restaurant information
        r.name AS restaurant_name,
        r.image_link AS restaurant_image,
        r.address AS restaurant_address,
        r.city AS restaurant_city,
        r.contact_no AS restaurant_contact,
        r.latitude AS restaurant_latitude,
        r.longitude AS restaurant_longitude,

        -- Rider information
        rider.id AS rider_id,
        rider.name AS rider_name,
        rider.email AS rider_email,
        rider.contact_no AS rider_contact,

        -- Delivery information
        fo.delivery_address,
        fo.latitude AS delivery_latitude,
        fo.longitude AS delivery_longitude,

        -- Payment information
        fo.payment_method,
        fo.total_amount,

        -- Ordered items
        COALESCE(
          json_agg(
            json_build_object(
              'order_item_id', oi.id,
              'item_id', oi.item_id,
              'item_name', i.name,
              'item_image', i.image_link,
              'price', oi.price,
              'quantity', oi.quantity,
              'item_total', oi.price * oi.quantity,
              'my_rating', review.rating
            )
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'
        ) AS items

      FROM SHOP_ORDER so

      JOIN FOOD_ORDER fo
        ON so.order_id = fo.id

      JOIN RESTAURANT r
        ON so.restaurant_id = r.id

      -- Rider who delivered the order
      LEFT JOIN CUSTOMER rider
        ON so.assigned_rider_id = rider.id

      LEFT JOIN ORDER_ITEM oi
        ON so.id = oi.shop_order_id

      LEFT JOIN ITEM i
        ON oi.item_id = i.id

      LEFT JOIN REVIEW review
        ON review.order_item_id = oi.id
       AND review.customer_id = $1

      WHERE fo.customer_id = $1
        AND so.status = 'delivered'

      GROUP BY
        so.id,
        so.order_id,
        so.restaurant_id,
        so.owner_id,
        so.subtotal,
        so.assigned_rider_id,
        so.status,
        so.created_at,
        so.updated_at,

        r.name,
        r.image_link,
        r.address,
        r.city,
        r.contact_no,
        r.latitude,
        r.longitude,

        rider.id,
        rider.name,
        rider.email,
        rider.contact_no,

        fo.delivery_address,
        fo.latitude,
        fo.longitude,
        fo.payment_method,
        fo.total_amount

      ORDER BY so.updated_at DESC
      `,
      [customer_id],
    );

    return res.status(200).json({
      message: "Received orders fetched successfully",
      orders: result.rows,
    });
  } catch (error) {
    console.error("GET MY RECEIVED ORDERS ERROR:", error);

    return res.status(500).json({
      message: "Error while fetching received orders",
    });
  }
};

export const getMyDeliveryCompletionNotifications = async (req, res) => {
  try {
    if (req.role !== "customer") {
      return res.status(403).json({ message: "Only customers can view delivery notifications" });
    }

    const result = await pool.query(
      `SELECT id, title, message, reference_id, created_at
       FROM NOTIFICATION
       WHERE recipient_id = $1
         AND recipient_role = 'customer'
         AND type = 'delivery_completed'
         AND is_read = FALSE
       ORDER BY created_at DESC
       LIMIT 20`,
      [req.id],
    );

    return res.status(200).json({ notifications: result.rows });
  } catch (error) {
    console.error("GET DELIVERY NOTIFICATIONS ERROR:", error);
    return res.status(500).json({ message: "Could not fetch delivery notifications" });
  }
};

export const markDeliveryNotificationRead = async (req, res) => {
  const client = await pool.connect();
  try {
    if (req.role !== "customer") {
      return res.status(403).json({ message: "Only customers can update delivery notifications" });
    }

    const { notification_id } = req.body;
    if (!notification_id) {
      return res.status(400).json({ message: "notification_id is required" });
    }

    await client.query("BEGIN");
    const result = await client.query(
      `UPDATE NOTIFICATION
       SET is_read = TRUE
       WHERE id = $1
         AND recipient_id = $2
         AND recipient_role = 'customer'
         AND type = 'delivery_completed'
         AND is_read = FALSE
       RETURNING id`,
      [notification_id, req.id],
    );
    await client.query("COMMIT");

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Unread delivery notification not found" });
    }

    return res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("MARK DELIVERY NOTIFICATION READ ERROR:", error);
    return res.status(500).json({ message: "Could not update delivery notification" });
  } finally {
    await client.query("ROLLBACK").catch(() => {});
    client.release();
  }
};


