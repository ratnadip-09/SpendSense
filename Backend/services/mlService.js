const ML_SERVICE_URL =
  process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";

async function categorizeExpense(description) {
  const response = await fetch(`${ML_SERVICE_URL}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      description,
    }),
  });

  if (!response.ok) {
    throw new Error("ML categorization service failed");
  }

  return response.json();
}

module.exports = {
  categorizeExpense,
};