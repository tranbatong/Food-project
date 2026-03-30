import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const { token } = req.headers;

  if (!token) {
    return res.json({ success: false, message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!req.body) {
      req.body = {};
    }

    req.body.userId = decoded.id;

    req.body.isAdmin = decoded.isAdmin;

    next();
  } catch (error) {
    return res.json({ success: false, message: "Invalid token" });
  }
};

export default authMiddleware;
