import jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
  try {
    // 1. Get the Authorization header
    const authHeader = req.headers.authorization;

    // 2. Check if it exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized - No Token Provided" });
    }

    // 3. Extract the token (everything after "Bearer ")
    const token = authHeader.split(" ")[1];

    // 4. Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5. Attach user information to the request
    req.user = decoded; 

    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized - Invalid Token" });
  }
};