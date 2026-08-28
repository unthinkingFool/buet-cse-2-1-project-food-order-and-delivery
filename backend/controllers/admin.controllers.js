import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// ============================================================
// ADMIN LOGIN
// ============================================================

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const result = await pool.query(
      `
      SELECT email, hashed_password
      FROM ADMIN
      WHERE email = $1
      `,
      [email],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const admin = result.rows[0];

    const isPasswordCorrect = await bcrypt.compare(
      password,
      admin.hashed_password,
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        email: admin.email,
        role: "admin",
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "7d",
      },
    );

    res.cookie("adminToken", token, {
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      admin: {
        email: admin.email,
        role: "admin",
      },
    });
  } catch (error) {
    console.error("ADMIN LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Error while admin login",
    });
  }
};

// ============================================================
// ADMIN LOGOUT
// ============================================================

export const adminLogout = async (req, res) => {
  try {
    res.clearCookie("adminToken");

    return res.status(200).json({
      success: true,
      message: "Admin successfully logged out",
    });
  } catch (error) {
    console.error("ADMIN LOGOUT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Error while admin logout",
    });
  }
};

// ============================================================
// GET CURRENT ADMIN
// ============================================================

export const getCurrentAdmin = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT email
      FROM ADMIN
      WHERE email = $1
      `,
      [req.admin.email],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    return res.status(200).json({
      success: true,
      admin: {
        email: result.rows[0].email,
        role: "admin",
      },
    });
  } catch (error) {
    console.error("GET ADMIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Error while getting admin",
    });
  }
};

// ============================================================
// ADMIN DASHBOARD
// ============================================================

export const getAdminDashboard = async (req, res) => {
  try {
    // ========================================================
    // USER COUNTS
    // ========================================================

    const customerResult = await pool.query(
      `
      SELECT COUNT(*)::INTEGER AS total
      FROM CUSTOMER
      WHERE role = 'customer'
      `,
    );

    const ownerResult = await pool.query(
      `
      SELECT COUNT(*)::INTEGER AS total
      FROM CUSTOMER
      WHERE role = 'owner'
      `,
    );

    const riderResult = await pool.query(
      `
      SELECT COUNT(*)::INTEGER AS total
      FROM CUSTOMER
      WHERE role = 'rider'
      `,
    );

    // ========================================================
    // RESTAURANT COUNTS
    // ========================================================

    const restaurantResult = await pool.query(
      `
      SELECT COUNT(*)::INTEGER AS total
      FROM RESTAURANT
      `,
    );

    const approvedRestaurantResult = await pool.query(
      `
      SELECT COUNT(*)::INTEGER AS total
      FROM RESTAURANT
      WHERE is_approved = TRUE
      `,
    );

    const pendingRestaurantResult = await pool.query(
      `
      SELECT COUNT(*)::INTEGER AS total
      FROM RESTAURANT
      WHERE is_approved = FALSE
      `,
    );

    const openRestaurantResult = await pool.query(
      `
      SELECT COUNT(*)::INTEGER AS total
      FROM RESTAURANT
      WHERE status = 'open'
      `,
    );

    const closedRestaurantResult = await pool.query(
      `
      SELECT COUNT(*)::INTEGER AS total
      FROM RESTAURANT
      WHERE status = 'closed'
      `,
    );

    // ========================================================
    // ORDER COUNTS
    // ========================================================

    const totalOrderResult = await pool.query(
      `
      SELECT COUNT(*)::INTEGER AS total
      FROM SHOP_ORDER
      `,
    );

    const pendingOrderResult = await pool.query(
      `
      SELECT COUNT(*)::INTEGER AS total
      FROM SHOP_ORDER
      WHERE status = 'pending'
      `,
    );

    const confirmedOrderResult = await pool.query(
      `
      SELECT COUNT(*)::INTEGER AS total
      FROM SHOP_ORDER
      WHERE status = 'confirmed'
      `,
    );

    const preparingOrderResult = await pool.query(
      `
      SELECT COUNT(*)::INTEGER AS total
      FROM SHOP_ORDER
      WHERE status = 'preparing'
      `,
    );

    const outForDeliveryOrderResult = await pool.query(
      `
      SELECT COUNT(*)::INTEGER AS total
      FROM SHOP_ORDER
      WHERE status = 'out_for_delivery'
      `,
    );

    const deliveredOrderResult = await pool.query(
      `
      SELECT COUNT(*)::INTEGER AS total
      FROM SHOP_ORDER
      WHERE status = 'delivered'
      `,
    );

    const cancelledOrderResult = await pool.query(
      `
      SELECT COUNT(*)::INTEGER AS total
      FROM SHOP_ORDER
      WHERE status = 'cancelled'
      `,
    );

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(200).json({
      success: true,

      users: {
        customers: customerResult.rows[0].total,
        restaurantOwners: ownerResult.rows[0].total,
        riders: riderResult.rows[0].total,
      },

      restaurants: {
        total: restaurantResult.rows[0].total,
        approved: approvedRestaurantResult.rows[0].total,
        pending: pendingRestaurantResult.rows[0].total,
        open: openRestaurantResult.rows[0].total,
        closed: closedRestaurantResult.rows[0].total,
      },

      orders: {
        total: totalOrderResult.rows[0].total,
        pending: pendingOrderResult.rows[0].total,
        confirmed: confirmedOrderResult.rows[0].total,
        preparing: preparingOrderResult.rows[0].total,
        outForDelivery: outForDeliveryOrderResult.rows[0].total,
        delivered: deliveredOrderResult.rows[0].total,
        cancelled: cancelledOrderResult.rows[0].total,
      },
    });
  } catch (error) {
    console.error("ADMIN DASHBOARD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Error while getting admin dashboard",
    });
  }
};

// ============================================================
// GET ALL RESTAURANTS
// ============================================================
export const getAllRestaurants = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        r.id,
        r.name,
        r.image_link,
        r.description,
        r.address,
        r.city,
        r.latitude,
        r.longitude,
        r.contact_no,
        r.rating,
        r.status,
        r.is_approved,
        r.created_at,

        c.id AS owner_id,
        c.name AS owner_name,
        c.email AS owner_email,
        c.contact_no AS owner_contact,

        CASE
          WHEN s.id IS NOT NULL THEN TRUE
          ELSE FALSE
        END AS is_suspended

      FROM RESTAURANT r

      JOIN CUSTOMER c
        ON r.owner_id = c.id

      LEFT JOIN SUSPENED_EMAILS s
        ON c.email = s.email

      WHERE r.is_approved = TRUE

      ORDER BY r.created_at DESC
    `);

    return res.status(200).json({
      success: true,
      restaurants: result.rows,
    });
  } catch (error) {
    console.error("GET ALL APPROVED RESTAURANTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Error while getting approved restaurants",
    });
  }
};

