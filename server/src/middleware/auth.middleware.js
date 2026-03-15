import jwt from 'jsonwebtoken';
import User from '../models/user.models.js';
import ApiError from '../utils/ApiError.js';

const verifyJWT = async (req, res, next) => {
  try {
    console.log(">>> MIDDLEWARE HIT");

    const token =
      req.cookies?.accessToken ||
      req.header('Authorization')?.replace('Bearer ', '');

    console.log(">>> TOKEN FOUND:", token ? "✅ yes" : "❌ no");

    // ADD THESE ↓
    console.log(">>> VERIFYING TOKEN...");
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log(">>> DECODED:", decoded);

    console.log(">>> FINDING USER...");
    const user = await User.findById(decoded._id);
    console.log(">>> USER FOUND:", user ? "✅ yes" : "❌ no");

    if (!user) {
      return res.status(401).json(new ApiError(401, 'Invalid access token'));
    }

    req.user = user;
    console.log(">>> CALLING NEXT...");
    next();

  } catch (err) {
    console.error(">>> MIDDLEWARE ERROR:", err.message);
    return res.status(401).json(new ApiError(401, 'Invalid or expired token'));
  }
};

export default verifyJWT;