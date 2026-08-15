import pool from "../config/db.js";

export const createOrder = async (req, res) => {
  const client = await pool.connect();

  try {
    const customer_id = req.id;

    const { payment_method, delivery_address, latitude, longitude, cartItems } =
      req.body;

    // ==========================================
    // VALIDATION
    // ==========================================

    if (!payment_method) {
      return res.status(400).json({
        message: "Payment method is required",
      });
    }

    if (payment_method !== "online" && payment_method !== "cod") {
      return res.status(400).json({
        message: "Invalid payment method",
      });
    }

    if (!delivery_address) {
      return res.status(400).json({
        message: "Delivery address is required",
      });
    }

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        message: "Delivery location is required",
      });
    }

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    // ==========================================
    // VALIDATE CART QUANTITIES
    // ==========================================

    for (const cartItem of cartItems) {
      if (!cartItem.id) {
        return res.status(400).json({
          message: "Item id is missing",
        });
      }

      if (
        !cartItem.quantity ||
        Number(cartItem.quantity) <= 0 ||
        !Number.isInteger(Number(cartItem.quantity))
      ) {
        return res.status(400).json({
          message: `Invalid quantity for item ${cartItem.id}`,
        });
      }
    }

    // ==========================================
    // START TRANSACTION
    // ==========================================

    await client.query("BEGIN");

    // ==========================================
    // GET ACTUAL ITEMS FROM DATABASE
    // ==========================================

    const verifiedItems = [];

    for (const cartItem of cartItems) {
      const itemResult = await client.query(
        `
        SELECT
          i.id,
          i.name,
          i.price,
          i.restaurant_id,
          r.owner_id,
          r.name AS restaurant_name
        FROM ITEM i
        INNER JOIN RESTAURANT r
          ON i.restaurant_id = r.id
        WHERE i.id = $1
        `,
        [cartItem.id],
      );

      if (itemResult.rows.length === 0) {
        throw new Error(`Item ${cartItem.id} not found`);
      }

      const databaseItem = itemResult.rows[0];

      verifiedItems.push({
        id: databaseItem.id,
        name: databaseItem.name,
        price: Number(databaseItem.price),
        restaurant_id: databaseItem.restaurant_id,
        owner_id: databaseItem.owner_id,
        restaurant_name: databaseItem.restaurant_name,
        quantity: Number(cartItem.quantity),
      });
    }

    // ==========================================
    // GROUP ITEMS BY RESTAURANT
    // ==========================================

    const restaurantGroups = {};

    for (const item of verifiedItems) {
      if (!restaurantGroups[item.restaurant_id]) {
        restaurantGroups[item.restaurant_id] = [];
      }

      restaurantGroups[item.restaurant_id].push(item);
    }

    // ==========================================
    // CALCULATE TOTAL AMOUNT
    // ==========================================

    let total_amount = 0;

    for (const item of verifiedItems) {
      total_amount += item.price * item.quantity;
    }

    // ==========================================
    // CREATE FOOD_ORDER
    // ==========================================

    const foodOrderResult = await client.query(
      `
      INSERT INTO FOOD_ORDER
      (
        customer_id,
        payment_method,
        delivery_address,
        latitude,
        longitude,
        total_amount
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        customer_id,
        payment_method,
        delivery_address,
        latitude,
        longitude,
        total_amount,
      ],
    );

    const foodOrder = foodOrderResult.rows[0];

    // ==========================================
    // CREATE SHOP_ORDER FOR EACH RESTAURANT
    // ==========================================

    const shopOrders = [];

    for (const restaurant_id of Object.keys(restaurantGroups)) {
      const restaurantItems = restaurantGroups[restaurant_id];

      const restaurant = restaurantItems[0];

      // ==========================================
      // CALCULATE RESTAURANT SUBTOTAL
      // ==========================================

      let subtotal = 0;

      for (const item of restaurantItems) {
        subtotal += item.price * item.quantity;
      }

      // ==========================================
      // CREATE SHOP_ORDER
      // ==========================================

      const shopOrderResult = await client.query(
        `
        INSERT INTO SHOP_ORDER
        (
          order_id,
          restaurant_id,
          owner_id,
          subtotal
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `,
        [foodOrder.id, restaurant.restaurant_id, restaurant.owner_id, subtotal],
      );

      const shopOrder = shopOrderResult.rows[0];

      // ==========================================
      // CREATE ORDER_ITEM
      // ==========================================

      const orderItems = [];

      for (const item of restaurantItems) {
        const orderItemResult = await client.query(
          `
          INSERT INTO ORDER_ITEM
          (
            shop_order_id,
            item_id,
            restaurant_id,
            price,
            quantity
          )
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *
          `,
          [
            shopOrder.id,
            item.id,
            item.restaurant_id,
            item.price,
            item.quantity,
          ],
        );

        orderItems.push(orderItemResult.rows[0]);
      }

      shopOrders.push({
        ...shopOrder,
        restaurant_name: restaurant.restaurant_name,
        items: orderItems,
      });
    }

    // ==========================================
    // COMMIT TRANSACTION
    // ==========================================

    await client.query("COMMIT");

    // ==========================================
    // SUCCESS RESPONSE
    // ==========================================

    return res.status(201).json({
      message: "Order created successfully",

      order: {
        ...foodOrder,
        shopOrders,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Error while creating order:", error);

    return res.status(500).json({
      message: `error while creating order : ${error.message}`,
    });
  } finally {
    client.release();
  }
};

export const getOrders = async (req, res) => {
  try {
    const user_id = req.id;
    const role = req.role;

    // ============================================================
    // CUSTOMER ORDERS
    // ============================================================

    if (role === "customer") {
      const result = await pool.query(
        `
        SELECT
          -- FOOD ORDER
          fo.id AS order_id,
          fo.payment_method,
          fo.delivery_address,
          fo.latitude,
          fo.longitude,
          fo.total_amount,
          fo.created_at AS order_created_at,
          fo.updated_at AS order_updated_at,

          -- SHOP ORDER
          so.id AS shop_order_id,
          so.restaurant_id,
          so.owner_id,
          so.subtotal,
          so.assigned_rider_id,
          so.status,
          so.created_at AS shop_order_created_at,
          so.updated_at AS shop_order_updated_at,

          -- RESTAURANT
          r.name AS restaurant_name,
          r.image_link AS restaurant_image,
          r.address AS restaurant_address,
          r.city AS restaurant_city,

          -- ORDER ITEM
          oi.id AS order_item_id,
          oi.item_id,
          oi.price AS item_price,
          oi.quantity,

          -- ITEM
          i.name AS item_name,
          i.image_link AS item_image,
          i.category,
          i.food_type

        FROM FOOD_ORDER fo

        INNER JOIN SHOP_ORDER so
          ON fo.id = so.order_id

        INNER JOIN RESTAURANT r
          ON so.restaurant_id = r.id

        INNER JOIN ORDER_ITEM oi
          ON so.id = oi.shop_order_id

        INNER JOIN ITEM i
          ON oi.item_id = i.id

        WHERE fo.customer_id = $1

        ORDER BY fo.created_at DESC, so.id, oi.id
        `,
        [user_id],
      );

      const orders = [];

      for (const row of result.rows) {
        // ========================================================
        // FOOD ORDER
        // ========================================================

        let order = orders.find((order) => order.id === row.order_id);

        if (!order) {
          order = {
            id: row.order_id,

            payment_method: row.payment_method,

            delivery_address: row.delivery_address,
            latitude: row.latitude,
            longitude: row.longitude,

            total_amount: row.total_amount,

            created_at: row.order_created_at,
            updated_at: row.order_updated_at,

            shopOrders: [],
          };

          orders.push(order);
        }

        // ========================================================
        // SHOP ORDER
        // ========================================================

        let shopOrder = order.shopOrders.find(
          (shop) => shop.id === row.shop_order_id,
        );

        if (!shopOrder) {
          shopOrder = {
            id: row.shop_order_id,

            restaurant_id: row.restaurant_id,
            owner_id: row.owner_id,

            restaurant_name: row.restaurant_name,
            restaurant_image: row.restaurant_image,
            restaurant_address: row.restaurant_address,
            restaurant_city: row.restaurant_city,

            subtotal: row.subtotal,
            assigned_rider_id: row.assigned_rider_id,

            // ORDER STATUS
            status: row.status,

            created_at: row.shop_order_created_at,
            updated_at: row.shop_order_updated_at,

            items: [],
          };

          order.shopOrders.push(shopOrder);
        }

        // ========================================================
        // ORDER ITEM
        // ========================================================

        shopOrder.items.push({
          id: row.order_item_id,
          item_id: row.item_id,

          name: row.item_name,
          image_link: row.item_image,

          category: row.category,
          food_type: row.food_type,

          price: row.item_price,
          quantity: row.quantity,

          item_total: Number(row.item_price) * Number(row.quantity),
        });
      }

      return res.status(200).json({
        message: "Customer orders fetched successfully",
        orders,
      });
    }

    // ============================================================
    // OWNER ORDERS
    // ============================================================

    if (role === "owner") {
      const result = await pool.query(
        `
        SELECT
          -- FOOD ORDER
          fo.id AS order_id,
          fo.customer_id,
          fo.payment_method,
          fo.delivery_address,
          fo.latitude,
          fo.longitude,
          fo.total_amount,
          fo.created_at AS order_created_at,
          fo.updated_at AS order_updated_at,

          -- SHOP ORDER
          so.id AS shop_order_id,
          so.restaurant_id,
          so.owner_id,
          so.subtotal,
          so.assigned_rider_id,
          so.status,
          so.created_at AS shop_order_created_at,
          so.updated_at AS shop_order_updated_at,

          -- RESTAURANT
          r.name AS restaurant_name,
          r.image_link AS restaurant_image,
          r.address AS restaurant_address,
          r.city AS restaurant_city,

          -- CUSTOMER
          c.name AS customer_name,
          c.email AS customer_email,
          c.contact_no AS customer_contact,

          -- ORDER ITEM
          oi.id AS order_item_id,
          oi.item_id,
          oi.price AS item_price,
          oi.quantity,

          -- ITEM
          i.name AS item_name,
          i.image_link AS item_image,
          i.category,
          i.food_type

        FROM SHOP_ORDER so

        INNER JOIN FOOD_ORDER fo
          ON so.order_id = fo.id

        INNER JOIN RESTAURANT r
          ON so.restaurant_id = r.id

        INNER JOIN CUSTOMER c
          ON fo.customer_id = c.id

        INNER JOIN ORDER_ITEM oi
          ON so.id = oi.shop_order_id

        INNER JOIN ITEM i
          ON oi.item_id = i.id

        WHERE so.owner_id = $1

        ORDER BY so.created_at DESC, so.id, oi.id
        `,
        [user_id],
      );

      const orders = [];

      for (const row of result.rows) {
        // ========================================================
        // FOOD ORDER
        // ========================================================

        let order = orders.find((order) => order.id === row.order_id);

        if (!order) {
          order = {
            id: row.order_id,

            customer: {
              id: row.customer_id,
              name: row.customer_name,
              email: row.customer_email,
              contact_no: row.customer_contact,
            },

            payment_method: row.payment_method,

            delivery_address: row.delivery_address,
            latitude: row.latitude,
            longitude: row.longitude,

            total_amount: row.total_amount,

            created_at: row.order_created_at,
            updated_at: row.order_updated_at,

            shopOrders: [],
          };

          orders.push(order);
        }

        // ========================================================
        // SHOP ORDER
        // ========================================================

        let shopOrder = order.shopOrders.find(
          (shop) => shop.id === row.shop_order_id,
        );

        if (!shopOrder) {
          shopOrder = {
            id: row.shop_order_id,

            restaurant_id: row.restaurant_id,
            owner_id: row.owner_id,

            restaurant: {
              name: row.restaurant_name,
              image_link: row.restaurant_image,
              address: row.restaurant_address,
              city: row.restaurant_city,
            },

            subtotal: row.subtotal,
            assigned_rider_id: row.assigned_rider_id,

            // ORDER STATUS
            status: row.status,

            created_at: row.shop_order_created_at,
            updated_at: row.shop_order_updated_at,

            items: [],
          };

          order.shopOrders.push(shopOrder);
        }

        // ========================================================
        // ORDER ITEM
        // ========================================================

        shopOrder.items.push({
          id: row.order_item_id,
          item_id: row.item_id,

          name: row.item_name,
          image_link: row.item_image,

          category: row.category,
          food_type: row.food_type,

          price: row.item_price,
          quantity: row.quantity,

          item_total: Number(row.item_price) * Number(row.quantity),
        });
      }

      return res.status(200).json({
        message: "Owner orders fetched successfully",
        orders,
      });
    }

    // ============================================================
    // INVALID ROLE
    // ============================================================

    return res.status(403).json({
      message: "You are not authorized to view orders",
    });
  } catch (error) {
    console.error("Error while fetching orders:", error);

    return res.status(500).json({
      message: "Error while fetching orders",
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const owner_id = req.id;
    const { shop_order_id, status } = req.body;

    if (!shop_order_id || !status) {
      return res.status(400).json({
        message: "shop_order_id and status are required",
      });
    }

    // Owner-only endpoint
    if (req.role !== "owner") {
      return res.status(403).json({
        message: "Only restaurant owners can update shop order status",
      });
    }

    const validStatuses = [
      "pending",
      "confirmed",
      "preparing",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    // Owner cannot mark order as delivered
    if (status === "delivered") {
      return res.status(403).json({
        message: "Owner cannot mark an order as delivered",
      });
    }

    const result = await pool.query(
      `
      UPDATE SHOP_ORDER
      SET
        status = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
        AND owner_id = $3
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
      [status, shop_order_id, owner_id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Shop order not found or you are not the owner",
      });
    }

    return res.status(200).json({
      message: "Order status updated successfully",
      shopOrder: result.rows[0],
    });
  } catch (error) {
    console.error("UPDATE ORDER STATUS ERROR:", error);

    return res.status(500).json({
      message: "Error while updating order status",
    });
  }
};