// ============================================================
// GET ALL PENDING RESTAURANTS
// ============================================================

export const getAllPendingRestaurants = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        r.id,
        r.name,
        r.image_link,
        r.description,
        r.address,
        r.city,
        r.latitude,
        r.longitude,
        r.contact_no,
        r.rating,
        r.status,
        r.is_approved,
        r.created_at,

        c.id AS owner_id,
        c.name AS owner_name,
        c.email AS owner_email,
        c.contact_no AS owner_contact,

        CASE
          WHEN s.id IS NOT NULL THEN TRUE
          ELSE FALSE
        END AS is_suspended

      FROM RESTAURANT r

      JOIN CUSTOMER c
        ON r.owner_id = c.id

      LEFT JOIN SUSPENED_EMAILS s
        ON c.email = s.email

      WHERE r.is_approved = FALSE

      ORDER BY r.created_at DESC
    `);

    return res.status(200).json({
      success: true,
      restaurants: result.rows,
    });
  } catch (error) {
    console.error("GET ALL PENDING RESTAURANTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Error while getting pending restaurants",
    });
  }
};

// ============================================================
// GET ALL SUSPENDED RESTAURANTS
// ============================================================

export const getAllSuspendedRestaurants = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        r.id,
        r.name,
        r.image_link,
        r.description,
        r.address,
        r.city,
        r.latitude,
        r.longitude,
        r.contact_no,
        r.rating,
        r.status,
        r.is_approved,
        r.created_at,

        c.id AS owner_id,
        c.name AS owner_name,
        c.email AS owner_email,
        c.contact_no AS owner_contact,

        TRUE AS is_suspended

      FROM RESTAURANT r

      JOIN CUSTOMER c
        ON r.owner_id = c.id

      JOIN SUSPENED_EMAILS s
        ON c.email = s.email
       AND s.role = 'owner'

      WHERE s.email IS NOT NULL

      ORDER BY r.created_at DESC
    `);

    return res.status(200).json({
      success: true,
      restaurants: result.rows,
    });

  } catch (error) {
    console.error(
      "GET ALL SUSPENDED RESTAURANTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ============================================================
// GET SINGLE RESTAURANT
// ============================================================

export const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        r.id,
        r.name,
        r.image_link,
        r.description,
        r.address,
        r.city,
        r.latitude,
        r.longitude,
        r.contact_no,
        r.rating,
        r.status,
        r.is_approved,
        r.created_at,

        c.id AS owner_id,
        c.name AS owner_name,
        c.email AS owner_email,
        c.contact_no AS owner_contact

      FROM RESTAURANT r

      JOIN CUSTOMER c
        ON r.owner_id = c.id

      WHERE r.id = $1
      `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    return res.status(200).json({
      success: true,
      restaurant: result.rows[0],
    });
  } catch (error) {
    console.error("GET RESTAURANT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Error while getting restaurant",
    });
  }
};

// ============================================================
// APPROVE RESTAURANT
// ============================================================

export const approveRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE RESTAURANT r

      SET is_approved = TRUE

      FROM CUSTOMER c

      WHERE r.id = $1
        AND r.owner_id = c.id

        AND NOT EXISTS (
          SELECT 1
          FROM SUSPENED_EMAILS s
          WHERE s.email = c.email
        )

      RETURNING
        r.id,
        r.name,
        r.is_approved
      `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Restaurant not found or restaurant owner is suspended",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Restaurant approved successfully",
      restaurant: result.rows[0],
    });
  } catch (error) {
    console.error("APPROVE RESTAURANT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Error while approving restaurant",
    });
  }
};

