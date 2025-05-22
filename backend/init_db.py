from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.models import Base, User, UserRole, Meal, MealServing, Ingredient, IngredientStatus
from passlib.context import CryptContext
from datetime import datetime, timedelta
import random

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./kindergarten_meals.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def init_db():
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Create a database session
    db = SessionLocal()
    
    # Check if users already exist
    if db.query(User).count() == 0:
        # Create users with Uzbek names
        users = [
            User(
                name="Surayyo Karimova",
                email="admin@example.com",
                hashed_password=get_password_hash("Surayyo123"),
                role=UserRole.ADMIN
            ),
            User(
                name="Og'iloy Tursunova",
                email="cook1@example.com",
                hashed_password=get_password_hash("Ogiloy123"),
                role=UserRole.COOK
            ),
            User(
                name="Muxtasar Azizova",
                email="cook2@example.com",
                hashed_password=get_password_hash("Muxtasar123"),
                role=UserRole.COOK
            ),
            User(
                name="Kamola Umarova",
                email="manager1@example.com",
                hashed_password=get_password_hash("Kamola123"),
                role=UserRole.MANAGER
            ),
            User(
                name="Aziza Rahimova",
                email="cook3@example.com",
                hashed_password=get_password_hash("Aziza123"),
                role=UserRole.COOK
            ),
            User(
                name="Shakhzoda Kamalova",
                email="manager2@example.com",
                hashed_password=get_password_hash("Shakhzoda123"),
                role=UserRole.MANAGER
            ),
            User(
                name="Odina Rustamova",
                email="cook4@example.com",
                hashed_password=get_password_hash("Odina123"),
                role=UserRole.COOK
            ),
            User(
                name="Tanzila Nodirbekova",
                email="cook5@example.com",
                hashed_password=get_password_hash("Tanzila123"),
                role=UserRole.COOK
            ),
        ]
        
        # Add users to the database
        for user in users:
            db.add(user)
        
        # Commit changes
        db.commit()
        
        print("Database initialized with Uzbek users")
    
    # Check if meals already exist
    if db.query(Meal).count() == 0:
        # Create Uzbek meals
        meals = [
            Meal(
                name="Osh (Plov)",
                description="Traditional Uzbek rice dish with meat, carrots, and spices",
                image_url="/images/plov.jpg",
                created_by=1
            ),
            Meal(
                name="Lagman",
                description="Hand-pulled noodles with meat and vegetables",
                image_url="/images/lagman.jpg",
                created_by=1
            ),
            Meal(
                name="Somsa",
                description="Baked pastry with meat and onion filling",
                image_url="/images/somsa.jpg",
                created_by=1
            ),
            Meal(
                name="Manti",
                description="Steamed dumplings filled with meat and onions",
                image_url="/images/manti.jpg",
                created_by=1
            ),
            Meal(
                name="Shurpa",
                description="Traditional meat and vegetable soup",
                image_url="/images/shurpa.jpg",
                created_by=1
            ),
        ]
        
        # Add meals to the database
        for meal in meals:
            db.add(meal)
        
        # Commit changes
        db.commit()
        
        print("Database initialized with Uzbek meals")
    
    # Check if ingredients already exist
    if db.query(Ingredient).count() == 0:
        # Create ingredients
        ingredients = [
            Ingredient(
                name="Rice",
                quantity=50.0,
                unit="kg",
                threshold=10.0,
                status=IngredientStatus.AVAILABLE,
                created_by=1
            ),
            Ingredient(
                name="Beef",
                quantity=30.0,
                unit="kg",
                threshold=5.0,
                status=IngredientStatus.AVAILABLE,
                created_by=1
            ),
            Ingredient(
                name="Carrots",
                quantity=25.0,
                unit="kg",
                threshold=5.0,
                status=IngredientStatus.AVAILABLE,
                created_by=1
            ),
            Ingredient(
                name="Onions",
                quantity=20.0,
                unit="kg",
                threshold=4.0,
                status=IngredientStatus.AVAILABLE,
                created_by=1
            ),
            Ingredient(
                name="Flour",
                quantity=40.0,
                unit="kg",
                threshold=8.0,
                status=IngredientStatus.AVAILABLE,
                created_by=1
            ),
            Ingredient(
                name="Potatoes",
                quantity=35.0,
                unit="kg",
                threshold=7.0,
                status=IngredientStatus.AVAILABLE,
                created_by=1
            ),
        ]
        
        # Add ingredients to the database
        for ingredient in ingredients:
            db.add(ingredient)
        
        # Commit changes
        db.commit()
        
        print("Database initialized with ingredients")
    
    # Check if meal servings already exist
    if db.query(MealServing).count() == 0:
        # Create meal servings with Uzbek staff
        meal_servings = [
            # May 23, 2025 servings
            MealServing(
                meal_id=1,  # Osh (Plov)
                portions=15,
                serving_date=datetime(2025, 5, 23, 12, 30),
                user_id=2  # Og'iloy
            ),
            MealServing(
                meal_id=2,  # Lagman
                portions=12,
                serving_date=datetime(2025, 5, 23, 9, 15),
                user_id=3  # Muxtasar
            ),
            MealServing(
                meal_id=3,  # Somsa
                portions=20,
                serving_date=datetime(2025, 5, 23, 10, 45),
                user_id=5  # Aziza
            ),
            
            # Previous days
            MealServing(
                meal_id=1,  # Osh (Plov)
                portions=10,
                serving_date=datetime(2025, 5, 11, 9, 30),
                user_id=3  # Muxtasar
            ),
            MealServing(
                meal_id=2,  # Lagman
                portions=15,
                serving_date=datetime(2025, 5, 11, 12, 15),
                user_id=7  # Odina
            ),
            MealServing(
                meal_id=3,  # Somsa
                portions=8,
                serving_date=datetime(2025, 5, 10, 11, 45),
                user_id=3  # Muxtasar
            ),
            MealServing(
                meal_id=4,  # Manti
                portions=12,
                serving_date=datetime(2025, 5, 10, 10, 30),
                user_id=4  # Kamola
            ),
            MealServing(
                meal_id=5,  # Shurpa
                portions=6,
                serving_date=datetime(2025, 5, 9, 13, 20),
                user_id=7  # Odina
            ),
            MealServing(
                meal_id=1,  # Osh (Plov)
                portions=14,
                serving_date=datetime(2025, 5, 9, 9, 15),
                user_id=3  # Muxtasar
            ),
            MealServing(
                meal_id=2,  # Lagman
                portions=10,
                serving_date=datetime(2025, 5, 8, 11, 30),
                user_id=1  # Surayyo
            ),
            MealServing(
                meal_id=3,  # Somsa
                portions=20,
                serving_date=datetime(2025, 5, 8, 10, 0),
                user_id=7  # Odina
            ),
        ]
        
        # Add meal servings to the database
        for meal_serving in meal_servings:
            db.add(meal_serving)
        
        # Commit changes
        db.commit()
        
        print("Database initialized with meal servings")
    else:
        print("Users already exist in the database")
    
    # Close the session
    db.close()

if __name__ == "__main__":
    init_db()
