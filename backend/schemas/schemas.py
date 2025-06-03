from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

# User Schemas
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

# Ingredient Schemas
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

# Meal Schemas
class MealIngredientCreate(BaseModel):
    ingredientId: int
    name: str
    quantity: float
    unit: str

class MealCreate(BaseModel):
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    ingredients: List[MealIngredientCreate]

class MealIngredientResponse(BaseModel):
    id: int
    ingredient_id: int
    ingredient_name: str
    quantity: float
    unit: str

    class Config:
        orm_mode = True

class MealResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    image_url: Optional[str]
    ingredients: List[MealIngredientResponse]
    created_at: datetime
    updated_at: datetime

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

# Order Schemas
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

# Notification Schemas
class NotificationBase(BaseModel):
    message: str
    notification_type: str = "system"

class NotificationCreate(NotificationBase):
    user_id: Optional[int] = None

class NotificationResponse(NotificationBase):
    id: int
    user_id: Optional[int]
    is_read: bool
    created_at: datetime
    updated_at: Optional[datetime]
    created_by: Optional[int]

    class Config:
        orm_mode = True

class NotificationUpdate(BaseModel):
    is_read: Optional[bool] = None

# Report Schemas
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