// ============================================================
// REJECT RESTAURANT
// ============================================================

export const rejectRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE RESTAURANT
      SET is_approved = FALSE
      WHERE id = $1
      RETURNING id, name, is_approved
      `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Restaurant rejected",
      restaurant: result.rows[0],
    });
  } catch (error) {
    console.error("REJECT RESTAURANT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Error while rejecting restaurant",
    });
  }
};

// ============================================================
// SUSPEND RESTAURANT
// ============================================================

export const suspendRestaurant = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    await client.query("BEGIN");

    // ========================================================
    // FIND RESTAURANT + OWNER
    // ========================================================

    const restaurantResult = await client.query(
      `
      SELECT
        r.id,
        r.name,
        r.owner_id,

        c.email AS owner_email,
        c.role AS owner_role

      FROM RESTAURANT r

      JOIN CUSTOMER c
        ON r.owner_id = c.id

      WHERE r.id = $1
      `,
      [id],
    );

    if (restaurantResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    const restaurant = restaurantResult.rows[0];

    // ========================================================
    // MAKE SURE OWNER IS ACTUALLY AN OWNER
    // ========================================================

    if (restaurant.owner_role !== "owner") {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message: "Restaurant owner is invalid",
      });
    }

    // ========================================================
    // CHECK IF OWNER ALREADY SUSPENDED
    // ========================================================

    const suspendedResult = await client.query(
      `
      SELECT id
      FROM SUSPENED_EMAILS
      WHERE email = $1
      `,
      [restaurant.owner_email],
    );

    if (suspendedResult.rows.length > 0) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message: "Restaurant owner is already suspended",
      });
    }

    // ========================================================
    // SUSPEND OWNER
    // ========================================================

    await client.query(
      `
      INSERT INTO SUSPENED_EMAILS
      (email, role)
      VALUES ($1, $2)
      `,
      [restaurant.owner_email, "owner"],
    );

    // ========================================================
    // UNAPPROVE RESTAURANT
    // ========================================================

    const updateResult = await client.query(
      `
      UPDATE RESTAURANT
      SET is_approved = FALSE
      WHERE id = $1
      RETURNING
        id,
        name,
        is_approved
      `,
      [id],
    );

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "Restaurant suspended successfully",
      restaurant: {
        ...updateResult.rows[0],
        owner_email: restaurant.owner_email,
        is_suspended: true,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("SUSPEND RESTAURANT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Error while suspending restaurant",
    });
  } finally {
    client.release();
  }
};

// ============================================================
// UNSUSPEND RESTAURANT
// ============================================================

export const unsuspendRestaurant = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    await client.query("BEGIN");

    // ========================================================
    // FIND RESTAURANT + OWNER
    // ========================================================

    const restaurantResult = await client.query(
      `
      SELECT
        r.id,
        r.name,
        r.is_approved,

        c.email AS owner_email

      FROM RESTAURANT r

      JOIN CUSTOMER c
        ON r.owner_id = c.id

      WHERE r.id = $1
      `,
      [id],
    );

    if (restaurantResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    const restaurant = restaurantResult.rows[0];

    // ========================================================
    // REMOVE OWNER FROM SUSPENDED EMAILS
    // ========================================================

    const deleteResult = await client.query(
      `
      DELETE FROM SUSPENED_EMAILS
      WHERE email = $1
      RETURNING id, email, role
      `,
      [restaurant.owner_email],
    );

    if (deleteResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message: "Restaurant owner is not suspended",
      });
    }

    // ========================================================
    // IMPORTANT:
    // DO NOT APPROVE THE RESTAURANT HERE.
    //
    // is_approved remains FALSE.
    // Admin must approve it separately.
    // ========================================================

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message:
        "Restaurant owner unsuspended successfully. Restaurant requires approval again.",
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        is_approved: restaurant.is_approved,
        owner_email: restaurant.owner_email,
        is_suspended: false,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("UNSUSPEND RESTAURANT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Error while unsuspending restaurant",
    });
  } finally {
    client.release();
  }
};

// ============================================================
// SUSPEND USER
// ============================================================

export const suspendUser = async (req, res) => {
  try {
    const { id } = req.params;

    // ========================================================
    // FIND USER
    // ========================================================

    const userResult = await pool.query(
      `
      SELECT id, email, role
      FROM CUSTOMER
      WHERE id = $1
      `,
      [id],
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = userResult.rows[0];

    // ========================================================
    // CHECK IF ALREADY SUSPENDED
    // ========================================================

    const suspendedResult = await pool.query(
      `
      SELECT id
      FROM SUSPENED_EMAILS
      WHERE email = $1
      `,
      [user.email],
    );

    if (suspendedResult.rows.length !== 0) {
      return res.status(400).json({
        success: false,
        message: "User is already suspended",
      });
    }

    // ========================================================
    // ADD EMAIL TO SUSPENDED TABLE
    // ========================================================

    await pool.query(
      `
      INSERT INTO SUSPENED_EMAILS
      (email, role)
      VALUES ($1, $2)
      `,
      [user.email, user.role],
    );

    return res.status(200).json({
      success: true,
      message: "User suspended successfully",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("SUSPEND USER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Error while suspending user",
    });
  }
};

// ============================================================
// UNSUSPEND USER
// ============================================================

export const unsuspendUser = async (req, res) => {
  try {
    const { id } = req.params;

    // ========================================================
    // FIND USER
    // ========================================================

    const userResult = await pool.query(
      `
      SELECT id, email, role
      FROM CUSTOMER
      WHERE id = $1
      `,
      [id],
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = userResult.rows[0];

    // ========================================================
    // REMOVE FROM SUSPENDED TABLE
    // ========================================================

    const result = await pool.query(
      `
      DELETE FROM SUSPENED_EMAILS
      WHERE email = $1
      RETURNING id, email, role
      `,
      [user.email],
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "User is not suspended",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User unsuspended successfully",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("UNSUSPEND USER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Error while unsuspending user",
    });
  }
};

// ============================================================
// GET ALL CUSTOMERS
// ============================================================

export const getAllCustomers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        c.id,
        c.name,
        c.email,
        c.contact_no,
        c.latitude,
        c.longitude,
        c.created_at,

        CASE
          WHEN s.id IS NOT NULL THEN TRUE
          ELSE FALSE
        END AS is_suspended,

        COUNT(so.id)::INTEGER AS total_orders

      FROM CUSTOMER c

      LEFT JOIN FOOD_ORDER fo
        ON fo.customer_id = c.id

      LEFT JOIN SHOP_ORDER so
        ON so.order_id = fo.id

      LEFT JOIN SUSPENED_EMAILS s
        ON c.email = s.email

      WHERE c.role = 'customer'

      GROUP BY
        c.id,
        c.name,
        c.email,
        c.contact_no,
        c.latitude,
        c.longitude,
        c.created_at,
        s.id

      ORDER BY c.created_at DESC
    `);

    return res.status(200).json({
      success: true,
      customers: result.rows,
    });
  } catch (error) {
    console.error("GET ALL CUSTOMERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Error while getting customers",
    });
  }
};

