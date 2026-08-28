import pool from "../config/db.js";


// ============================================================
// CREATE ISSUE
// ============================================================

export const createIssue = async (req, res) => {
  try {
    const sentFromId = req.id;
    const { issue_against_id, issue_description } = req.body;


    // ========================================================
    // VALIDATION
    // ========================================================

    if (!issue_against_id || !issue_description) {
      return res.status(400).json({
        success: false,
        message: "Issue against user and description are required",
      });
    }


    // ========================================================
    // CHECK DESCRIPTION
    // ========================================================

    if (issue_description.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Issue description cannot be empty",
      });
    }


    // ========================================================
    // USER CANNOT COMPLAIN AGAINST THEMSELVES
    // ========================================================

    if (Number(issue_against_id) === Number(sentFromId)) {
      return res.status(400).json({
        success: false,
        message: "You cannot create an issue against yourself",
      });
    }


    // ========================================================
    // CHECK TARGET USER
    // ========================================================

    const targetUser = await pool.query(
      `
      SELECT id, name, email, role
      FROM CUSTOMER
      WHERE id = $1
      `,
      [issue_against_id],
    );

    if (targetUser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User you are reporting does not exist",
      });
    }


    // ========================================================
    // CREATE ISSUE
    // ========================================================

    const result = await pool.query(
      `
      INSERT INTO ISSUES
      (
        sent_from_id,
        issue_against_id,
        issue_description
      )
      VALUES ($1, $2, $3)

      RETURNING
        id,
        sent_from_id,
        issue_against_id,
        issue_description,
        created_at
      `,
      [
        sentFromId,
        issue_against_id,
        issue_description.trim(),
      ],
    );


    return res.status(201).json({
      success: true,
      message: "Issue submitted successfully",
      issue: result.rows[0],
    });

  } catch (error) {
    console.error("CREATE ISSUE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Error while creating issue",
    });
  }
};

// ============================================================
// GET MY ISSUES
// ============================================================

export const getMyIssues = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        i.id,
        i.issue_against_id,
        c.name AS issue_against_name,
        c.email AS issue_against_email,
        c.role AS issue_against_role,
        i.issue_description,
        i.created_at

      FROM ISSUES i

      JOIN CUSTOMER c
        ON i.issue_against_id = c.id

      WHERE i.sent_from_id = $1

      ORDER BY i.created_at DESC
      `,
      [req.id],
    );

    return res.status(200).json({
      success: true,
      issues: result.rows,
    });

  } catch (error) {
    console.error("GET MY ISSUES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Error while getting your issues",
    });
  }
};