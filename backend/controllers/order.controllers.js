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

    let subtotal = 0;

    for (const item of verifiedItems) {
      subtotal += item.price * item.quantity;
    }

    const delivery_fee = subtotal > 300 ? 0 : 35;

    const total_amount = subtotal + delivery_fee;

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

    const io = req.app.get("io");

    shopOrders.forEach((shopOrder) => {
      io.to(`user:${shopOrder.owner_id}`).emit("new_shop_order", {
        order_id: foodOrder.id,
        shop_order_id: shopOrder.id,
      });
    });

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

      -- ======================================================
      -- FOOD ORDER LEVEL CHECK
      -- Only exclude the FOOD_ORDER when ALL shop orders
      -- belonging to it are delivered.
      -- ======================================================
      AND EXISTS (
        SELECT 1
        FROM SHOP_ORDER so_check
        WHERE so_check.order_id = fo.id
          AND so_check.status != 'delivered'
      )

      -- ======================================================
      -- Do not show delivered SHOP_ORDERs inside the result
      -- ======================================================
      AND so.status != 'delivered'

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

        WHERE so.owner_id = $1 AND so.status!='delivered'

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
  const client = await pool.connect();

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

    await client.query("BEGIN");

    // ============================================================
    // 1. Get and lock the SHOP_ORDER
    //
    // This prevents two requests from simultaneously broadcasting
    // the same shop order.
    // ============================================================

    const shopOrderResult = await client.query(
      `
      SELECT
        so.id,
        so.order_id,
        so.restaurant_id,
        so.owner_id,
        so.subtotal,
        so.assigned_rider_id,
        so.status,
        so.created_at,
        so.updated_at,

        r.name AS restaurant_name,
        r.address AS restaurant_address,
        r.latitude AS restaurant_latitude,
        r.longitude AS restaurant_longitude,

        fo.customer_id,
        fo.payment_method,
        fo.delivery_address,
        fo.latitude AS delivery_latitude,
        fo.longitude AS delivery_longitude,
        fo.total_amount AS order_total_amount

      FROM SHOP_ORDER so

      JOIN RESTAURANT r
        ON r.id = so.restaurant_id

      JOIN FOOD_ORDER fo
        ON fo.id = so.order_id

      WHERE so.id = $1
        AND so.owner_id = $2

      FOR UPDATE
      `,
      [shop_order_id, owner_id],
    );

    if (shopOrderResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Shop order not found or you are not the owner",
      });
    }

    const shopOrder = shopOrderResult.rows[0];

    // ============================================================
    // 2. Update SHOP_ORDER status
    // ============================================================

    const updatedOrderResult = await client.query(
      `
      UPDATE SHOP_ORDER
      SET
        status = $1,
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
      [status, shop_order_id],
    );

    let updatedShopOrder = updatedOrderResult.rows[0];

    // ============================================================
    // 3. Only broadcast when:
    //
    //    status = out_for_delivery
    //
    //    AND there is no rider assignment yet.
    // ============================================================

    let broadcastedRiders = [];
    let deliveryAssignment = null;
    let deliveryOffer = null;

    if (status === "out_for_delivery" && shopOrder.assigned_rider_id === null) {
      // ==========================================================
      // 4. Check whether an assignment already exists
      // ==========================================================

      const existingAssignmentResult = await client.query(
        `
        SELECT
          id,
          order_id,
          shop_order_id,
          restaurant_id,
          total_amount,
          assigned_to,
          assignment_status,
          accepted_at,
          created_at
        FROM SHOP_ORDER_DELIVERY_ASSIGNMENT
        WHERE shop_order_id = $1
        ORDER BY id DESC
        LIMIT 1
        FOR UPDATE
        `,
        [shop_order_id],
      );

      if (existingAssignmentResult.rows.length === 0) {
        // ========================================================
        // 5. Make sure restaurant has coordinates
        // ========================================================

        if (
          shopOrder.restaurant_latitude === null ||
          shopOrder.restaurant_longitude === null
        ) {
          await client.query("ROLLBACK");

          return res.status(400).json({
            message:
              "Restaurant latitude and longitude are required before broadcasting a delivery",
          });
        }

        // ========================================================
        // 6. Create ONE delivery assignment.
        //
        // It starts as "broadcasted".
        // assigned_to remains NULL until a rider accepts.
        // ========================================================

        const assignmentResult = await client.query(
          `
          INSERT INTO SHOP_ORDER_DELIVERY_ASSIGNMENT (
            order_id,
            shop_order_id,
            restaurant_id,
            total_amount,
            assigned_to,
            assignment_status
          )
          VALUES ($1, $2, $3, $4, NULL, 'broadcasted')
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
          [
            shopOrder.order_id,
            shopOrder.id,
            shopOrder.restaurant_id,
            shopOrder.subtotal,
          ],
        );

        deliveryAssignment = assignmentResult.rows[0];

        // ========================================================
        // 7. Find FREE RIDERS within 1 KM
        //
        // Rider = CUSTOMER where role = rider
        //
        // Free means:
        //
        // A. No SHOP_ORDER currently assigned to them with an
        //    active status.
        //
        // B. No active DELIVERY_ASSIGNMENT assigned to them.
        //
        // Previous delivered/cancelled orders do not make them busy.
        // ========================================================

        const ridersResult = await client.query(
          `
          SELECT
            c.id,
            c.name,
            c.email,
            c.contact_no,
            c.latitude,
            c.longitude,

            ST_Distance(
              c.location,
              ST_SetSRID(
                ST_MakePoint(
                  r.longitude,
                  r.latitude
                ),
                4326
              )::geography
            ) AS distance_from_restaurant

          FROM CUSTOMER c

          CROSS JOIN RESTAURANT r

          WHERE c.role = 'rider'

            AND r.id = $1

            -- ====================================================
            -- Rider must be within 1 KM of restaurant
            -- ====================================================

            AND ST_DWithin(
              c.location,
              ST_SetSRID(
                ST_MakePoint(
                  r.longitude,
                  r.latitude
                ),
                4326
              )::geography,
              1000
            )

            -- ====================================================
            -- Rider must not have an active SHOP_ORDER
            -- ====================================================

            AND NOT EXISTS (
              SELECT 1
              FROM SHOP_ORDER active_so

              WHERE active_so.assigned_rider_id = c.id

                AND active_so.status NOT IN (
                  'delivered',
                  'cancelled'
                )
            )

            -- ====================================================
            -- Rider must not have an active delivery assignment
            -- ====================================================

            AND NOT EXISTS (
              SELECT 1
              FROM SHOP_ORDER_DELIVERY_ASSIGNMENT active_da

              WHERE active_da.assigned_to = c.id

                AND active_da.assignment_status = 'assigned'
            )

          ORDER BY distance_from_restaurant ASC
          `,
          [shopOrder.restaurant_id],
        );

        // ========================================================
        // 8. Store every eligible rider in
        //    SHOP_ORDER_BROADCASTED_TO
        // ========================================================

        for (const rider of ridersResult.rows) {
          const broadcastResult = await client.query(
            `
            INSERT INTO SHOP_ORDER_BROADCASTED_TO (
              shop_order_id,
              delivery_assignment_id,
              customer_id
            )
            VALUES ($1, $2, $3)
            RETURNING
              id,
              shop_order_id,
              delivery_assignment_id,
              customer_id
            `,
            [shopOrder.id, deliveryAssignment.id, rider.id],
          );

          broadcastedRiders.push({
            broadcast_id: broadcastResult.rows[0].id,
            rider_id: rider.id,
            rider_name: rider.name,
            rider_contact_no: rider.contact_no,
            rider_latitude: rider.latitude,
            rider_longitude: rider.longitude,
            distance_from_restaurant: Number(rider.distance_from_restaurant),
          });

          // ======================================================
          // 9. Create persistent notification
          //
          // Socket.IO can later send the same offer in real time.
          // ======================================================

          await client.query(
            `
            INSERT INTO NOTIFICATION (
              recipient_role,
              recipient_id,
              type,
              title,
              message,
              reference_id
            )
            VALUES (
              'rider',
              $1,
              'delivery_offer',
              $2,
              $3,
              $4
            )
            `,
            [
              rider.id,

              `New delivery available from ${shopOrder.restaurant_name}`,

              `A new delivery is available. Delivery address: ${shopOrder.delivery_address}. Payment: ${shopOrder.payment_method}. Shop order amount: ${shopOrder.subtotal}.`,

              shopOrder.id,
            ],
          );
        }

        // ========================================================
        // 8.5. NO RIDERS AVAILABLE
        // ========================================================

        if (broadcastedRiders.length === 0) {
          // Delete the empty delivery assignment.
          // This is VERY important because otherwise the next
          // "out_for_delivery" request will see an existing
          // assignment and won't broadcast again.

          await client.query(
            `
    DELETE FROM SHOP_ORDER_DELIVERY_ASSIGNMENT
    WHERE id = $1
    `,
            [deliveryAssignment.id],
          );

          // Change shop order back to preparing
          const preparingOrderResult = await client.query(
            `
              UPDATE SHOP_ORDER
              SET
                status = 'preparing',
                updated_at = CURRENT_TIMESTAMP
              WHERE id = $1
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
            [shopOrder.id],
          );

          updatedShopOrder = preparingOrderResult.rows[0];

          deliveryAssignment = null;
          deliveryOffer = null;
        }

        // ========================================================
        // 10. Prepare complete delivery offer
        //
        // This is the information the rider dashboard can display.
        // ========================================================

        const itemsResult = await client.query(
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
          [shopOrder.id],
        );

        deliveryOffer = {
          shop_order_id: shopOrder.id,
          order_id: shopOrder.order_id,
          delivery_assignment_id: deliveryAssignment.id,

          restaurant: {
            id: shopOrder.restaurant_id,
            name: shopOrder.restaurant_name,
            address: shopOrder.restaurant_address,
            latitude: shopOrder.restaurant_latitude,
            longitude: shopOrder.restaurant_longitude,
          },

          delivery: {
            customer_id: shopOrder.customer_id,
            address: shopOrder.delivery_address,
            latitude: shopOrder.delivery_latitude,
            longitude: shopOrder.delivery_longitude,
          },

          items: itemsResult.rows,

          payment: {
            method: shopOrder.payment_method,
            shop_order_amount: shopOrder.subtotal,
            complete_order_amount: shopOrder.order_total_amount,
          },

          rider_count: broadcastedRiders.length,
          riders: broadcastedRiders,
        };
      } else {
        // ========================================================
        // Assignment already exists.
        //
        // Do NOT create another assignment or broadcast again.
        // ========================================================

        deliveryAssignment = existingAssignmentResult.rows[0];
      }
    }

    // ============================================================
    // 11. Commit everything
    // ============================================================

    await client.query("COMMIT");

    const io = req.app.get("io");

    // Notify nearby riders that a new delivery offer is available
    if (
      updatedShopOrder.status === "out_for_delivery" &&
      broadcastedRiders.length > 0
    ) {
      broadcastedRiders.forEach((rider) => {
        io.to(`user:${rider.rider_id}`).emit("new_delivery_offer", {
          order_id: shopOrder.order_id,
          shop_order_id: shopOrder.id,
        });
      });
    }

    // Notify customer about status changes
    io.to(`user:${shopOrder.customer_id}`).emit("order_status_changed", {
      order_id: shopOrder.order_id,
      shop_order_id: shopOrder.id,
      status: updatedShopOrder.status,
    });

    return res.status(200).json({
      message:
        status === "out_for_delivery" && broadcastedRiders.length > 0
          ? "Order marked out for delivery and broadcasted to nearby riders"
          : status === "out_for_delivery"
            ? "Order marked out for delivery, but no eligible nearby riders were found"
            : "Order status updated successfully",

      shopOrder: updatedShopOrder,

      deliveryAssignment,

      broadcastedRiders,

      deliveryOffer,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("UPDATE ORDER STATUS ERROR:", error);

    return res.status(500).json({
      message: "Error while updating order status",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

export const getShopOrderById = async (req, res) => {
  try {
    const customer_id = req.id;
    const { shop_order_id } = req.params;

    if (!shop_order_id) {
      return res.status(400).json({
        message: "Shop order ID is required",
      });
    }

    // Customer-only endpoint
    if (req.role !== "customer") {
      return res.status(403).json({
        message: "Only customers can view their shop orders",
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

        -- Restaurant
        r.name AS restaurant_name,
        r.image_link AS restaurant_image,
        r.address AS restaurant_address,
        r.city AS restaurant_city,
        r.contact_no AS restaurant_contact,
        r.latitude AS restaurant_latitude,
        r.longitude AS restaurant_longitude,
        r.rating AS restaurant_rating,

        -- Customer / delivery
        fo.customer_id,
        fo.delivery_address,
        fo.latitude AS delivery_latitude,
        fo.longitude AS delivery_longitude,

        -- Order
        fo.payment_method,
        fo.total_amount,
        fo.created_at AS order_created_at,
        fo.updated_at AS order_updated_at,

        -- Rider
        rider.id AS rider_id,
        rider.name AS rider_name,
        rider.contact_no AS rider_contact,
        rider.latitude AS rider_latitude,
        rider.longitude AS rider_longitude

      FROM SHOP_ORDER so

      JOIN FOOD_ORDER fo
        ON so.order_id = fo.id

      JOIN RESTAURANT r
        ON so.restaurant_id = r.id

      LEFT JOIN CUSTOMER rider
        ON so.assigned_rider_id = rider.id
        AND rider.role = 'rider'

      WHERE so.id = $1
        AND fo.customer_id = $2
      `,
      [shop_order_id, customer_id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Shop order not found",
      });
    }

    const order = result.rows[0];

    // Get items belonging to this shop order
    const itemsResult = await pool.query(
      `
      SELECT
        oi.id AS order_item_id,
        oi.item_id,
        i.name AS item_name,
        i.image_link AS item_image,
        i.category,
        i.food_type,
        oi.price,
        oi.quantity,
        (oi.price * oi.quantity) AS item_total

      FROM ORDER_ITEM oi

      JOIN ITEM i
        ON oi.item_id = i.id

      WHERE oi.shop_order_id = $1

      ORDER BY oi.id ASC
      `,
      [shop_order_id],
    );

    return res.status(200).json({
      message: "Shop order fetched successfully",

      order: {
        shop_order_id: order.shop_order_id,
        order_id: order.order_id,
        restaurant_id: order.restaurant_id,

        deliveryAddress: {
          latitude: order.delivery_latitude,
          longitude: order.delivery_longitude,
        },

        status: order.shop_order_status,

        subtotal: order.subtotal,

        created_at: order.shop_order_created_at,
        updated_at: order.shop_order_updated_at,

        restaurant: {
          id: order.restaurant_id,
          name: order.restaurant_name,
          image: order.restaurant_image,
          address: order.restaurant_address,
          city: order.restaurant_city,
          contact_no: order.restaurant_contact,
          latitude: order.restaurant_latitude,
          longitude: order.restaurant_longitude,
          rating: order.restaurant_rating,
        },

        delivery: {
          address: order.delivery_address,
          latitude: order.delivery_latitude,
          longitude: order.delivery_longitude,
        },

        payment: {
          method: order.payment_method,
          total_amount: order.total_amount,
        },

        rider: order.rider_id
          ? {
              id: order.rider_id,
              name: order.rider_name,
              contact_no: order.rider_contact,
              latitude: order.rider_latitude,
              longitude: order.rider_longitude,
            }
          : null,

        items: itemsResult.rows,
      },
    });
  } catch (error) {
    console.error("GET SHOP ORDER BY ID ERROR:", error);

    return res.status(500).json({
      message: "Error while fetching shop order",
    });
  }
};
