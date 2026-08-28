import jwt from "jsonwebtoken";

export const adminAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.adminToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Admin authentication required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Make sure this token belongs to an admin
    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access denied",
      });
    }

    // Attach admin information to request
    req.admin = {
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error("Admin authentication error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Admin session expired",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid admin authentication",
    });
  }
};


