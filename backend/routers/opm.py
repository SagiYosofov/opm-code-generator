from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import os
from fastapi.responses import JSONResponse
from ai.gemini_agent import GeminiOPMAgent  # adjust import path

router = APIRouter(
    prefix="/opm",
    tags=["OPM Code Generator"]
)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
ALLOWED_LANGUAGES = ["python", "java", "csharp", "cpp"]



def validate_extension(filename: str):
    ext = os.path.splitext(filename)[1].lower()
    return ext in ALLOWED_EXTENSIONS


# Initialize Gemini agent once at startup
ai_agent = GeminiOPMAgent()


@router.post("/generate-code")
async def generate_code(
    file: UploadFile = File(...),
    target_language: str = Form(...)
):
    """
    Receives an image file of an OPM diagram + target language.
    Generates code using Gemini and returns JSON.
    """
    # -------- VALIDATE LANGUAGE --------
    if target_language not in ALLOWED_LANGUAGES:
        raise HTTPException(status_code=400, detail=f"Unsupported language: {target_language}")

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

    # -------- GENERATE CODE VIA GEMINI --------
    try:
        # CALL GEMINI
        result_json = ai_agent.generate_code_from_diagram(
            diagram_bytes=contents,
            filename=file.filename,
            language=target_language
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate code: {str(e)}"
        )

    return JSONResponse(content=result_json)

    # generate opm code from the image and the selected language

    # save the diagram and the generated code for this specific user in db.

    # return a file that contains the code / send the json and in the frontend we will create the file.

    # if the language is python the extension of the file should be .py and so on

