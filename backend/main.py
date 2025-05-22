from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, DateTime, func, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import json
import asyncio
from celery import Celery
from celery.schedules import crontab
import jwt
from passlib.context import CryptContext
import os
from enum import Enum

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./kindergarten_meals.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# JWT Configuration
SECRET_KEY = "your-secret-key"  # In production, use a secure key and store in environment variables
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Celery setup
celery_app = Celery(
    "worker",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0"
)

celery_app.conf.beat_schedule = {
    "generate-monthly-report": {
        "task": "backend.main.generate_monthly_report",
        "schedule": crontab(day_of_month=1, hour=0, minute=0),  # Run on the 1st of every month
    },
    "check-low-stock-ingredients": {
        "task": "backend.main.check_low_stock-ingredients",
        "schedule": crontab(hour="*/6", minute=0),  # Run every 6 hours
    },
}

# Enums
class IngredientStatus(str, Enum):
    AVAILABLE = "Available"
    LOW = "Low"
    OUT_OF_STOCK = "Out of Stock"
    EXPIRED = "Expired"

class OrderStatus(str, Enum):
    PENDING = "Pending"
    APPROVED = "Approved"
    DELIVERED = "Delivered"
    REJECTED = "Rejected"

class UserRole(str, Enum):
    ADMIN = "admin"
    COOK = "cook"
    MANAGER = "manager"

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
    
    servings = relationship("MealServing", back_populates="user")
    deliveries = relationship("IngredientDelivery", back_populates="user")
    orders = relationship("Order", back_populates="created_by_user")

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
    
    ingredient = relationship("Ingredient", back_populates="orders")
    created_by_user = relationship("User", back_populates="orders")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    message = Column(String)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    content = Column(String)
    report_type = Column(String)  # monthly, inventory, efficiency
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Pydantic Models for API
class UserBase(BaseModel):
    email: str
    name: str
    role: str

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[str] = None
    name: Optional[str] = None
    role: Optional[str] = None
    password: Optional[str] = None

