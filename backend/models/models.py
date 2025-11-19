from pydantic import BaseModel, EmailStr, Field


class User(BaseModel):
    firstname: str
    lastname: str
    email: EmailStr
    password: str = Field(..., max_length=72)


class LoginUser(BaseModel):
    email: EmailStr
    password: str