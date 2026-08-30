import os
import joblib

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline


# --------------------------------------------------
# Training examples
# --------------------------------------------------

DATA = [
    # Food
    ("pizza from dominos", "Food"),
    ("burger and fries", "Food"),
    ("coffee at starbucks", "Food"),
    ("lunch at restaurant", "Food"),
    ("dinner", "Food"),
    ("breakfast", "Food"),
    ("groceries", "Food"),
    ("food delivery", "Food"),
    ("swiggy order", "Food"),
    ("zomato order", "Food"),
    ("pizza", "Food"),
    ("restaurant bill", "Food"),
    ("chai and snacks", "Food"),
    ("mcdonalds", "Food"),
    ("kfc", "Food"),

    # Transport
    ("uber ride", "Transport"),
    ("uber to college", "Transport"),
    ("ola cab", "Transport"),
    ("taxi fare", "Transport"),
    ("bus ticket", "Transport"),
    ("metro ticket", "Transport"),
    ("train ticket", "Transport"),
    ("petrol", "Transport"),
    ("fuel", "Transport"),
    ("auto rickshaw", "Transport"),
    ("rickshaw fare", "Transport"),
    ("cab ride", "Transport"),

    # Shopping
    ("amazon headphones", "Shopping"),
    ("new shoes", "Shopping"),
    ("clothes", "Shopping"),
    ("shirt purchase", "Shopping"),
    ("laptop accessories", "Shopping"),
    ("mobile phone", "Shopping"),
    ("shopping mall", "Shopping"),
    ("flipkart order", "Shopping"),
    ("amazon order", "Shopping"),
    ("watch purchase", "Shopping"),
    ("backpack", "Shopping"),

    # Health
    ("doctor consultation", "Health"),
    ("medicine", "Health"),
    ("pharmacy", "Health"),
    ("hospital bill", "Health"),
    ("medical test", "Health"),
    ("dentist", "Health"),
    ("health checkup", "Health"),
    ("prescription medicine", "Health"),

    # Housing
    ("house rent", "Housing"),
    ("monthly rent", "Housing"),
    ("electricity bill", "Housing"),
    ("water bill", "Housing"),
    ("internet bill", "Housing"),
    ("gas bill", "Housing"),
    ("room rent", "Housing"),

    # Entertainment
    ("movie ticket", "Entertainment"),
    ("netflix subscription", "Entertainment"),
    ("spotify subscription", "Entertainment"),
    ("concert ticket", "Entertainment"),
    ("gaming purchase", "Entertainment"),
    ("video game", "Entertainment"),
    ("movie", "Entertainment"),
    ("prime video", "Entertainment"),

    # Salary
    ("monthly salary", "Salary"),
    ("salary credited", "Salary"),
    ("salary received", "Salary"),
    ("freelance payment", "Salary"),
    ("internship stipend", "Salary"),
    ("payment received", "Salary"),

    # Other
    ("bank charge", "Other"),
    ("service charge", "Other"),
    ("miscellaneous expense", "Other"),
    ("unknown payment", "Other"),
]


texts = [item[0] for item in DATA]
labels = [item[1] for item in DATA]


# --------------------------------------------------
# Build ML pipeline
# --------------------------------------------------

model = Pipeline([
    (
        "tfidf",
        TfidfVectorizer(
            lowercase=True,
            ngram_range=(1, 2),
            sublinear_tf=True
        )
    ),
    (
        "classifier",
        LogisticRegression(
            max_iter=1000,
            class_weight="balanced"
        )
    )
])


print("Training model...")

model.fit(texts, labels)


# --------------------------------------------------
# Save model
# --------------------------------------------------

os.makedirs("model", exist_ok=True)

joblib.dump(model, "model/expense_classifier.joblib")

print("Model trained successfully.")
print("Saved to: model/expense_classifier.joblib")