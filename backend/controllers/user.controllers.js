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

    const result = await pool.query(
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
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "Location updated successfully",
      location: result.rows[0],
    });
  } catch (error) {
    console.error("UPDATE LOCATION ERROR:", error);

    return res.status(500).json({
      message: `error while updating location: ${error.message}`,
    });
  }
};