// ============================================================
// GET CUSTOMER BY ID
// ============================================================

export const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        c.id,
        c.name,
        c.email,
        c.contact_no,
        c.latitude,
        c.longitude,
        c.created_at,

        CASE
          WHEN s.id IS NOT NULL THEN TRUE
          ELSE FALSE
        END AS is_suspended

      FROM CUSTOMER c

      LEFT JOIN SUSPENED_EMAILS s
        ON c.email = s.email

      WHERE c.id = $1
        AND c.role = 'customer'
      `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      customer: result.rows[0],
    });
  } catch (error) {
    console.error("GET CUSTOMER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Error while getting customer",
    });
  }
};

// ============================================================
// GET ALL RESTAURANT OWNERS
// ============================================================

export const getAllOwners = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        c.id,
        c.name,
        c.email,
        c.contact_no,
        c.created_at,

        CASE
          WHEN s.id IS NOT NULL THEN TRUE
          ELSE FALSE
        END AS is_suspended,

        COUNT(r.id)::INTEGER AS restaurant_count

      FROM CUSTOMER c

      LEFT JOIN RESTAURANT r
        ON c.id = r.owner_id

      LEFT JOIN SUSPENED_EMAILS s
        ON c.email = s.email

      WHERE c.role = 'owner'

      GROUP BY
        c.id,
        c.name,
        c.email,
        c.contact_no,
        c.created_at,
        s.id

      ORDER BY c.created_at DESC
    `);

    return res.status(200).json({
      success: true,
      owners: result.rows,
    });
  } catch (error) {
    console.error("GET ALL OWNERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Error while getting restaurant owners",
    });
  }
};

