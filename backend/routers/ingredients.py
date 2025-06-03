from fastapi import APIRouter, Depends, HTTPException, WebSocket
from sqlalchemy.orm import Session
from typing import List
import json
from ..database import get_db
from ..models.models import Ingredient, IngredientStatus, User, UserRole
from ..schemas.schemas import IngredientCreate, IngredientResponse, IngredientUpdate
from ..utils.auth import get_current_user
from ..websocket import manager

router = APIRouter(prefix="/ingredients", tags=["ingredients"])

@router.post("/", response_model=IngredientResponse)
async def create_ingredient(ingredient: IngredientCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(status_code=403, detail="Not authorized to create ingredients")
    
    db_ingredient = db.query(Ingredient).filter(Ingredient.name == ingredient.name).first()
    if db_ingredient:
        raise HTTPException(status_code=400, detail="Ingredient already exists")
    
    status = IngredientStatus.AVAILABLE
    if ingredient.quantity <= 0:
        status = IngredientStatus.OUT_OF_STOCK
    elif ingredient.quantity <= ingredient.threshold:
        status = IngredientStatus.LOW
    
    db_ingredient = Ingredient(name=ingredient.name, quantity=ingredient.quantity,unit=ingredient.unit, threshold=ingredient.threshold, status=status, created_by=current_user.id
    )
    db.add(db_ingredient)
    db.commit()
    db.refresh(db_ingredient)
    
    await manager.broadcast(json.dumps({
        "type": "ingredient_created",
        "message": f"New ingredient {db_ingredient.name} added by {current_user.name}",
        "data": {
            "id": db_ingredient.id,
            "name": db_ingredient.name,
            "quantity": db_ingredient.quantity,
            "unit": db_ingredient.unit,
            "status": db_ingredient.status,
            "createdBy": current_user.name
        },
        "timestamp": db_ingredient.created_at.isoformat()
    }))
    
    return db_ingredient

@router.get("/", response_model=List[IngredientResponse])
async def read_ingredients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    ingredients = db.query(Ingredient).offset(skip).limit(limit).all()
    return ingredients

@router.get("/{ingredient_id}", response_model=IngredientResponse)
async def read_ingredient(ingredient_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_ingredient = db.query(Ingredient).filter(Ingredient.id == ingredient_id).first()
    if not db_ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    return db_ingredient

@router.put("/{ingredient_id}", response_model=IngredientResponse)
async def update_ingredient(ingredient_id: int, ingredient: IngredientUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(status_code=403, detail="Not authorized to update ingredients")
    
    db_ingredient = db.query(Ingredient).filter(Ingredient.id == ingredient_id).first()
    if not db_ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    
    previous_quantity = db_ingredient.quantity
    
    if ingredient.name is not None:
        db_ingredient.name = ingredient.name
    if ingredient.quantity is not None:
        db_ingredient.quantity = ingredient.quantity
        
        # Update status based on quantity
        if db_ingredient.quantity <= 0:
            db_ingredient.status = IngredientStatus.OUT_OF_STOCK
        elif db_ingredient.quantity <= db_ingredient.threshold:
            db_ingredient.status = IngredientStatus.LOW
        else:
            db_ingredient.status = IngredientStatus.AVAILABLE
    
    if ingredient.unit is not None:
        db_ingredient.unit = ingredient.unit
    if ingredient.threshold is not None:
        db_ingredient.threshold = ingredient.threshold
    if ingredient.status is not None:
        db_ingredient.status = ingredient.status
    
    db.commit()
    db.refresh(db_ingredient)
    
    # Notify via WebSocket
    await manager.broadcast(json.dumps({
        "type": "ingredient_updated",
        "message": f"{db_ingredient.name} updated from {previous_quantity} to {db_ingredient.quantity} {db_ingredient.unit} by {current_user.name}",
        "data": {
            "id": db_ingredient.id,
            "name": db_ingredient.name,
            "previousQuantity": previous_quantity,
            "quantity": db_ingredient.quantity,
            "unit": db_ingredient.unit,
            "status": db_ingredient.status,
            "updatedBy": current_user.name
        },
        "timestamp": db_ingredient.updated_at.isoformat()
    }))
    
    return db_ingredient

@router.delete("/{ingredient_id}", response_model=IngredientResponse)
async def delete_ingredient(ingredient_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(status_code=403, detail="Not authorized to delete ingredients")
    
    db_ingredient = db.query(Ingredient).filter(Ingredient.id == ingredient_id).first()
    if not db_ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    
    ingredient_name = db_ingredient.name
    
    db.delete(db_ingredient)
    db.commit()
    
    # Notify via WebSocket
    await manager.broadcast(json.dumps({
        "type": "ingredient_deleted",
        "message": f"{ingredient_name} has been deleted by {current_user.name}",
        "data": {
            "id": ingredient_id,
            "name": ingredient_name,
            "deletedBy": current_user.name
        },
        "timestamp": db_ingredient.updated_at.isoformat()
    }))
    
    return db_ingredient
