import pool from "../config/db.js";

export const getCurrentUser = async (req, res) => {
  try {
    const  id  = req.id;
    if (!id) {
      return res.status(400).json({
        message: "could not find user id after authntication",
      });
    }
    const result = await pool.query(
      `SELECT id, name, email, hashed_password, contact_no, role
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
