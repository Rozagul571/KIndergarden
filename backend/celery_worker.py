from celery import Celery
from sqlalchemy import create_engine, func
from sqlalchemy.orm import sessionmaker
from main import Ingredient, Meal, MealIngredient, MealServing, MonthlyReport
from datetime import datetime, timedelta
import asyncio
import json

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./kindergarten_meals.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Celery setup
celery_app = Celery(
    "worker",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0"
)

@celery_app.task
def generate_monthly_report():
    """
    Generate a monthly report of meal servings and efficiency metrics.
    This task runs on the 1st of every month.
    """
    db = SessionLocal()
    
    # Get the previous month
    today = datetime.now()
    first_day_of_month = datetime(today.year, today.month, 1)
    last_month = first_day_of_month - timedelta(days=1)
    first_day_of_last_month = datetime(last_month.year, last_month.month, 1)
    
    # Get all meal servings for the previous month
    servings = db.query(MealServing).filter(
        MealServing.served_at >= first_day_of_last_month,
        MealServing.served_at < first_day_of_month
    ).all()
    
    # Calculate total portions served
    total_portions_served = sum(serving.portions for serving in servings)
    
    # Calculate total possible portions
    # This is a simplified calculation - in a real system, you would need to
    # track inventory changes over time to calculate this accurately
    total_possible_portions = total_portions_served * 1.15  # Assuming 15% waste/inefficiency
    
    # Calculate discrepancy rate
    discrepancy_rate = ((total_possible_portions - total_portions_served) / total_possible_portions) * 100
    
    # Create monthly report
    report = MonthlyReport(
        month=last_month.month,
        year=last_month.year,
        total_portions_served=total_portions_served,
        total_possible_portions=int(total_possible_portions),
        discrepancy_rate=discrepancy_rate,
        generated_at=datetime.now()
    )
    
    db.add(report)
    db.commit()
    
    # Close the session
    db.close()
    
    return {
        "month": last_month.month,
        "year": last_month.year,
        "total_portions_served": total_portions_served,
        "total_possible_portions": int(total_possible_portions),
        "discrepancy_rate": discrepancy_rate
    }

@celery_app.task
def check_low_stock_ingredients():
    """
    Check for ingredients that are below their threshold levels.
    This task runs every 6 hours.
    """
    db = SessionLocal()
    
    # Get all ingredients that are below their threshold
    low_stock_ingredients = db.query(Ingredient).filter(
        Ingredient.quantity <= Ingredient.threshold
    ).all()
    
    # Create a list of low stock ingredients
    low_stock_list = [
        {
            "id": ingredient.id,
            "name": ingredient.name,
            "quantity": ingredient.quantity,
            "unit": ingredient.unit,
            "threshold": ingredient.threshold
        }
        for ingredient in low_stock_ingredients
    ]
    
    # Close the session
    db.close()
    
    # In a real system, you would send notifications here
    # For example, send emails, push notifications, etc.
    
    return {
        "low_stock_count": len(low_stock_list),
        "low_stock_ingredients": low_stock_list
    }

if __name__ == "__main__":
    celery_app.start()
