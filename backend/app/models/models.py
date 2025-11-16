from pydantic import BaseModel, EmailStr


class User(BaseModel):
    firstname: str
    lastname: str
    email: EmailStr
    password: str