// ============================================================
// GET OWNER BY ID
// ============================================================

export const getOwnerById = async (req, res) => {
  try {
    const { id } = req.params;

    const ownerResult = await pool.query(
      `
      SELECT
        c.id,
        c.name,
        c.email,
        c.contact_no,
        c.created_at,

        CASE
          WHEN s.id IS NOT NULL THEN TRUE
          ELSE FALSE
        END AS is_suspended

      FROM CUSTOMER c

      LEFT JOIN SUSPENED_EMAILS s
        ON c.email = s.email

      WHERE c.id = $1
        AND c.role = 'owner'
      `,
      [id],
    );

    if (ownerResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Restaurant owner not found",
      });
    }

    const restaurantResult = await pool.query(
      `
      SELECT
        id,
        name,
        image_link,
        description,
        address,
        city,
        latitude,
        longitude,
        contact_no,
        rating,
        status,
        is_approved,
        created_at

      FROM RESTAURANT

      WHERE owner_id = $1

      ORDER BY created_at DESC
      `,
      [id],
    );

    return res.status(200).json({
      success: true,

      owner: ownerResult.rows[0],

      restaurants: restaurantResult.rows,
    });
  } catch (error) {
    console.error("GET OWNER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Error while getting restaurant owner",
    });
  }
};

// ============================================================
// GET ALL RIDERS
// ============================================================

