from fastapi import APIRouter, HTTPException
from passlib.hash import bcrypt
from backend.db.database import users_collection
from backend.models.models import User

router = APIRouter(
    prefix="/auth",   # all routes here will start with /auth
    tags=["Auth"]
)

@router.post("/signup")
def signup_user(data: User):
    # Check if email exists
    if users_collection.find_one({"email": data.email}):
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = bcrypt.hash(data.password)

    new_user = {
        "firstname": data.firstname,
        "lastname": data.lastname,
        "email": data.email,
        "password": hashed_password
    }

    users_collection.insert_one(new_user)

    return {"message": "Signup successful!"}
