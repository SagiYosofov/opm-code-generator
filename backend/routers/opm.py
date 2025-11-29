import time
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import os

router = APIRouter(
    prefix="/opm",
    tags=["OPM Code Generator"]
)

# Allowed formats
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"} # set
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

def validate_extension(filename: str):
    ext = os.path.splitext(filename)[1].lower()
    return ext in ALLOWED_EXTENSIONS


@router.post("/generate-code")
async def generate_code(
    file: UploadFile = File(...),
    language: str = Form(...)
):
    """
    Receives an image file of an OPM diagram + selected language.
    Generates code (placeholder in this example) and returns ZIP file.
    """

    # -------- VALIDATE FILE FORMAT --------
    if not validate_extension(file.filename):
        raise HTTPException(
            status_code=400,
            detail="Invalid file format. Allowed: JPG, JPEG, PNG"
        )

    # -------- VALIDATE FILE SIZE --------
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds 5MB. Your file is {(len(contents)/1024/1024):.2f}MB."
        )

    # Reset file pointer (important)
    await file.seek(0)

    # Simulated processing
    time.sleep(5)

    # -------- RETURN TO FRONTEND --------
    return {"message": "Code generated successfully!"}


