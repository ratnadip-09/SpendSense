// routes/auth.js

const express = require("express");
const router  = express.Router();

const { register, login, googleAuth, getMe, updateBudget } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

// Public
router.post("/register", register);
router.post("/login",    login);
router.post("/google",   googleAuth);

// Protected
router.get  ("/me",     protect, getMe);
router.patch("/budget", protect, updateBudget);

module.exports = router;
