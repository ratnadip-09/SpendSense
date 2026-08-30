const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/auth");
const { predictCategory } = require("../controllers/mlController");

router.post("/predict-category", protect, predictCategory);

module.exports = router;