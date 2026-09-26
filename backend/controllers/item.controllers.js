import pool from "../config/db.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const addItem = async (req, res) => {
  const client = await pool.connect();
  try {
    const { name, category, food_type, description, price, discount_price } =
      req.body;

    const owner_id = req.id;

    let image_link;

    if (req.file) {
      image_link = await uploadOnCloudinary(req.file.path);
    }

    // Find restaurant belonging to this owner
    await client.query("BEGIN");
    const restaurantResult = await client.query(
      `SELECT id
       FROM RESTAURANT
       WHERE owner_id = $1`,
      [owner_id],
    );

    if (restaurantResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        message: "Restaurant not found",
      });
    }

    const restaurant_id = restaurantResult.rows[0].id;

    // Create item
    const result = await client.query(
      `INSERT INTO ITEM
        (
          restaurant_id,
          name,
          category,
          food_type,
          description,
          price,
          discount_price,
          image_link
        )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        restaurant_id,
        name,
        category,
        food_type,
        description,
        price,
        discount_price,
        image_link,
      ],
    );

    const item = result.rows[0];

    await client.query("COMMIT");
    return res.status(201).json({
      message: "Item created successfully",
      item,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error while creating item:", error);

    return res.status(500).json({
      message: `error while creating item : ${error.message}`,
    });
  } finally {
    await client.query("ROLLBACK").catch(() => {});
    client.release();
  }
};

export const editItem = async (req, res) => {
  const client = await pool.connect();
  try {
    const { name, category, food_type, description, price, discount_price } =
      req.body;

    const itemId = req.params.itemId;
    const owner_id = req.id;

    let image_link;

    if (req.file) {
      image_link = await uploadOnCloudinary(req.file.path);
    }

    // Find restaurant belonging to this owner
    await client.query("BEGIN");
    const restaurantResult = await client.query(
      `SELECT id
       FROM RESTAURANT
       WHERE owner_id = $1`,
      [owner_id],
    );

    if (restaurantResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        message: "Restaurant not found",
      });
    }

    const restaurant_id = restaurantResult.rows[0].id;

    // Update item only if it belongs to this restaurant
    const result = await client.query(
      `UPDATE ITEM
       SET
         name = $1,
         category = $2,
         food_type = $3,
         description = $4,
         price = $5,
         discount_price = $6,
         image_link = COALESCE($7, image_link),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
         AND restaurant_id = $9
       RETURNING *`,
      [
        name,
        category,
        food_type,
        description,
        price,
        discount_price,
        image_link,
        itemId,
        restaurant_id,
      ],
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        message: "Item not found",
      });
    }

    const item = result.rows[0];

    await client.query("COMMIT");
    return res.status(200).json({
      message: "Item updated successfully",
      item,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error while editing item:", error);

    return res.status(500).json({
      message: `error while editing item : ${error.message}`,
    });
  } finally {
    await client.query("ROLLBACK").catch(() => {});
    client.release();
  }
};

export const deleteItem = async (req, res) => {
  const client = await pool.connect();
  try {
    const item_id = req.params.itemId;
    const owner_id = req.id;

    // Find restaurant belonging to this owner
    await client.query("BEGIN");
    const restaurantResult = await client.query(
      `SELECT id
       FROM RESTAURANT
       WHERE owner_id = $1`,
      [owner_id],
    );

    if (restaurantResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        message: "Restaurant not found",
      });
    }

    const restaurant_id = restaurantResult.rows[0].id;

    // Delete only if the item belongs to this owner's restaurant
    const result = await client.query(
      `DELETE FROM ITEM
       WHERE id = $1
       AND restaurant_id = $2
       RETURNING *`,
      [item_id, restaurant_id],
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        message: "Item not found",
      });
    }

    await client.query("COMMIT");
    return res.status(200).json({
      message: "Item deleted successfully",
      item: result.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error while deleting item:", error);

    return res.status(500).json({
      message: `error while deleting item : ${error.message}`,
    });
  } finally {
    await client.query("ROLLBACK").catch(() => {});
    client.release();
  }
};

export const toggleItemAvailability = async (req, res) => {
  const client = await pool.connect();
  try {
    const owner_id = req.id;
    const { item_id } = req.params;

    // ==========================================
    // Validate item ID
    // ==========================================

    if (!item_id) {
      return res.status(400).json({
        message: "Item ID is required",
      });
    }

    // ==========================================
    // Owner-only endpoint
    // ==========================================

    if (req.role !== "owner") {
      return res.status(403).json({
        message: "Only restaurant owners can change item availability",
      });
    }

    // ==========================================
    // Find item and verify ownership
    // ==========================================

    await client.query("BEGIN");
    const itemResult = await client.query(
      `
      SELECT
        i.id,
        i.name,
        i.isavailable,
        i.restaurant_id,
        r.owner_id
      FROM ITEM i
      JOIN RESTAURANT r
        ON i.restaurant_id = r.id
      WHERE i.id = $1
        AND r.owner_id = $2
      `,
      [item_id, owner_id],
    );

    if (itemResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        message: "Item not found or you do not own this item",
      });
    }

    const item = itemResult.rows[0];

    // ==========================================
    // Toggle availability
    // ==========================================

    const newAvailability = !item.isavailable;

    const result = await client.query(
      `
      UPDATE ITEM
      SET
        isavailable = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
      `,
      [newAvailability, item_id],
    );

    await client.query("COMMIT");
    return res.status(200).json({
      message: newAvailability
        ? "Item is now available"
        : "Item is now unavailable",

      item: result.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("TOGGLE ITEM AVAILABILITY ERROR:", error);

    return res.status(500).json({
      message: "Error while changing item availability",
    });
  } finally {
    await client.query("ROLLBACK").catch(() => {});
    client.release();
  }
};

export const searchItems = async (req, res) => {
  try {
    // GET request -> data comes from req.query
    const { query, city } = req.query;

    if (!query || !city) {
      return res.status(400).json({
        success: false,
        message: "Query and city are required",
      });
    }

    const searchQuery = query.trim();

    if (!searchQuery) {
      return res.status(400).json({
        success: false,
        message: "Search query cannot be empty",
      });
    }

    const result = await pool.query(
      `
      SELECT
        i.id AS item_id,
        i.name AS item_name,
        i.category,
        i.food_type,
        i.description AS item_description,
        i.price,
        i.discount_price,
        i.image_link AS item_image,
        i.rating AS item_rating,
        i.isavailable,

        r.id AS restaurant_id,
        r.name AS restaurant_name,
        r.image_link AS restaurant_image,
        r.description AS restaurant_description,
        r.address AS restaurant_address,
        r.city AS restaurant_city,
        r.latitude AS restaurant_latitude,
        r.longitude AS restaurant_longitude,
        r.rating AS restaurant_rating

      FROM ITEM i

      JOIN RESTAURANT r
        ON i.restaurant_id = r.id

      WHERE
        LOWER(r.city) = LOWER($2)
        AND r.is_approved = TRUE
        AND r.status = 'open'
        AND i.isavailable = TRUE
        AND (
          i.name ILIKE '%' || $1 || '%'
          OR CAST(i.category AS TEXT) ILIKE '%' || $1 || '%'
        )

      ORDER BY
        CASE
          WHEN i.name ILIKE $1 THEN 1
          WHEN i.name ILIKE $1 || '%' THEN 2
          WHEN i.name ILIKE '%' || $1 || '%' THEN 3
          ELSE 4
        END,
        i.rating DESC NULLS LAST,
        i.name ASC
      `,
      [searchQuery, city.trim()],
    );

    return res.status(200).json({
      success: true,
      message: "Search results fetched successfully",
      count: result.rows.length,
      items: result.rows,
    });
  } catch (error) {
    console.error("SEARCH ITEMS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Error while searching items",
      error: error.message,
    });
  }
};


export const getItemTotalSold = async (req, res) => {
  try {
    const { itemId } = req.params;

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: "Item ID is required",
      });
    }

    const itemResult = await pool.query(
      `
      SELECT id AS item_id
      FROM ITEM
      WHERE id = $1
      `,
      [itemId],
    );

    if (itemResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    const result = await pool.query(
      `
      SELECT get_item_total_sold($1) AS total_sold
      `,
      [itemId],
    );

    return res.status(200).json({
      success: true,
      item_id: itemResult.rows[0].item_id,
      total_sold: result.rows[0].total_sold,
    });
  } catch (error) {
    console.error("GET ITEM TOTAL SOLD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Error while getting item total sold",
      error: error.message,
    });
  }
};



export const rating = async (req, res) => {
  const client = await pool.connect();
  try {
    const { orderItemId, rating } = req.body;

    if (req.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Only customers can submit ratings",
      });
    }

    if (!orderItemId || rating === undefined) {
      return res.status(400).json({
        success: false,
        message: "Order item ID and rating are required",
      });
    }

    if (
      !Number.isInteger(Number(rating)) ||
      Number(rating) < 1 ||
      Number(rating) > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    await client.query("BEGIN");

    // A customer may rate only one item line from an order they received.
    const deliveredItem = await client.query(
      `
      SELECT oi.item_id
      FROM ORDER_ITEM oi
      JOIN SHOP_ORDER so ON so.id = oi.shop_order_id
      JOIN FOOD_ORDER fo ON fo.id = so.order_id
      WHERE oi.id = $1
        AND fo.customer_id = $2
        AND so.status = 'delivered'
      LIMIT 1
      `,
      [orderItemId, req.id],
    );

    if (deliveredItem.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(403).json({
        success: false,
        message: "You can rate only an item from one of your delivered orders",
      });
    }

    // The unique database index prevents duplicate ratings for this order item.
    const result = await client.query(
      `INSERT INTO REVIEW (order_item_id, item_id, customer_id, rating)
       VALUES ($1, $2, $3, $4)
       RETURNING id, order_item_id, item_id, customer_id, rating`,
      [orderItemId, deliveredItem.rows[0].item_id, req.id, Number(rating)],
    );

    // trg_refresh_rating_summaries updates ITEM.rating and RESTAURANT.rating here.
    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "Rating submitted successfully",
      review: result.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.log("error while handling rating in the backend : ", error);

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "You have already rated this order item",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  } finally {
    client.release();
  }
};
