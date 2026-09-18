import pool from "../config/db.js";

// ============================================================
// POST ISSUE
// Customer / Rider / Owner reports an issue
// ============================================================
export const postIssue = async (req, res) => {
  try {
    const { issue_description } = req.body;

    // Assuming your auth middleware stores the logged-in user's ID
    // in req.userId
    const userId = req.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!issue_description || !issue_description.trim()) {
      return res.status(400).json({
        success: false,
        message: "Issue description is required",
      });
    }

    if (issue_description.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Issue description cannot exceed 1000 characters",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO ISSUES (
        sent_from_id,
        issue_description
      )
      VALUES ($1, $2)
      RETURNING *
      `,
      [userId, issue_description.trim()]
    );

    return res.status(201).json({
      success: true,
      message: "Issue reported successfully",
      issue: result.rows[0],
    });

  } catch (error) {
    console.error("Post issue error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to report issue",
    });
  }
};


// ============================================================
// GET MY ISSUES
// Customer / Rider / Owner sees their own reported issues
// ============================================================
export const getMyIssue = async (req, res) => {
  try {
    const userId = req.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const result = await pool.query(
      `
      SELECT
        id,
        sent_from_id,
        issue_description,
        created_at
      FROM ISSUES
      WHERE sent_from_id = $1
      ORDER BY created_at DESC
      `,
      [userId]
    );

    return res.status(200).json({
      success: true,
      issues: result.rows,
    });

  } catch (error) {
    console.error("Get my issues error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch issues",
    });
  }
};


// ============================================================
// GET ALL ISSUES - ADMIN
// Admin sees every reported issue
// ============================================================
export const getAllIssueAdmin = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        i.id,
        i.issue_description,
        i.created_at,

        c.id AS user_id,
        c.name AS user_name,
        c.email AS user_email,
        c.role AS user_role

      FROM ISSUES i
      JOIN CUSTOMER c
        ON i.sent_from_id = c.id

      ORDER BY i.created_at DESC
      `
    );

    return res.status(200).json({
      success: true,
      issues: result.rows,
    });

  } catch (error) {
    console.error("Get all issues admin error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch issues",
    });
  }
};