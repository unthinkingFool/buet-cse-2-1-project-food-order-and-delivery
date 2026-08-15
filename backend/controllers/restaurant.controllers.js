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