export const getAllRiders = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        c.id,
        c.name,
        c.email,
        c.contact_no,
        c.latitude,
        c.longitude,
        c.created_at,

        CASE
          WHEN s.id IS NOT NULL THEN TRUE
          ELSE FALSE
        END AS is_suspended,

        COUNT(so.id)::INTEGER AS total_orders

      FROM CUSTOMER c

      LEFT JOIN SHOP_ORDER so
        ON c.id = so.assigned_rider_id

      LEFT JOIN SUSPENED_EMAILS s
        ON c.email = s.email

      WHERE c.role = 'rider'

      GROUP BY
        c.id,
        c.name,
        c.email,
        c.contact_no,
        c.latitude,
        c.longitude,
        c.created_at,
        s.id

      ORDER BY c.created_at DESC
    `);

    return res.status(200).json({
      success: true,
      riders: result.rows,
    });
  } catch (error) {
    console.error("GET ALL RIDERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Error while getting riders",
    });
  }
};

// ============================================================
// GET RIDER BY ID
// ============================================================

export const getRiderById = async (req, res) => {
  try {
    const { id } = req.params;

    const riderResult = await pool.query(
      `
      SELECT
        c.id,
        c.name,
        c.email,
        c.contact_no,
        c.latitude,
        c.longitude,
        c.created_at,

        CASE
          WHEN s.id IS NOT NULL THEN TRUE
          ELSE FALSE
        END AS is_suspended

      FROM CUSTOMER c

      LEFT JOIN SUSPENED_EMAILS s
        ON c.email = s.email

      WHERE c.id = $1
        AND c.role = 'rider'
      `,
      [id],
    );

    if (riderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Rider not found",
      });
    }

    const orderResult = await pool.query(
      `
      SELECT
        so.id,
        so.order_id,
        so.restaurant_id,
        so.subtotal,
        so.status,
        so.created_at

      FROM SHOP_ORDER so

      WHERE so.assigned_rider_id = $1

      ORDER BY so.created_at DESC
      `,
      [id],
    );

    return res.status(200).json({
      success: true,

      rider: riderResult.rows[0],

      orders: orderResult.rows,
    });
  } catch (error) {
    console.error("GET RIDER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Error while getting rider",
    });
  }
};

// ============================================================
// GET ALL SUSPENDED USERS
// ============================================================

export const getSuspendedUsers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        s.id,
        s.email,
        s.role

      FROM SUSPENED_EMAILS s

      ORDER BY s.id DESC
    `);

    return res.status(200).json({
      success: true,
      suspendedUsers: result.rows,
    });
  } catch (error) {
    console.error("GET SUSPENDED USERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Error while getting suspended users",
    });
  }
};

// ============================================================
// GET ALL ISSUES
// ============================================================

export const getAllIssues = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        i.id,

        -- Person who submitted the issue
        sender.id AS sent_from_id,
        sender.name AS sent_from_name,
        sender.email AS sent_from_email,
        sender.role AS sent_from_role,

        -- Person the issue is against
        target.id AS issue_against_id,
        target.name AS issue_against_name,
        target.email AS issue_against_email,
        target.role AS issue_against_role,

        i.issue_description,
        i.created_at

      FROM ISSUES i

      JOIN CUSTOMER sender
        ON i.sent_from_id = sender.id

      JOIN CUSTOMER target
        ON i.issue_against_id = target.id

      ORDER BY i.created_at DESC
    `);

    return res.status(200).json({
      success: true,
      issues: result.rows,
    });
  } catch (error) {
    console.error("GET ALL ISSUES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Error while getting issues",
    });
  }
};

// ============================================================
// GET ISSUE BY ID
// ============================================================

export const getIssueById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        i.id,

        sender.id AS sent_from_id,
        sender.name AS sent_from_name,
        sender.email AS sent_from_email,
        sender.role AS sent_from_role,

        target.id AS issue_against_id,
        target.name AS issue_against_name,
        target.email AS issue_against_email,
        target.role AS issue_against_role,

        i.issue_description,
        i.created_at

      FROM ISSUES i

      JOIN CUSTOMER sender
        ON i.sent_from_id = sender.id

      JOIN CUSTOMER target
        ON i.issue_against_id = target.id

      WHERE i.id = $1
      `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    return res.status(200).json({
      success: true,
      issue: result.rows[0],
    });
  } catch (error) {
    console.error("GET ISSUE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Error while getting issue",
    });
  }
};