class UserResponse(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

class IngredientBase(BaseModel):
    name: str
    quantity: float
    unit: str
    threshold: float

class IngredientCreate(IngredientBase):
    pass

class IngredientUpdate(BaseModel):
    name: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    threshold: Optional[float] = None
    status: Optional[str] = None

class IngredientResponse(IngredientBase):
    id: int
    status: str
    delivery_date: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class IngredientDeliveryBase(BaseModel):
    ingredient_id: int
    quantity: float
    delivery_date: Optional[datetime] = None

class IngredientDeliveryCreate(IngredientDeliveryBase):
    pass

class IngredientDeliveryResponse(IngredientDeliveryBase):
    id: int
    created_at: datetime
    updated_at: datetime
    user_id: int

    class Config:
        orm_mode = True

class MealBase(BaseModel):
    name: str
    description: str
    image_url: Optional[str] = None

class MealCreate(MealBase):
    ingredients: List[Dict[str, Any]]  # List of {ingredient_id, quantity}

class MealUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    ingredients: Optional[List[Dict[str, Any]]] = None

class MealIngredientResponse(BaseModel):
    id: int
    ingredient_id: int
    ingredient_name: str
    quantity: float
    unit: str

    class Config:
        orm_mode = True

class MealResponse(MealBase):
    id: int
    created_at: datetime
    updated_at: datetime
    ingredients: List[MealIngredientResponse]

    class Config:
        orm_mode = True

class MealServingBase(BaseModel):
    meal_id: int
    portions: int
    serving_date: Optional[datetime] = None

class MealServingCreate(MealServingBase):
    pass

class MealServingResponse(MealServingBase):
    id: int
    created_at: datetime
    updated_at: datetime
    user_id: int
    meal_name: str

    class Config:
        orm_mode = True

class OrderBase(BaseModel):
    ingredient_id: int
    quantity: float

class OrderCreate(OrderBase):
    pass

class OrderUpdate(BaseModel):
    status: str

class OrderResponse(OrderBase):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime
    created_by: int
    ingredient_name: str

    class Config:
        orm_mode = True

class NotificationBase(BaseModel):
    user_id: int
    message: str

class NotificationCreate(NotificationBase):
    pass

class NotificationUpdate(BaseModel):
    is_read: bool

class NotificationResponse(NotificationBase):
    id: int
    is_read: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class ReportBase(BaseModel):
    title: str
    content: str
    report_type: str

class ReportCreate(ReportBase):
    pass

class ReportResponse(ReportBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

# Database Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Authentication Functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def get_user(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def authenticate_user(db: Session, email: str, password: str):
    user = get_user(db, email)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except jwt.PyJWTError:
        raise credentials_exception
    user = get_user(db, email=token_data.email)
    if user is None:
        raise credentials_exception
    return user

# WebSocket Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

# FastAPI App
app = FastAPI(title="Kindergarten Meal Tracking & Inventory Management System")

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables
Base.metadata.create_all(bind=engine)

# Authentication Routes
@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

# User Routes
@app.post("/users/", response_model=UserResponse)
async def create_user(user: UserCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to create users")
    
    db_user = get_user(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        name=user.name,
        hashed_password=hashed_password,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/users/", response_model=List[UserResponse])
async def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to view all users")
    
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@app.get("/users/me/", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.put("/users/{user_id}", response_model=UserResponse)
async def update_user(user_id: int, user: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this user")
    
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.email is not None:
        db_user.email = user.email
    if user.name is not None:
        db_user.name = user.name
    if user.role is not None and current_user.role == UserRole.ADMIN:
        db_user.role = user.role
    if user.password is not None:
        db_user.hashed_password = get_password_hash(user.password)
    
    db.commit()
    db.refresh(db_user)
    return db_user

@app.delete("/users/{user_id}", response_model=UserResponse)
async def delete_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to delete users")
    
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(db_user)
    db.commit()
    return db_user

# Ingredient Routes
@app.post("/ingredients/", response_model=IngredientResponse)
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
    
    db_ingredient = Ingredient(
        name=ingredient.name,
        quantity=ingredient.quantity,
        unit=ingredient.unit,
        threshold=ingredient.threshold,
        status=status,
        created_by=current_user.id
    )
    db.add(db_ingredient)
    db.commit()
    db.refresh(db_ingredient)
    
    # Notify via WebSocket
    await manager.broadcast(json.dumps({
        "type": "ingredient_created",
        "data": {
            "id": db_ingredient.id,
            "name": db_ingredient.name,
            "quantity": db_ingredient.quantity,
            "unit": db_ingredient.unit,
            "status": db_ingredient.status
        }
    }))
    
    return db_ingredient

@app.get("/ingredients/", response_model=List[IngredientResponse])
async def read_ingredients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    ingredients = db.query(Ingredient).offset(skip).limit(limit).all()
    return ingredients

@app.get("/ingredients/{ingredient_id}", response_model=IngredientResponse)
async def read_ingredient(ingredient_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_ingredient = db.query(Ingredient).filter(Ingredient.id == ingredient_id).first()
    if not db_ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    return db_ingredient

@app.put("/ingredients/{ingredient_id}", response_model=IngredientResponse)
async def update_ingredient(ingredient_id: int, ingredient: IngredientUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(status_code=403, detail="Not authorized to update ingredients")
    
    db_ingredient = db.query(Ingredient).filter(Ingredient.id == ingredient_id).first()
    if not db_ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    
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
        "data": {
            "id": db_ingredient.id,
            "name": db_ingredient.name,
            "quantity": db_ingredient.quantity,
            "unit": db_ingredient.unit,
            "status": db_ingredient.status
        }
    }))
    
    return db_ingredient

@app.delete("/ingredients/{ingredient_id}", response_model=IngredientResponse)
async def delete_ingredient(ingredient_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(status_code=403, detail="Not authorized to delete ingredients")
    
    db_ingredient = db.query(Ingredient).filter(Ingredient.id == ingredient_id).first()
    if not db_ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    
    db.delete(db_ingredient)
    db.commit()
    
    # Notify via WebSocket
    await manager.broadcast(json.dumps({
        "type": "ingredient_deleted",
        "data": {
            "id": ingredient_id
        }
    }))
    
    return db_ingredient

# Ingredient Delivery Routes
@app.post("/ingredient-deliveries/", response_model=IngredientDeliveryResponse)
async def create_ingredient_delivery(delivery: IngredientDeliveryCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(status_code=403, detail="Not authorized to create deliveries")
    
    db_ingredient = db.query(Ingredient).filter(Ingredient.id == delivery.ingredient_id).first()
    if not db_ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    
    db_delivery = IngredientDelivery(
        ingredient_id=delivery.ingredient_id,
        quantity=delivery.quantity,
        delivery_date=delivery.delivery_date or datetime.utcnow(),
        user_id=current_user.id
    )
    db.add(db_delivery)
    
    # Update ingredient quantity
    db_ingredient.quantity += delivery.quantity
    if db_ingredient.quantity <= 0:
        db_ingredient.status = IngredientStatus.OUT_OF_STOCK
    elif db_ingredient.quantity <= db_ingredient.threshold:
        db_ingredient.status = IngredientStatus.LOW
    else:
        db_ingredient.status = IngredientStatus.AVAILABLE
    
    db.commit()
    db.refresh(db_delivery)
    
    # Notify via WebSocket
    await manager.broadcast(json.dumps({
        "type": "delivery_created",
        "data": {
            "id": db_delivery.id,
            "ingredient_id": db_delivery.ingredient_id,
            "quantity": db_delivery.quantity,
            "ingredient_name": db_ingredient.name,
            "new_quantity": db_ingredient.quantity
        }
    }))
    
    return db_delivery

@app.get("/ingredient-deliveries/", response_model=List[IngredientDeliveryResponse])
async def read_ingredient_deliveries(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    deliveries = db.query(IngredientDelivery).offset(skip).limit(limit).all()
    return deliveries

# Meal Routes
@app.post("/meals/", response_model=MealResponse)
async def create_meal(meal: MealCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.ADMIN, UserRole.COOK]:
        raise HTTPException(status_code=403, detail="Not authorized to create meals")
    
    db_meal = db.query(Meal).filter(Meal.name == meal.name).first()
    if db_meal:
        raise HTTPException(status_code=400, detail="Meal already exists")
    
    db_meal = Meal(
        name=meal.name,
        description=meal.description,
        image_url=meal.image_url,
        created_by=current_user.id
    )
    db.add(db_meal)
    db.commit()
    db.refresh(db_meal)
    
    # Add ingredients to meal
    for ingredient_data in meal.ingredients:
        ingredient_id = ingredient_data.get("ingredient_id")
        quantity = ingredient_data.get("quantity")
        
        db_ingredient = db.query(Ingredient).filter(Ingredient.id == ingredient_id).first()
        if not db_ingredient:
            raise HTTPException(status_code=404, detail=f"Ingredient with id {ingredient_id} not found")
        
        meal_ingredient = MealIngredient(
            meal_id=db_meal.id,
            ingredient_id=ingredient_id,
            quantity=quantity
        )
        db.add(meal_ingredient)
    
    db.commit()
    db.refresh(db_meal)
    
    # Prepare response with ingredients
    ingredients = []
    for mi in db_meal.meal_ingredients:
        ingredient = db.query(Ingredient).filter(Ingredient.id == mi.ingredient_id).first()
        ingredients.append({
            "id": mi.id,
            "ingredient_id": mi.ingredient_id,
            "ingredient_name": ingredient.name,
            "quantity": mi.quantity,
            "unit": ingredient.unit
        })
    
    # Notify via WebSocket
    await manager.broadcast(json.dumps({
        "type": "meal_created",
        "data": {
            "id": db_meal.id,
            "name": db_meal.name,
            "description": db_meal.description,
            "image_url": db_meal.image_url
        }
    }))
    
    response_meal = {
        "id": db_meal.id,
        "name": db_meal.name,
        "description": db_meal.description,
        "image_url": db_meal.image_url,
        "created_at": db_meal.created_at,
        "updated_at": db_meal.updated_at,
        "ingredients": ingredients
    }
    
    return response_meal

@app.get("/meals/", response_model=List[MealResponse])
async def read_meals(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    meals = db.query(Meal).offset(skip).limit(limit).all()
    
    response_meals = []
    for meal in meals:
        ingredients = []
        for mi in meal.meal_ingredients:
            ingredient = db.query(Ingredient).filter(Ingredient.id == mi.ingredient_id).first()
            ingredients.append({
                "id": mi.id,
                "ingredient_id": mi.ingredient_id,
                "ingredient_name": ingredient.name,
                "quantity": mi.quantity,
                "unit": ingredient.unit
            })
        
        response_meal = {
            "id": meal.id,
            "name": meal.name,
            "description": meal.description,
            "image_url": meal.image_url,
            "created_at": meal.created_at,
            "updated_at": meal.updated_at,
            "ingredients": ingredients
        }
        response_meals.append(response_meal)
    
    return response_meals

@app.get("/meals/{meal_id}", response_model=MealResponse)
async def read_meal(meal_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_meal = db.query(Meal).filter(Meal.id == meal_id).first()
    if not db_meal:
        raise HTTPException(status_code=404, detail="Meal not found")
    
    ingredients = []
    for mi in db_meal.meal_ingredients:
        ingredient = db.query(Ingredient).filter(Ingredient.id == mi.ingredient_id).first()
        ingredients.append({
            "id": mi.id,
            "ingredient_id": mi.ingredient_id,
            "ingredient_name": ingredient.name,
            "quantity": mi.quantity,
            "unit": ingredient.unit
        })
    
    response_meal = {
        "id": db_meal.id,
        "name": db_meal.name,
        "description": db_meal.description,
        "image_url": db_meal.image_url,
        "created_at": db_meal.created_at,
        "updated_at": db_meal.updated_at,
        "ingredients": ingredients
    }
    
    return response_meal

@app.put("/meals/{meal_id}", response_model=MealResponse)
async def update_meal(meal_id: int, meal: MealUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.ADMIN, UserRole.COOK]:
        raise HTTPException(status_code=403, detail="Not authorized to update meals")
    
    db_meal = db.query(Meal).filter(Meal.id == meal_id).first()
    if not db_meal:
        raise HTTPException(status_code=404, detail="Meal not found")
    
    if meal.name is not None:
        db_meal.name = meal.name
    if meal.description is not None:
        db_meal.description = meal.description
    if meal.image_url is not None:
        db_meal.image_url = meal.image_url
    
    # Update ingredients if provided
    if meal.ingredients is not None:
        # Remove existing meal ingredients
        db.query(MealIngredient).filter(MealIngredient.meal_id == meal_id).delete()
        
        # Add new ingredients
        for ingredient_data in meal.ingredients:
            ingredient_id = ingredient_data.get("ingredient_id")
            quantity = ingredient_data.get("quantity")
            
            db_ingredient = db.query(Ingredient).filter(Ingredient.id == ingredient_id).first()
            if not db_ingredient:
                raise HTTPException(status_code=404, detail=f"Ingredient with id {ingredient_id} not found")
            
            meal_ingredient = MealIngredient(
                meal_id=db_meal.id,
                ingredient_id=ingredient_id,
                quantity=quantity
            )
            db.add(meal_ingredient)
    
    db.commit()
    db.refresh(db_meal)
    
    # Prepare response with ingredients
    ingredients = []
    for mi in db_meal.meal_ingredients:
        ingredient = db.query(Ingredient).filter(Ingredient.id == mi.ingredient_id).first()
        ingredients.append({
            "id": mi.id,
            "ingredient_id": mi.ingredient_id,
            "ingredient_name": ingredient.name,
            "quantity": mi.quantity,
            "unit": ingredient.unit
        })
    
    # Notify via WebSocket
    await manager.broadcast(json.dumps({
        "type": "meal_updated",
        "data": {
            "id": db_meal.id,
            "name": db_meal.name,
            "description": db_meal.description,
            "image_url": db_meal.image_url
        }
    }))
    
    response_meal = {
        "id": db_meal.id,
        "name": db_meal.name,
        "description": db_meal.description,
        "image_url": db_meal.image_url,
        "created_at": db_meal.created_at,
        "updated_at": db_meal.updated_at,
        "ingredients": ingredients
    }
    
    return response_meal

@app.delete("/meals/{meal_id}", response_model=MealResponse)
async def delete_meal(meal_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.ADMIN, UserRole.COOK]:
        raise HTTPException(status_code=403, detail="Not authorized to delete meals")
    
    db_meal = db.query(Meal).filter(Meal.id == meal_id).first()
    if not db_meal:
        raise HTTPException(status_code=404, detail="Meal not found")
    
    # Prepare response with ingredients before deletion
    ingredients = []
    for mi in db_meal.meal_ingredients:
        ingredient = db.query(Ingredient).filter(Ingredient.id == mi.ingredient_id).first()
        ingredients.append({
            "id": mi.id,
            "ingredient_id": mi.ingredient_id,
            "ingredient_name": ingredient.name,
            "quantity": mi.quantity,
            "unit": ingredient.unit
        })
    
    response_meal = {
        "id": db_meal.id,
        "name": db_meal.name,
        "description": db_meal.description,
        "image_url": db_meal.image_url,
        "created_at": db_meal.created_at,
        "updated_at": db_meal.updated_at,
        "ingredients": ingredients
    }
    
    # Delete meal ingredients first
    db.query(MealIngredient).filter(MealIngredient.meal_id == meal_id).delete()
    
    # Delete meal
    db.delete(db_meal)
    db.commit()
    
    # Notify via WebSocket
    await manager.broadcast(json.dumps({
        "type": "meal_deleted",
        "data": {
            "id": meal_id
        }
    }))
    
    return response_meal

# Meal Serving Routes
@app.post("/meal-servings/", response_model=MealServingResponse)
async def create_meal_serving(serving: MealServingCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.ADMIN, UserRole.COOK]:
        raise HTTPException(status_code=403, detail="Not authorized to create meal servings")
    
    db_meal = db.query(Meal).filter(Meal.id == serving.meal_id).first()
    if not db_meal:
        raise HTTPException(status_code=404, detail="Meal not found")
    
    # Check if we have enough ingredients
    for meal_ingredient in db_meal.meal_ingredients:
        ingredient = db.query(Ingredient).filter(Ingredient.id == meal_ingredient.ingredient_id).first()
        required_quantity = meal_ingredient.quantity * serving.portions
        
        if ingredient.quantity < required_quantity:
            raise HTTPException(
                status_code=400, 
                detail=f"Not enough {ingredient.name} in stock. Need {required_quantity} {ingredient.unit}, but have {ingredient.quantity} {ingredient.unit}"
            )
    
    # Deduct ingredients from inventory
    for meal_ingredient in db_meal.meal_ingredients:
        ingredient = db.query(Ingredient).filter(Ingredient.id == meal_ingredient.ingredient_id).first()
        required_quantity = meal_ingredient.quantity * serving.portions
        
        ingredient.quantity -= required_quantity
        if ingredient.quantity <= 0:
            ingredient.status = IngredientStatus.OUT_OF_STOCK
        elif ingredient.quantity <= ingredient.threshold:
            ingredient.status = IngredientStatus.LOW
    
    # Create meal serving
    db_serving = MealServing(
        meal_id=serving.meal_id,
        portions=serving.portions,
        serving_date=serving.serving_date or datetime.utcnow(),
        user_id=current_user.id
    )
    db.add(db_serving)
    db.commit()
    db.refresh(db_serving)
    
    # Notify via WebSocket
    await manager.broadcast(json.dumps({
        "type": "meal_served",
        "data": {
            "id": db_serving.id,
            "meal_id": db_serving.meal_id,
            "meal_name": db_meal.name,
            "portions": db_serving.portions,
            "serving_date": db_serving.serving_date.isoformat()
        }
    }))
    
    response_serving = {
        "id": db_serving.id,
        "meal_id": db_serving.meal_id,
        "portions": db_serving.portions,
        "serving_date": db_serving.serving_date,
        "created_at": db_serving.created_at,
        "updated_at": db_serving.updated_at,
        "user_id": db_serving.user_id,
        "meal_name": db_meal.name
    }
    
    return response_serving

@app.get("/meal-servings/", response_model=List[MealServingResponse])
async def read_meal_servings(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    servings = db.query(MealServing).offset(skip).limit(limit).all()
    
    response_servings = []
    for serving in servings:
        meal = db.query(Meal).filter(Meal.id == serving.meal_id).first()
        response_serving = {
            "id": serving.id,
            "meal_id": serving.meal_id,
            "portions": serving.portions,
            "serving_date": serving.serving_date,
            "created_at": serving.created_at,
            "updated_at": serving.updated_at,
            "user_id": serving.user_id,
            "meal_name": meal.name
        }
        response_servings.append(response_serving)
    
    return response_servings

# Order Routes
@app.post("/orders/", response_model=OrderResponse)
async def create_order(order: OrderCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(status_code=403, detail="Not authorized to create orders")
    
    db_ingredient = db.query(Ingredient).filter(Ingredient.id == order.ingredient_id).first()
    if not db_ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    
    db_order = Order(
        ingredient_id=order.ingredient_id,
        quantity=order.quantity,
        status=OrderStatus.PENDING,
        created_by=current_user.id
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    
    # Notify via WebSocket
    await manager.broadcast(json.dumps({
        "type": "order_created",
        "data": {
            "id": db_order.id,
            "ingredient_id": db_order.ingredient_id,
            "ingredient_name": db_ingredient.name,
            "quantity": db_order.quantity,
            "status": db_order.status
        }
    }))
    
    response_order = {
        "id": db_order.id,
        "ingredient_id": db_order.ingredient_id,
        "quantity": db_order.quantity,
        "status": db_order.status,
        "created_at": db_order.created_at,
        "updated_at": db_order.updated_at,
        "created_by": db_order.created_by,
        "ingredient_name": db_ingredient.name
    }
    
    return response_order

@app.get("/orders/", response_model=List[OrderResponse])
async def read_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    orders = db.query(Order).offset(skip).limit(limit).all()
    
    response_orders = []
    for order in orders:
        ingredient = db.query(Ingredient).filter(Ingredient.id == order.ingredient_id).first()
        response_order = {
            "id": order.id,
            "ingredient_id": order.ingredient_id,
            "quantity": order.quantity,
            "status": order.status,
            "created_at": order.created_at,
            "updated_at": order.updated_at,
            "created_by": order.created_by,
            "ingredient_name": ingredient.name
        }
        response_orders.append(response_order)
    
    return response_orders

@app.put("/orders/{order_id}", response_model=OrderResponse)
async def update_order(order_id: int, order: OrderUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(status_code=403, detail="Not authorized to update orders")
    
    db_order = db.query(Order).filter(Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    db_ingredient = db.query(Ingredient).filter(Ingredient.id == db_order.ingredient_id).first()
    
    # Update order status
    db_order.status = order.status
    
    # If order is delivered, update ingredient quantity
    if order.status == OrderStatus.DELIVERED:
        db_ingredient.quantity += db_order.quantity
        if db_ingredient.quantity <= 0:
            db_ingredient.status = IngredientStatus.OUT_OF_STOCK
        elif db_ingredient.quantity <= db_ingredient.threshold:
            db_ingredient.status = IngredientStatus.LOW
        else:
            db_ingredient.status = IngredientStatus.AVAILABLE
    
    db.commit()
    db.refresh(db_order)
    
    # Notify via WebSocket
    await manager.broadcast(json.dumps({
        "type": "order_updated",
        "data": {
            "id": db_order.id,
            "ingredient_id": db_order.ingredient_id,
            "ingredient_name": db_ingredient.name,
            "quantity": db_order.quantity,
            "status": db_order.status
        }
    }))
    
    response_order = {
        "id": db_order.id,
        "ingredient_id": db_order.ingredient_id,
        "quantity": db_order.quantity,
        "status": db_order.status,
        "created_at": db_order.created_at,
        "updated_at": db_order.updated_at,
        "created_by": db_order.created_by,
        "ingredient_name": db_ingredient.name
    }
    
    return response_order

# Notification Routes
@app.post("/notifications/", response_model=NotificationResponse)
async def create_notification(notification: NotificationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to create notifications")
    
    db_notification = Notification(
        user_id=notification.user_id,
        message=notification.message
    )
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    
    # Notify via WebSocket
    await manager.broadcast(json.dumps({
        "type": "notification_created",
        "data": {
            "id": db_notification.id,
            "user_id": db_notification.user_id,
            "message": db_notification.message,
            "is_read": db_notification.is_read
        }
    }))
    
    return db_notification

@app.get("/notifications/", response_model=List[NotificationResponse])
async def read_notifications(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    notifications = db.query(Notification).filter(Notification.user_id == current_user.id).offset(skip).limit(limit).all()
    return notifications

@app.put("/notifications/{notification_id}", response_model=NotificationResponse)
async def update_notification(notification_id: int, notification: NotificationUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not db_notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    if db_notification.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this notification")
    
    db_notification.is_read = notification.is_read
    db.commit()
    db.refresh(db_notification)
    return db_notification

# Report Routes
@app.post("/reports/", response_model=ReportResponse)
async def create_report(report: ReportCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(status_code=403, detail="Not authorized to create reports")
    
    db_report = Report(
        title=report.title,
        content=report.content,
        report_type=report.report_type
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report

@app.get("/reports/", response_model=List[ReportResponse])
async def read_reports(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(status_code=403, detail="Not authorized to view reports")
    
    reports = db.query(Report).offset(skip).limit(limit).all()
    return reports

# WebSocket Route
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Process the received data
            try:
                message_data = json.loads(data)
                # You can add custom processing here
                
                # Broadcast the message to all connected clients
                await manager.broadcast(data)
            except json.JSONDecodeError:
                # If not valid JSON, just broadcast as is
                await manager.broadcast(data)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast(json.dumps({
            "type": "connection_update",
            "message": "A client has disconnected",
            "timestamp": datetime.utcnow().isoformat()
        }))

# Celery Tasks
@celery_app.task
def generate_monthly_report():
    db = SessionLocal()
    try:
        # Get data for the previous month
        now = datetime.utcnow()
        first_day_of_month = datetime(now.year, now.month, 1)
        last_month = first_day_of_month - timedelta(days=1)
        first_day_of_last_month = datetime(last_month.year, last_month.month, 1)
        
        # Get meal servings for the previous month
        meal_servings = db.query(MealServing).filter(
            MealServing.serving_date >= first_day_of_last_month,
            MealServing.serving_date < first_day_of_month
        ).all()
        
        # Calculate total portions served
        total_portions = sum(serving.portions for serving in meal_servings)
        
        # Get most popular meals
        meal_counts = {}
        for serving in meal_servings:
            meal = db.query(Meal).filter(Meal.id == serving.meal_id).first()
            if meal.name in meal_counts:
                meal_counts[meal.name] += serving.portions
            else:
                meal_counts[meal.name] = serving.portions
        
        sorted_meals = sorted(meal_counts.items(), key=lambda x: x[1], reverse=True)
        most_popular_meals = sorted_meals[:5]
        
        # Calculate ingredient usage
        ingredient_usage = {}
        for serving in meal_servings:
            meal = db.query(Meal).filter(Meal.id == serving.meal_id).first()
            for meal_ingredient in meal.meal_ingredients:
                ingredient = db.query(Ingredient).filter(Ingredient.id == meal_ingredient.ingredient_id).first()
                used_quantity = meal_ingredient.quantity * serving.portions
                
                if ingredient.name in ingredient_usage:
                    ingredient_usage[ingredient.name] += used_quantity
                else:
                    ingredient_usage[ingredient.name] = used_quantity
        
        # Generate report content
        month_name = first_day_of_last_month.strftime("%B %Y")
        report_title = f"Monthly Report - {month_name}"
        
        report_content = {
            "month": month_name,
            "total_portions": total_portions,
            "most_popular_meals": most_popular_meals,
            "ingredient_usage": ingredient_usage
        }
        
        # Save report to database
        db_report = Report(
            title=report_title,
            content=json.dumps(report_content),
            report_type="monthly"
        )
        db.add(db_report)
        db.commit()
        
        return {"status": "success", "report_id": db_report.id}
    
    except Exception as e:
        return {"status": "error", "message": str(e)}
    
    finally:
        db.close()

@celery_app.task
def check_low_stock_ingredients():
    db = SessionLocal()
    try:
        # Get all ingredients with low or out of stock status
        low_stock_ingredients = db.query(Ingredient).filter(
            Ingredient.status.in_([IngredientStatus.LOW, IngredientStatus.OUT_OF_STOCK])
        ).all()
        
        # Create notifications for managers
        managers = db.query(User).filter(User.role.in_([UserRole.MANAGER, UserRole.ADMIN])).all()
        
        for ingredient in low_stock_ingredients:
            for manager in managers:
                # Check if notification already exists
                existing_notification = db.query(Notification).filter(
                    Notification.user_id == manager.id,
                    Notification.message.like(f"%{ingredient.name}%"),
                    Notification.is_read == False
                ).first()
                
                if not existing_notification:
                    status_text = "low" if ingredient.status == IngredientStatus.LOW else "out of stock"
                    message = f"{ingredient.name} is {status_text}. Current quantity: {ingredient.quantity} {ingredient.unit}"
                    
                    db_notification = Notification(
                        user_id=manager.id,
                        message=message
                    )
                    db.add(db_notification)
        
        db.commit()
        
        return {"status": "success", "low_stock_count": len(low_stock_ingredients)}
    
    except Exception as e:
        return {"status": "error", "message": str(e)}
    
    finally:
        db.close()

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Welcome to the Kindergarten Meal Tracking & Inventory Management System API"}

# Include routers
from .database import engine, Base
from .models.models import *
from .routers import auth, users, ingredients, notifications
from .websocket import manager

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(ingredients.router)
app.include_router(notifications.router)

# Main entry point
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
