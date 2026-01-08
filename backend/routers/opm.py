from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import os
from fastapi.responses import JSONResponse
from ai.gemini_agent import GeminiOPMAgent
from db.database import opm_generations_collection
import uuid
from bson import Binary
from datetime import datetime, timezone


router = APIRouter(
    prefix="/opm",
    tags=["OPM Code Generator"]
)


# CONSTANTS
ALLOWED_EXTENSIONS = {".pdf"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
language_to_filename: dict = {
        "python": "main.py",
        "java": "Main.java",
        "csharp": "Program.cs",
        "cpp": "main.cpp"
    }


# HELPER FUNCTIONS
def validate_file(filename: str, size: int):
    """
    Validates uploaded file.

    Checks:
        - File extension (must be in ALLOWED_EXTENSIONS)
        - File size (must not exceed MAX_FILE_SIZE)

    Raises:
        HTTPException: If file is invalid
    """
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file format. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    if size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds {(MAX_FILE_SIZE / 1024 / 1024)}MB limit."
        )


def validate_language(language: str):
    if language not in language_to_filename:
        raise HTTPException(status_code=400, detail=f"Unsupported language: {language}")


# Initialize Gemini agent once at startup
ai_agent = GeminiOPMAgent()


@router.post("/generate-code")
async def generate_code(
    file: UploadFile = File(...),
    target_language: str = Form(...),
    user_email: str = Form(...)
):
    """
    Generate code from an OPM model (PDF) using Gemini AI.

    :param file: PDF file containing the OPM diagram/s
    :param target_language: Programming language for generated code (python/java/csharp/cpp)
    :param user_email: Email of the user submitting the request
    :return:
    JSON response with:
    {
        "status": "valid" | "invalid",
        "explanation": human-readable explanation,
        "code": generated code (only if status is valid),
        "filename": "output_filename (according to target_language),
        "generation_id": unique ID of this generation (only if status is valid)
    }
    """
    # -------- VALIDATE LANGUAGE --------
    validate_language(target_language)

    output_filename = language_to_filename[target_language]

    # -------- READ AND VALIDATE FILE --------
    contents = await file.read()
    validate_file(file.filename, len(contents))

    # -------- GENERATE CODE VIA AI --------
    try:
        # CALL GEMINI
        ai_result: dict = ai_agent.generate_code_from_diagram(
            pdf_bytes=contents,
            target_language=target_language
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate code: {str(e)}"
        )

    ai_result["filename"] = output_filename

    # -------- SAVE TO DATABASE IF VALID --------
    if ai_result.get("status") == "valid":
        generation_id = str(uuid.uuid4())
        current_time = datetime.now(timezone.utc)

        document = {
            "generation_id": generation_id,
            "user_email": user_email,
            "pdf_filename": file.filename,
            "pdf_file": Binary(contents), # convert bytes to MongoDB Binary
            "target_language": target_language,
            "output_filename": output_filename,
            "ai_generated_code": ai_result.get("code"),
            "ai_explanation": ai_result.get("explanation"),
            "created_at": current_time,
            "updated_at": current_time
        }

        opm_generations_collection.insert_one(document)

        # Return generation_id to frontend
        ai_result["generation_id"] = generation_id

    return JSONResponse(content=ai_result)


@router.post("/refine-code")
async def refine_code(
        generation_id: str = Form(...),
        file: UploadFile = File(...),
        target_language: str = Form(...),
        previous_code: str = Form(...),
        fix_instructions: str = Form(...)
):
    """
    Refine previously generated code using a new OPM diagram and fix instructions.

    :param generation_id: Unique ID of the previous generation
    :param file: PDF file containing the OPM diagram/s
    :param target_language: Programming language for generated code (python/java/csharp/cpp)
    :param previous_code: The code generated previously
    :param fix_instructions: Instructions to improve/fix the previous code
    :return:
    JSON response with:
    {
        "status": "valid" | "invalid",
        "explanation": "human-readable explanation",
        "code": "refined code" (only if status is valid)
    }

    Notes:
    - Updates the existing document in MongoDB instead of creating a new one.
    - Returns 404 if generation_id is not found.
    """
    # -------- VALIDATE LANGUAGE --------
    validate_language(target_language)

    # -------- READ AND VALIDATE FILE --------
    contents = await file.read()
    validate_file(file.filename, len(contents))

    # -------- VALIDATE INPUT --------
    if not previous_code.strip():
        raise HTTPException(status_code=400, detail="Previous code is required")

    if not fix_instructions.strip():
        raise HTTPException(status_code=400, detail="Fix instructions are required")

    # -------- REFINE CODE VIA AI --------
    try:
        ai_result: dict = ai_agent.refine_generated_code(
            pdf_bytes=contents,
            target_language=target_language,
            previous_code=previous_code,
            fix_instructions=fix_instructions
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to refine code: {str(e)}"
        )

    # -------- UPDATE DATABASE IF VALID --------
    if ai_result.get("status") == "valid":
        update_result = opm_generations_collection.update_one(
            {"generation_id": generation_id},
            {
                "$set": {
                    "ai_generated_code": ai_result.get("code"),
                    "ai_explanation": ai_result.get("explanation"),
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )

        if update_result.matched_count == 0:
            raise HTTPException(
                status_code=404,
                detail="OPM Generation not found, there is nothing to update in the database"
            )

    return JSONResponse(content=ai_result)
