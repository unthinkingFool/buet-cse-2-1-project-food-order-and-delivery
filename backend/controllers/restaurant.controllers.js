import pool from "../config/db.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const createOrEditRestaurant = async (req, res) => {
  try {
    const {
  name,
  city,
  description,
  address,
  contact_no,
  latitude,
  longitude,
} = req.body;

    const owner_id = req.id;

    let image_link;

    // Upload new image only if provided
    if (req.file) {
      image_link = await uploadOnCloudinary(req.file.path);
    }

    // Check whether this owner already has a restaurant
    const existingRestaurant = await pool.query(
      `SELECT id
       FROM RESTAURANT
       WHERE owner_id = $1`,
      [owner_id],
    );

    // ==========================================
    // RESTAURANT EXISTS → UPDATE
    // ==========================================
    if (existingRestaurant.rows.length > 0) {
      const result = await pool.query(
  `UPDATE RESTAURANT
   SET
     name = $1,
     city = $2,
     description = $3,
     address = $4,
     contact_no = $5,
     latitude = $6,
     longitude = $7,
     image_link = COALESCE($8, image_link)
   WHERE owner_id = $9
   RETURNING *`,
  [
    name,
    city,
    description,
    address,
    contact_no,
    latitude,
    longitude,
    image_link,
    owner_id,
  ],
);

      return res.status(200).json({
        message: "Restaurant updated successfully",
        restaurant: result.rows[0],
      });
    }

    // ==========================================
    // RESTAURANT DOES NOT EXIST → CREATE
    // ==========================================
    const result = await pool.query(
  `INSERT INTO RESTAURANT
    (
      owner_id,
      name,
      city,
      description,
      address,
      contact_no,
      image_link,
      latitude,
      longitude
    )
   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
   RETURNING *`,
  [
    owner_id,
    name,
    city,
    description,
    address,
    contact_no,
    image_link,
    latitude,
    longitude,
  ],
);

    return res.status(201).json({
      message: "Restaurant created successfully",
      restaurant: result.rows[0],
    });
  } catch (error) {
    console.error("Error while creating/updating restaurant:", error);

    return res.status(500).json({
      message: `error while creating/updating restaurant : ${error.message}`,
    });
  }
};

export const toggleRestaurantStatus = async (req, res) => {
  try {
    const owner_id = req.id;

    // Make sure the user is an owner
    if (req.role !== "owner") {
      return res.status(403).json({
        message: "Only restaurant owners can change restaurant status",
      });
    }

    // Get current restaurant status
    const restaurantResult = await pool.query(
      `
      SELECT id, name, status
      FROM RESTAURANT
      WHERE owner_id = $1
      `,
      [owner_id],
    );

    if (restaurantResult.rows.length === 0) {
      return res.status(404).json({
        message: "Restaurant not found",
      });
    }

    const restaurant = restaurantResult.rows[0];

    // Toggle status
    const newStatus =
      restaurant.status === "open" ? "closed" : "open";

    const result = await pool.query(
      `
      UPDATE RESTAURANT
      SET status = $1
      WHERE id = $2
      RETURNING *
      `,
      [newStatus, restaurant.id],
    );

    return res.status(200).json({
      message: `Restaurant is now ${newStatus}`,
      restaurant: result.rows[0],
    });
  } catch (error) {
    console.error("TOGGLE RESTAURANT STATUS ERROR:", error);

    return res.status(500).json({
      message: "Error while updating restaurant status",
    });
  }
};

