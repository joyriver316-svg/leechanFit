
from pydantic import BaseModel
from typing import Optional
from datetime import date as date_type

class ProductBase(BaseModel):
    name: str
    regMonths: int
    price: int
    durationUnit: Optional[str] = 'months'
    description: Optional[str] = None
    active: Optional[bool] = True

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    created_at: Optional[date_type] = None

class UserBase(BaseModel):
    id: Optional[str] = None
    name: str
    gender: Optional[str] = None
    phone: Optional[str] = None
    productId: int
    regDate: Optional[date_type] = None
    startDate: Optional[date_type] = None
    endDate: Optional[date_type] = None
    remaining: Optional[int] = 0

class UserCreate(UserBase):
    pass

class UserUpdate(UserBase):
    pass

class CoachBase(BaseModel):
    id: str
    name: str
    phone: Optional[str] = None
    status: Optional[str] = None
    specialty: Optional[str] = None

class AttendanceBase(BaseModel):
    userId: str
    date: date_type
    time: str
    status: Optional[str] = "Present"

class AttendanceCreate(AttendanceBase):
    pass
