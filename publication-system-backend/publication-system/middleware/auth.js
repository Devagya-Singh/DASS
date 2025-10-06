const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "devSecret123";

/**
 * Middleware: Authenticate the JWT token from the Authorization header
 * Adds `req.user` with decoded payload (e.g., id, email, role)
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Example: { id, email, role }
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};

/**
 * Middleware: Authorize specific user roles
 * Example usage in routes:
 *   authorizeRoles('admin') -> only admins can access
 *   authorizeRoles('admin', 'author') -> both admins and authors
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: No user information found." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access forbidden: Role '${req.user.role}' not authorized.`,
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles,
};
