const { categorizeExpense } = require("../services/mlService");

exports.predictCategory = async (req, res, next) => {
  try {
    const { description } = req.body;

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: "Description is required",
      });
    }

    const result = await categorizeExpense(description);

    res.json(result);
  } catch (error) {
    next(error);
  }
};
