from pydantic import BaseModel


class User(BaseModel):
    firstname: str
    lastname: str
    email: EmailStr
    password: str