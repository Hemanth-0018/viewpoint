import jwt from 'jsonwebtoken';
import User from '../models/user.models.js';
import ApiError from '../utils/ApiError.js';

const verifyJWT = async (req, res, next) => {
  try {
    // Fix Bug 3 — req.cookies not req.cokkie
    const token =
      req.cookies?.accessToken ||
      req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json(new ApiError(401, 'Unauthorized - No token'));
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded._id);

    if (!user) {
      return res.status(401).json(new ApiError(401, 'Invalid access token'));
    }

    req.user = user;
    next();

  } catch (err) {
    return res.status(401).json(new ApiError(401, 'Invalid or expired token'));
  }
};

export default verifyJWT;