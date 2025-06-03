from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from ..database import get_db
from ..models.models import Meal, MealIngredient, User, UserRole, Notification
from ..schemas.schemas import MealCreate, MealResponse, MealIngredientResponse
from ..utils.auth import get_current_user

router = APIRouter(prefix="/meals", tags=["meals"])

@router.post("/", response_model=MealResponse)
async def create_meal(
    meal: MealCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in [UserRole.ADMIN, UserRole.COOK]:
        raise HTTPException(status_code=403, detail="Not authorized to create meals")

    db_meal = Meal(
        name=meal.name,
        description=meal.description,
        image_url=meal.image_url,
        created_by=current_user.id
    )
    db.add(db_meal)
    db.commit()
    db.refresh(db_meal)

    ingredients_response = []
    for ingredient in meal.ingredients:
        db_ingredient = MealIngredient(
            meal_id=db_meal.id,
            ingredient_id=ingredient.ingredientId,
            quantity=ingredient.quantity,
        )
        db.add(db_ingredient)
        ingredients_response.append(MealIngredientResponse(
            id=db_ingredient.id,
            ingredient_id=ingredient.ingredientId,
            ingredient_name=ingredient.name,
            quantity=ingredient.quantity,
            unit=ingredient.unit
        ))

    db.commit()

    ingredients_list = ", ".join([f"{ing.ingredient_name}: {ing.quantity} {ing.unit}" for ing in ingredients_response])
    notification_message = f"{current_user.name} added new meal '{meal.name}' with ingredients: {ingredients_list}"
    db_notification = Notification(
        user_id=None,  # Broadcast to admins
        message=notification_message,
        notification_type="meal_added",
        created_by=current_user.id
    )
    db.add(db_notification)
    db.commit()

    return MealResponse(
        id=db_meal.id,
        name=db_meal.name,
        description=db_meal.description,
        image_url=db_meal.image_url,
        ingredients=ingredients_response,
        created_at=db_meal.created_at,
        updated_at=db_meal.updated_at
    )

@router.get("/", response_model=List[MealResponse])
async def get_meals(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all meals."""
    if current_user.role not in [UserRole.ADMIN, UserRole.COOK]:
        raise HTTPException(status_code=403, detail="Not authorized to view meals")

    meals = db.query(Meal).offset(skip).limit(limit).all()
    result = []
    for meal in meals:
        ingredients = db.query(MealIngredient).filter(MealIngredient.meal_id == meal.id).all()
        result.append(MealResponse(
            id=meal.id,
            name=meal.name,
            description=meal.description,
            image_url=meal.image_url,
            ingredients=[
                MealIngredientResponse(
                    id=ing.id,
                    ingredient_id=ing.ingredient_id,
                    ingredient_name=ing.ingredient_name or "",
                    quantity=ing.quantity,
                    unit=ing.unit or ""
                ) for ing in ingredients
            ],
            created_at=meal.created_at,
            updated_at=meal.updated_at
        ))
    return result

@router.put("/{meal_id}", response_model=MealResponse)
async def update_meal(
    meal_id: int,
    meal: MealCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update an existing meal.
    """
    if current_user.role not in [UserRole.ADMIN, UserRole.COOK]:
        raise HTTPException(status_code=403, detail="Not authorized to update meals")

    db_meal = db.query(Meal).filter(Meal.id == meal_id).first()
    if not db_meal:
        raise HTTPException(status_code=404, detail="Meal not found")

    # Store original data for comparison
    original_ingredients = db.query(MealIngredient).filter(MealIngredient.meal_id == meal_id).all()
    original_ingredients_dict = {ing.ingredient_id: ing.quantity for ing in original_ingredients}

    # Update meal details
    changes = []
    if db_meal.name != meal.name:
        changes.append(f"name changed to '{meal.name}'")
    if db_meal.description != meal.description:
        changes.append("description updated")
    db_meal.name = meal.name
    db_meal.description = meal.description
    db_meal.image_url = meal.image_url
    db_meal.updated_at = datetime.utcnow()

    # Update ingredients
    db.query(MealIngredient).filter(MealIngredient.meal_id == meal_id).delete()
    ingredients_response = []
    for ingredient in meal.ingredients:
        db_ingredient = MealIngredient(
            meal_id=meal_id,
            ingredient_id=ingredient.ingredientId,
            quantity=ingredient.quantity,
            ingredient_name=ingredient.name,
            unit=ingredient.unit
        )
        db.add(db_ingredient)
        ingredients_response.append(MealIngredientResponse(
            id=db_ingredient.id,
            ingredient_id=ingredient.ingredientId,
            ingredient_name=ingredient.name,
            quantity=ingredient.quantity,
            unit=ingredient.unit
        ))

        # Detect ingredient changes
        original_qty = original_ingredients_dict.get(ingredient.ingredientId, 0)
        if original_qty == 0:
            changes.append(f"added {ingredient.name}: {ingredient.quantity} {ingredient.unit}")
        elif original_qty != ingredient.quantity:
            changes.append(f"{ingredient.name} quantity changed to {ingredient.quantity} {ingredient.unit}")

    # Check for removed ingredients
    for ing in original_ingredients:
        if not any(i.ingredientId == ing.ingredient_id for i in meal.ingredients):
            changes.append(f"removed {ing.ingredient_name}")

    db.commit()
    db.refresh(db_meal)

    # Create notification
    notification_message = changes
    notification_message = f"{current_user.name} updated meal '{meal.name}': {', '.join(changes)}" if changes else f"{current_user.name} updated meal '{meal.name}'"
    db_notification = Notification(
        user_id=None,  # Broadcast to admins
        message=notification_message,
        notification_type="meal_updated",
        created_by=current_user.id
    )
    db.add(db_notification)
    db.commit()

    return MealResponse(
        id=db_meal.id,
        name=db_meal.name,
        description=db_meal.description,
        image_url=db_meal.image_url,
        ingredients=ingredients_response,
        created_at=db_meal.created_at,
        updated_at=db_meal.updated_at
    )

@router.delete("/{meal_id}")
async def delete_meal(
    meal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a meal."""
    if current_user.role not in [UserRole.ADMIN, UserRole.COOK]:
        raise HTTPException(status_code=403, detail="Not authorized to delete meals")

    db_meal = db.query(Meal).filter(Meal.id == meal_id).first()
    if not db_meal:
        raise HTTPException(status_code=404, detail="Meal not found")

    # Create notification
    notification_message = f"{current_user.name} deleted meal '{db_meal.name}'"
    db_notification = Notification(
        user_id=None,  # Broadcast to admins
        message=notification_message,
        notification_type="meal_deleted",
        created_by=current_user.id
    )
    db.add(db_notification)

    db.query(MealIngredient).filter(MealIngredient.meal_id == meal_id).delete()
    db.delete(db_meal)
    db.commit()

    return {"message": "Meal deleted successfully"}
