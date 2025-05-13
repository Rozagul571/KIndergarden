from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from main import Base, Ingredient, Meal, MealIngredient, User, MealServing, IngredientDelivery
from datetime import datetime, timedelta
import random

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./kindergarten_meals.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
Base.metadata.create_all(bind=engine)

# Create a session
db = SessionLocal()

# Clear existing data
db.query(MealServing).delete()
db.query(IngredientDelivery).delete()
db.query(MealIngredient).delete()
db.query(Meal).delete()
db.query(Ingredient).delete()
db.query(User).delete()
db.commit()

# Create users
users = [
    User(name="John Smith", role="admin"),
    User(name="Maria Garcia", role="cook"),
    User(name="David Lee", role="cook"),
    User(name="Sarah Johnson", role="manager"),
    User(name="Michael Brown", role="admin"),
]

db.add_all(users)
db.commit()

# Create ingredients
ingredients = [
    Ingredient(name="Beef", quantity=5000, unit="g", threshold=1000, delivery_date=datetime.now() - timedelta(days=2)),
    Ingredient(name="Potato", quantity=8000, unit="g", threshold=2000, delivery_date=datetime.now() - timedelta(days=4)),
    Ingredient(name="Salt", quantity=1500, unit="g", threshold=500, delivery_date=datetime.now() - timedelta(days=7)),
    Ingredient(name="Chicken", quantity=3000, unit="g", threshold=800, delivery_date=datetime.now() - timedelta(days=1)),
    Ingredient(name="Rice", quantity=10000, unit="g", threshold=2000, delivery_date=datetime.now() - timedelta(days=5)),
    Ingredient(name="Carrot", quantity=4000, unit="g", threshold=1000, delivery_date=datetime.now() - timedelta(days=3)),
    Ingredient(name="Onion", quantity=3500, unit="g", threshold=800, delivery_date=datetime.now() - timedelta(days=2)),
    Ingredient(name="Tomato", quantity=2500, unit="g", threshold=600, delivery_date=datetime.now() - timedelta(days=1)),
    Ingredient(name="Flour", quantity=7000, unit="g", threshold=1500, delivery_date=datetime.now() - timedelta(days=6)),
    Ingredient(name="Water", quantity=50000, unit="ml", threshold=10000, delivery_date=datetime.now() - timedelta(days=4)),
    Ingredient(name="Butter", quantity=2000, unit="g", threshold=500, delivery_date=datetime.now() - timedelta(days=5)),
    Ingredient(name="Milk", quantity=5000, unit="ml", threshold=1000, delivery_date=datetime.now() - timedelta(days=3)),
    Ingredient(name="Eggs", quantity=30, unit="pcs", threshold=10, delivery_date=datetime.now() - timedelta(days=2)),
    Ingredient(name="Sugar", quantity=3000, unit="g", threshold=800, delivery_date=datetime.now() - timedelta(days=7)),
    Ingredient(name="Pasta", quantity=6000, unit="g", threshold=1500, delivery_date=datetime.now() - timedelta(days=6)),
    Ingredient(name="Cheese", quantity=2500, unit="g", threshold=600, delivery_date=datetime.now() - timedelta(days=4)),
    Ingredient(name="Garlic", quantity=1000, unit="g", threshold=300, delivery_date=datetime.now() - timedelta(days=5)),
    Ingredient(name="Olive Oil", quantity=2000, unit="ml", threshold=500, delivery_date=datetime.now() - timedelta(days=10)),
    Ingredient(name="Pepper", quantity=800, unit="g", threshold=200, delivery_date=datetime.now() - timedelta(days=15)),
    Ingredient(name="Broccoli", quantity=3000, unit="g", threshold=800, delivery_date=datetime.now() - timedelta(days=2)),
]

db.add_all(ingredients)
db.commit()

# Create meals
meals = [
    Meal(name="Beef Stew"),
    Meal(name="Chicken Rice"),
    Meal(name="Vegetable Soup"),
    Meal(name="Pasta Bolognese"),
    Meal(name="Mashed Potatoes"),
    Meal(name="Rice Pudding"),
    Meal(name="Chicken Soup"),
    Meal(name="Vegetable Stir Fry"),
    Meal(name="Beef Tacos"),
    Meal(name="Pancakes"),
]

db.add_all(meals)
db.commit()

