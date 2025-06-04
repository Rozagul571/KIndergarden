from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum as PyEnum

Base = declarative_base()

# Enums
class IngredientStatus(str, PyEnum):
    AVAILABLE = "Available"
    LOW = "Low"
    OUT_OF_STOCK = "Out of Stock"
    EXPIRED = "Expired"

class OrderStatus(str, PyEnum):
    PENDING = "Pending"
    APPROVED = "Approved"
    DELIVERED = "Delivered"
    REJECTED = "Rejected"

class UserRole(str, PyEnum):
    ADMIN = "admin"
    COOK = "cook"
    MANAGER = "manager"

class NotificationType(str, PyEnum):
    SYSTEM = "system"
    MEAL_SERVED = "meal_served"
    ORDER_STATUS = "order_status"
    INVENTORY_ALERT = "inventory_alert"
    INVENTORY_DELIVERY = "inventory_delivery"
    INVENTORY_UPDATE = "inventory_update"

# Database Models
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String, index=True)
    hashed_password = Column(String)
    role = Column(String)  # admin, cook, manager
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    servings = relationship("MealServing", back_populates="user")
    deliveries = relationship("IngredientDelivery", back_populates="user")
    orders = relationship("Order", back_populates="created_by_user")
    notifications = relationship("Notification", back_populates="user")

class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    quantity = Column(Float)
    unit = Column(String)
    delivery_date = Column(DateTime, default=datetime.utcnow)
    threshold = Column(Float)
    status = Column(String, default=IngredientStatus.AVAILABLE)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    meal_ingredients = relationship("MealIngredient", back_populates="ingredient")
    deliveries = relationship("IngredientDelivery", back_populates="ingredient")
    orders = relationship("Order", back_populates="ingredient")

class IngredientDelivery(Base):
    __tablename__ = "ingredient_deliveries"

    id = Column(Integer, primary_key=True, index=True)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id"))
    quantity = Column(Float)
    delivery_date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    ingredient = relationship("Ingredient", back_populates="deliveries")
    user = relationship("User", back_populates="deliveries")

class Meal(Base):
    __tablename__ = "meals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String)
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    meal_ingredients = relationship("MealIngredient", back_populates="meal")
    servings = relationship("MealServing", back_populates="meal")

class MealIngredient(Base):
    __tablename__ = "meal_ingredients"

    id = Column(Integer, primary_key=True, index=True)
    meal_id = Column(Integer, ForeignKey("meals.id"))
    ingredient_id = Column(Integer, ForeignKey("ingredients.id"))
    quantity = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    meal = relationship("Meal", back_populates="meal_ingredients")
    ingredient = relationship("Ingredient", back_populates="meal_ingredients")

class MealServing(Base):
    __tablename__ = "meal_servings"

    id = Column(Integer, primary_key=True, index=True)
    meal_id = Column(Integer, ForeignKey("meals.id"))
    portions = Column(Integer)
    serving_date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    meal = relationship("Meal", back_populates="servings")
    user = relationship("User", back_populates="servings")

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id"))
    quantity = Column(Float)
    status = Column(String, default=OrderStatus.PENDING)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    ingredient = relationship("Ingredient", back_populates="orders")
    created_by_user = relationship("User", back_populates="orders")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    message = Column(Text)
    notification_type = Column(String, default=NotificationType.SYSTEM)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="notifications", foreign_keys=[user_id])
    creator = relationship("User", foreign_keys=[created_by])

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    content = Column(Text)
    report_type = Column(String)  # monthly, inventory, efficiency
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
