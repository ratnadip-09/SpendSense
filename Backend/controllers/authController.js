// controllers/authController.js — Register, Login, Get profile

const jwt  = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/* ── Helper: sign JWT ── */
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

/* ── Helper: send token response ── */
const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id:            user._id,
      name:          user.name,
      email:         user.email,
      avatar:        user.avatar,
      authProvider:  user.authProvider,
      monthlyBudget: user.monthlyBudget,
      categoryBudgets: user.categoryBudgets,
    },
  });
};

/* ────────────────────────────────────────────
   POST /api/auth/register
   Body: { name, email, password, monthlyBudget? }
──────────────────────────────────────────── */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, monthlyBudget } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const user = await User.create({ name, email, password, monthlyBudget });
    sendToken(user, 201, res);
  } catch (err) {
    next(err);
  }
};

/* ────────────────────────────────────────────
   POST /api/auth/login
   Body: { email, password }
──────────────────────────────────────────── */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

/* ────────────────────────────────────────────
   POST /api/auth/google
   Body: { credential }  — Google Identity Services ID token
──────────────────────────────────────────── */
exports.googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ success: false, message: "Missing Google credential" });
    }

    if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID.includes("your_google_oauth")) {
      return res.status(500).json({
        success: false,
        message: "Google Sign-In is not configured on the server. Set a real GOOGLE_CLIENT_ID in Backend/.env.",
      });
    }

    // Verify the ID token's signature, audience and expiry with Google
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (err) {
      return res.status(401).json({ success: false, message: "Invalid or expired Google credential" });
    }

    if (!payload.email_verified) {
      return res.status(401).json({ success: false, message: "Google email is not verified" });
    }

    const { sub: googleId, email, name, picture } = payload;

    // Match an existing Google-linked account first, then fall back to
    // linking an existing email/password account with the same email.
    let user = await User.findOne({ googleId }).select("+password");
    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        user.googleId = googleId;
        user.authProvider = "google";
        if (!user.avatar) user.avatar = picture;
        await user.save({ validateBeforeSave: false });
      }
    }

    if (!user) {
      user = await User.create({
        name: name || email.split("@")[0],
        email,
        googleId,
        avatar: picture,
        authProvider: "google",
      });
    }

    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

/* ────────────────────────────────────────────
   GET /api/auth/me  (protected)
──────────────────────────────────────────── */
exports.getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id:            req.user._id,
      name:          req.user.name,
      email:         req.user.email,
      avatar:        req.user.avatar,
      authProvider:  req.user.authProvider,
      monthlyBudget: req.user.monthlyBudget,
      categoryBudgets: req.user.categoryBudgets,
    },
  });
};

/* ────────────────────────────────────────────
   PATCH /api/auth/budget  (protected)
   Body: { monthlyBudget }
──────────────────────────────────────────── */
exports.updateBudget = async (req, res, next) => {
  try {
    const { monthlyBudget, categoryBudgets } = req.body;
    
    const update = {};
    if (monthlyBudget !== undefined) {
      if (monthlyBudget === null || monthlyBudget < 0) {
        return res.status(400).json({ success: false, message: "Valid monthlyBudget is required" });
      }
      update.monthlyBudget = monthlyBudget;
    }
    
    if (categoryBudgets !== undefined) {
      update.categoryBudgets = categoryBudgets;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      update,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      user: {
        id:            user._id,
        name:          user.name,
        email:         user.email,
        monthlyBudget: user.monthlyBudget,
        categoryBudgets: user.categoryBudgets,
      }
    });
  } catch (err) {
    next(err);
  }
};