# Create meal ingredients
meal_ingredients = [
    # Beef Stew
    MealIngredient(meal_id=1, ingredient_id=1, quantity=100),  # Beef
    MealIngredient(meal_id=1, ingredient_id=2, quantity=80),   # Potato
    MealIngredient(meal_id=1, ingredient_id=3, quantity=5),    # Salt
    MealIngredient(meal_id=1, ingredient_id=6, quantity=50),   # Carrot
    MealIngredient(meal_id=1, ingredient_id=7, quantity=30),   # Onion
    MealIngredient(meal_id=1, ingredient_id=10, quantity=200), # Water
    
    # Chicken Rice
    MealIngredient(meal_id=2, ingredient_id=4, quantity=100),  # Chicken
    MealIngredient(meal_id=2, ingredient_id=5, quantity=150),  # Rice
    MealIngredient(meal_id=2, ingredient_id=3, quantity=3),    # Salt
    MealIngredient(meal_id=2, ingredient_id=7, quantity=20),   # Onion
    MealIngredient(meal_id=2, ingredient_id=10, quantity=300), # Water
    
    # Vegetable Soup
    MealIngredient(meal_id=3, ingredient_id=2, quantity=100),  # Potato
    MealIngredient(meal_id=3, ingredient_id=6, quantity=80),   # Carrot
    MealIngredient(meal_id=3, ingredient_id=7, quantity=50),   # Onion
    MealIngredient(meal_id=3, ingredient_id=8, quantity=100),  # Tomato
    MealIngredient(meal_id=3, ingredient_id=3, quantity=5),    # Salt
    MealIngredient(meal_id=3, ingredient_id=10, quantity=500), # Water
    
    # Pasta Bolognese
    MealIngredient(meal_id=4, ingredient_id=1, quantity=80),   # Beef
    MealIngredient(meal_id=4, ingredient_id=8, quantity=120),  # Tomato
    MealIngredient(meal_id=4, ingredient_id=7, quantity=40),   # Onion
    MealIngredient(meal_id=4, ingredient_id=15, quantity=150), # Pasta
    MealIngredient(meal_id=4, ingredient_id=3, quantity=4),    # Salt
    MealIngredient(meal_id=4, ingredient_id=16, quantity=30),  # Cheese
    
    # Mashed Potatoes
    MealIngredient(meal_id=5, ingredient_id=2, quantity=200),  # Potato
    MealIngredient(meal_id=5, ingredient_id=11, quantity=20),  # Butter
    MealIngredient(meal_id=5, ingredient_id=12, quantity=50),  # Milk
    MealIngredient(meal_id=5, ingredient_id=3, quantity=3),    # Salt
    
    # Rice Pudding
    MealIngredient(meal_id=6, ingredient_id=5, quantity=100),  # Rice
    MealIngredient(meal_id=6, ingredient_id=12, quantity=300), # Milk
    MealIngredient(meal_id=6, ingredient_id=14, quantity=50),  # Sugar
    MealIngredient(meal_id=6, ingredient_id=13, quantity=1),   # Eggs
    
    # Chicken Soup
    MealIngredient(meal_id=7, ingredient_id=4, quantity=80),   # Chicken
    MealIngredient(meal_id=7, ingredient_id=6, quantity=60),   # Carrot
    MealIngredient(meal_id=7, ingredient_id=7, quantity=40),   # Onion
    MealIngredient(meal_id=7, ingredient_id=3, quantity=4),    # Salt
    MealIngredient(meal_id=7, ingredient_id=10, quantity=400), # Water
    
    # Vegetable Stir Fry
    MealIngredient(meal_id=8, ingredient_id=6, quantity=70),   # Carrot
    MealIngredient(meal_id=8, ingredient_id=7, quantity=50),   # Onion
    MealIngredient(meal_id=8, ingredient_id=20, quantity=100), # Broccoli
    MealIngredient(meal_id=8, ingredient_id=5, quantity=120),  # Rice
    MealIngredient(meal_id=8, ingredient_id=3, quantity=3),    # Salt
    MealIngredient(meal_id=8, ingredient_id=18, quantity=15),  # Olive Oil
    
    # Beef Tacos
    MealIngredient(meal_id=9, ingredient_id=1, quantity=90),   # Beef
    MealIngredient(meal_id=9, ingredient_id=8, quantity=60),   # Tomato
    MealIngredient(meal_id=9, ingredient_id=7, quantity=30),   # Onion
    MealIngredient(meal_id=9, ingredient_id=16, quantity=40),  # Cheese
    MealIngredient(meal_id=9, ingredient_id=3, quantity=3),    # Salt
    MealIngredient(meal_id=9, ingredient_id=9, quantity=100),  # Flour (for tortillas)
    
    # Pancakes
    MealIngredient(meal_id=10, ingredient_id=9, quantity=120), # Flour
    MealIngredient(meal_id=10, ingredient_id=12, quantity=150), # Milk
    MealIngredient(meal_id=10, ingredient_id=13, quantity=2),  # Eggs
    MealIngredient(meal_id=10, ingredient_id=14, quantity=20), # Sugar
    MealIngredient(meal_id=10, ingredient_id=11, quantity=15), # Butter
]

db.add_all(meal_ingredients)
db.commit()

# Create ingredient deliveries (50 data points)
deliveries = []
for _ in range(50):
    ingredient_id = random.randint(1, len(ingredients))
    quantity = random.randint(500, 5000)
    user_id = random.randint(1, len(users))
    delivery_date = datetime.now() - timedelta(days=random.randint(1, 30))
    
    delivery = IngredientDelivery(
        ingredient_id=ingredient_id,
        quantity=quantity,
        user_id=user_id,
        delivery_date=delivery_date
    )
    deliveries.append(delivery)

db.add_all(deliveries)
db.commit()

# Create meal servings (50 data points)
servings = []
for _ in range(50):
    meal_id = random.randint(1, len(meals))
    portions = random.randint(5, 20)
    user_id = random.choice([2, 3])  # Only cooks can serve meals
    served_at = datetime.now() - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23))
    
    serving = MealServing(
        meal_id=meal_id,
        portions=portions,
        user_id=user_id,
        served_at=served_at
    )
    servings.append(serving)

db.add_all(servings)
db.commit()

print("Fixtures created successfully!")
