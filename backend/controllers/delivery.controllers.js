import pool from "../config/db.js";

export const getAssignedRiderForShopOrder = async (req, res) => {
  try {
    const { shop_order_id } = req.params;

    if (!shop_order_id) {
      return res.status(400).json({
        message: "shop_order_id is required",
      });
    }

    const result = await pool.query(
      `
      SELECT
        so.id AS shop_order_id,
        so.assigned_rider_id,

        c.id AS rider_id,
        c.name AS rider_name,
        c.email AS rider_email,
        c.contact_no AS rider_contact_no,

        c.latitude AS rider_latitude,
        c.longitude AS rider_longitude,

        ST_AsGeoJSON(c.location)::json AS rider_location

      FROM SHOP_ORDER so

      LEFT JOIN CUSTOMER c
        ON c.id = so.assigned_rider_id
        AND c.role = 'rider'

      WHERE so.id = $1
      `,
      [shop_order_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Shop order not found",
      });
    }

    const shopOrder = result.rows[0];

    // No rider has accepted the shop order yet
    if (!shopOrder.assigned_rider_id) {
      return res.status(200).json({
        message: "No rider has been assigned to this shop order",
        rider: null,
      });
    }

    return res.status(200).json({
      message: "Assigned rider fetched successfully",

      rider: {
        id: shopOrder.rider_id,
        name: shopOrder.rider_name,
        email: shopOrder.rider_email,
        contact_no: shopOrder.rider_contact_no,

        latitude: shopOrder.rider_latitude,
        longitude: shopOrder.rider_longitude,

        location: shopOrder.rider_location,
      },
    });

  } catch (error) {
    console.error(
      "GET ASSIGNED RIDER ERROR:",
      error
    );

    return res.status(500).json({
      message: "Error while fetching assigned rider",
      error: error.message,
    });
  }
};