export const getMyRestaurant = async (req, res) => {
  try {
    const owner_id = req.id;

    // Check whether the user exists and is an owner
    const userResult = await pool.query(
      `SELECT id, name, email, role
       FROM CUSTOMER
       WHERE id = $1`,
      [owner_id],
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (userResult.rows[0].role !== "owner") {
      return res.status(403).json({
        message: "User is not a restaurant owner",
      });
    }

    // Find restaurant owned by this user
    const result = await pool.query(
      `SELECT *
       FROM RESTAURANT
       WHERE owner_id = $1`,
      [owner_id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Restaurant not found",
      });
    }

    const restaurant = result.rows[0];

    return res.status(200).json({
      message: "Restaurant fetched successfully",
      restaurant,
    });
  } catch (error) {
    console.error("Error while getting my restaurant:", error);

    return res.status(500).json({
      message: `error while getting my restaurant : ${error.message}`,
    });
  }
};

export const getMyItems = async (req, res) => {
  try {
    const owner_id = req.id;

    // Find restaurant belonging to this owner
    const restaurantResult = await pool.query(
      `SELECT id
       FROM RESTAURANT
       WHERE owner_id = $1`,
      [owner_id],
    );

    if (restaurantResult.rows.length === 0) {
      return res.status(404).json({
        message: "Restaurant not found",
      });
    }

    const restaurant_id = restaurantResult.rows[0].id;

    // Get all items of this restaurant
    const result = await pool.query(
      `SELECT *
       FROM ITEM
       WHERE restaurant_id = $1
       ORDER BY created_at DESC`,
      [restaurant_id],
    );

    return res.status(200).json({
      message: "Items fetched successfully",
      items: result.rows,
    });
  } catch (error) {
    console.error("Error while getting restaurant items:", error);

    return res.status(500).json({
      message: `error while getting restaurant items : ${error.message}`,
    });
  }
};

export const getRestaurantByCity = async (req, res) => {
  try {
    const { city } = req.params;

    if (!city) {
      return res.status(400).json({
        message: "City is required",
      });
    }

    const result = await pool.query(
      `SELECT *
       FROM RESTAURANT
       WHERE LOWER(city) = LOWER($1)
         AND is_approved = TRUE
         AND status = 'open'
       ORDER BY rating DESC NULLS LAST, created_at DESC`,
      [city],
    );

    

    return res.status(200).json({
      message: "Restaurants fetched successfully",
      restaurants: result.rows,
    });
  } catch (error) {
    console.error("Error while getting restaurants by city:", error);

    return res.status(500).json({
      message: `error while getting restaurants by city : ${error.message}`,
    });
  }
};

export const getItemsByCity = async (req, res) => {
  try {
    const { city } = req.params;

    if (!city) {
      return res.status(400).json({
        message: "City is required",
      });
    }

    const result = await pool.query(
      `SELECT
        ITEM.*,
        RESTAURANT.name AS restaurant_name,
        RESTAURANT.city AS restaurant_city,
        RESTAURANT.id AS restaurant_id
       FROM ITEM
       INNER JOIN RESTAURANT
         ON ITEM.restaurant_id = RESTAURANT.id
       WHERE LOWER(RESTAURANT.city) = LOWER($1)
         AND RESTAURANT.is_approved = TRUE
         AND RESTAURANT.status = 'open'
         AND ITEM.isavailable = TRUE
       ORDER BY ITEM.rating DESC NULLS LAST, ITEM.created_at DESC`,
      [city],
    );

    return res.status(200).json({
      message: "Items fetched successfully",
      items: result.rows,
    });
  } catch (error) {
    console.error("Error while getting items by city:", error);

    return res.status(500).json({
      message: `error while getting items by city : ${error.message}`,
    });
  }
};

