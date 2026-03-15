import User from '../models/user.models.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
};

// ── Bug 1 fixed: UserActivation → User
// ── Bug 2 fixed: refrshToken → refreshToken
const generateTokens = async (userId) => {
  const user = await User.findById(userId);
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json(new ApiError(400, "All fields are required"));
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res
        .status(409)
        .json(new ApiError(409, "Username or email already exists"));
    }

    const user = await User.create({ username, email, password });
    const createdUser = await User.findById(user._id);

    return res
      .status(201)
      .json(new ApiResponse(201, createdUser, "User registered successfully"));

  } catch (err) {
    return res.status(500).json(new ApiError(500, err.message));
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json(new ApiError(400, "Email and password are required"));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res
        .status(404)
        .json(new ApiError(404, "User not found"));
    }

    // ── Bug 3 fixed: isPasswordVaild → isPasswordCorrect
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json(new ApiError(401, "Invalid credentials"));
    }

    const { accessToken, refreshToken } = await generateTokens(user._id);
    const loggedInUser = await User.findById(user._id);

    // ── Bug 4 fixed: .cokkie → .cookie
    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(
        new ApiResponse(200, { user: loggedInUser, accessToken }, "Login successful")
      );

  } catch (err) {
    return res.status(500).json(new ApiError(500, err.message));
  }
};

// ── Bug 5 fixed: (res, req) → (req, res)
export const logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      { $unset: { refreshToken: 1 } },
      { new: true }
    );

    return res
      .status(200)
      .clearCookie("accessToken", cookieOptions)
      .clearCookie("refreshToken", cookieOptions)
      .json(new ApiResponse(200, {}, "Logged out successfully"));

  } catch (err) {
    return res.status(500).json(new ApiError(500, err.message));
  }
};

export const getCurrentUser = async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
};