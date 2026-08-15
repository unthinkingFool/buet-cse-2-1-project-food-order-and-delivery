import pool from "../config/db.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const addItem = async (req, res) => {
  try {
    const {
      name,
      category,
      food_type,
      description,
      price,
      discount_price,
    } = req.body;

    const owner_id = req.id;

    let image_link;

    if (req.file) {
      image_link = await uploadOnCloudinary(req.file.path);
    }

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

    // Create item
    const result = await pool.query(
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

    return res.status(201).json({
      message: "Item created successfully",
      item,
    });
  } catch (error) {
    console.error("Error while creating item:", error);

    return res.status(500).json({
      message: `error while creating item : ${error.message}`,
    });
  }
};

export const editItem = async (req, res) => {
  try {
    const {
      name,
      category,
      food_type,
      description,
      price,
      discount_price,
    } = req.body;

    const itemId = req.params.itemId;
    const owner_id = req.id;

    let image_link;

    if (req.file) {
      image_link = await uploadOnCloudinary(req.file.path);
    }

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

    // Update item only if it belongs to this restaurant
    const result = await pool.query(
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
      return res.status(404).json({
        message: "Item not found",
      });
    }

    const item = result.rows[0];

    return res.status(200).json({
      message: "Item updated successfully",
      item,
    });
  } catch (error) {
    console.error("Error while editing item:", error);

    return res.status(500).json({
      message: `error while editing item : ${error.message}`,
    });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const item_id = req.params.itemId;
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

    // Delete only if the item belongs to this owner's restaurant
    const result = await pool.query(
      `DELETE FROM ITEM
       WHERE id = $1
       AND restaurant_id = $2
       RETURNING *`,
      [item_id, restaurant_id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    return res.status(200).json({
      message: "Item deleted successfully",
      item: result.rows[0],
    });
  } catch (error) {
    console.error("Error while deleting item:", error);

    return res.status(500).json({
      message: `error while deleting item : ${error.message}`,
    });
  }
};