export const getMyCompletedOrders = async (req, res) => {
  try {
    const owner_id = req.id;

    // Make sure the user is an owner
    const ownerResult = await pool.query(
      `SELECT id, role
       FROM CUSTOMER
       WHERE id = $1`,
      [owner_id],
    );

    if (ownerResult.rows.length === 0) {
      return res.status(404).json({
        message: "Owner not found",
      });
    }

    if (ownerResult.rows[0].role !== "owner") {
      return res.status(403).json({
        message: "Only restaurant owners can view completed orders",
      });
    }

    // Find the restaurant owned by this owner
    const restaurantResult = await pool.query(
      `SELECT id, name
       FROM RESTAURANT
       WHERE owner_id = $1`,
      [owner_id],
    );

    if (restaurantResult.rows.length === 0) {
      return res.status(404).json({
        message: "Restaurant not found",
      });
    }

    const restaurant_id = restaurantResult.rows[0].id;

    // Get completed orders
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

        -- Restaurant
        r.name AS restaurant_name,
        r.image_link AS restaurant_image,

        -- Customer
        c.id AS customer_id,
        c.name AS customer_name,
        c.email AS customer_email,
        c.contact_no AS customer_contact,

        -- Rider who delivered the order
        rider.id AS rider_id,
        rider.name AS rider_name,
        rider.email AS rider_email,
        rider.contact_no AS rider_contact,

        -- Delivery
        fo.delivery_address,
        fo.latitude AS delivery_latitude,
        fo.longitude AS delivery_longitude,

        -- Payment
        fo.payment_method,
        fo.total_amount,

        -- Items
        COALESCE(
          json_agg(
            json_build_object(
              'order_item_id', oi.id,
              'item_id', oi.item_id,
              'item_name', i.name,
              'item_image', i.image_link,
              'price', oi.price,
              'quantity', oi.quantity,
              'item_total', oi.price * oi.quantity
            )
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'
        ) AS items

      FROM SHOP_ORDER so

      JOIN RESTAURANT r
        ON so.restaurant_id = r.id

      JOIN FOOD_ORDER fo
        ON so.order_id = fo.id

      -- Customer who placed the order
      JOIN CUSTOMER c
        ON fo.customer_id = c.id

      -- Rider who delivered the order
      LEFT JOIN CUSTOMER rider
        ON so.assigned_rider_id = rider.id

      LEFT JOIN ORDER_ITEM oi
        ON so.id = oi.shop_order_id

      LEFT JOIN ITEM i
        ON oi.item_id = i.id

      WHERE so.owner_id = $1
        AND so.restaurant_id = $2
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

        c.id,
        c.name,
        c.email,
        c.contact_no,

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
      [owner_id, restaurant_id],
    );

    return res.status(200).json({
      message: "Completed orders fetched successfully",
      orders: result.rows,
    });
  } catch (error) {
    console.error("GET MY COMPLETED ORDERS ERROR:", error);

    return res.status(500).json({
      message: "Error while fetching completed orders",
    });
  }
};

export const getItemsByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    if (!restaurantId) {
      return res.status(400).json({
        message: "Restaurant ID is required",
      });
    }

    // Check restaurant
    const restaurantResult = await pool.query(
      `
      SELECT
        id,
        owner_id,
        name,
        image_link,
        description,
        address,
        city,
        latitude,
        longitude,
        contact_no,
        rating,
        status
      FROM RESTAURANT
      WHERE id = $1
        AND is_approved = TRUE
      `,
      [restaurantId],
    );

    if (restaurantResult.rows.length === 0) {
      return res.status(404).json({
        message: "Restaurant not found",
      });
    }

    const restaurant = restaurantResult.rows[0];

    // Get ALL items including unavailable ones
    const itemsResult = await pool.query(
      `
      SELECT
        id,
        restaurant_id,
        name,
        category,
        food_type,
        description,
        price,
        discount_price,
        image_link,
        total_sold,
        rating,
        isavailable,
        created_at,
        updated_at
      FROM ITEM
      WHERE restaurant_id = $1
      ORDER BY created_at DESC
      `,
      [restaurantId],
    );

    return res.status(200).json({
      message: "Restaurant and items fetched successfully",
      restaurant,
      items: itemsResult.rows,
    });
  } catch (error) {
    console.error(
      "ERROR WHILE GETTING RESTAURANT ITEMS:",
      error,
    );

    return res.status(500).json({
      message: `error while getting restaurant items : ${error.message}`,
    });
  }
};