// ============================================================
// GET ALL ORDERS
// ============================================================

export const getAllOrders = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        fo.id AS order_id,

        -- Customer
        c.id AS customer_id,
        c.name AS customer_name,
        c.email AS customer_email,
        c.contact_no AS customer_contact,

        -- Delivery
        fo.delivery_address,
        fo.latitude AS delivery_latitude,
        fo.longitude AS delivery_longitude,

        fo.payment_method,
        fo.total_amount,

        fo.created_at,
        fo.updated_at

      FROM FOOD_ORDER fo

      JOIN CUSTOMER c
        ON fo.customer_id = c.id

      ORDER BY fo.created_at DESC
    `);

    return res.status(200).json({
      success: true,
      orders: result.rows,
    });
  } catch (error) {
    console.error("GET ALL ORDERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Error while getting orders",
    });
  }
};

// ============================================================
// GET ORDER BY ID
// ============================================================

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    // ========================================================
    // GET FOOD ORDER
    // ========================================================

    const orderResult = await pool.query(
      `
      SELECT
        fo.id AS order_id,

        -- Customer
        c.id AS customer_id,
        c.name AS customer_name,
        c.email AS customer_email,
        c.contact_no AS customer_contact,

        -- Delivery
        fo.delivery_address,
        fo.latitude AS delivery_latitude,
        fo.longitude AS delivery_longitude,

        fo.payment_method,
        fo.total_amount,

        fo.created_at,
        fo.updated_at

      FROM FOOD_ORDER fo

      JOIN CUSTOMER c
        ON fo.customer_id = c.id

      WHERE fo.id = $1
      `,
      [id],
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // ========================================================
    // GET SHOP ORDERS
    // ========================================================

    const shopOrderResult = await pool.query(
      `
      SELECT
        so.id AS shop_order_id,

        so.subtotal,
        so.status,
        so.created_at,
        so.updated_at,

        -- Restaurant
        r.id AS restaurant_id,
        r.name AS restaurant_name,
        r.address AS restaurant_address,
        r.city AS restaurant_city,

        -- Owner
        owner.id AS owner_id,
        owner.name AS owner_name,
        owner.email AS owner_email,
        owner.contact_no AS owner_contact,

        -- Rider
        rider.id AS rider_id,
        rider.name AS rider_name,
        rider.email AS rider_email,
        rider.contact_no AS rider_contact

      FROM SHOP_ORDER so

      JOIN RESTAURANT r
        ON so.restaurant_id = r.id

      JOIN CUSTOMER owner
        ON so.owner_id = owner.id

      LEFT JOIN CUSTOMER rider
        ON so.assigned_rider_id = rider.id

      WHERE so.order_id = $1

      ORDER BY so.id
      `,
      [id],
    );

    // ========================================================
    // GET ITEMS FOR EACH SHOP ORDER
    // ========================================================

    const shopOrders = [];

    for (const shopOrder of shopOrderResult.rows) {
      const itemResult = await pool.query(
        `
        SELECT
          oi.id AS order_item_id,

          oi.item_id,

          i.name AS item_name,
          i.image_link AS item_image,

          oi.price,
          oi.quantity

        FROM ORDER_ITEM oi

        JOIN ITEM i
          ON oi.item_id = i.id

        WHERE oi.shop_order_id = $1

        ORDER BY oi.id
        `,
        [shopOrder.shop_order_id],
      );

      shopOrders.push({
        ...shopOrder,
        items: itemResult.rows,
      });
    }

    // ========================================================
    // FINAL RESPONSE
    // ========================================================

    return res.status(200).json({
      success: true,

      order: {
        ...orderResult.rows[0],

        shop_orders: shopOrders,
      },
    });
  } catch (error) {
    console.error("GET ORDER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Error while getting order",
    });
  }
};
