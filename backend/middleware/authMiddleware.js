import jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // If verification passes, the data is in 'decoded'.
    // We attach it to 'req.user' so your routes can access it immediately.
    // No DB query needed!
    if (!decoded.isVerified) {
      return res.status(401).json({ message: "Unauthorized: User not verified" });
    }

    req.user = decoded; 
    next();
  } catch (err) {
    // If token is expired or tampered with
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};