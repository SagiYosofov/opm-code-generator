from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import os
from fastapi.responses import JSONResponse
from ai.gemini_agent import GeminiOPMAgent

router = APIRouter(
    prefix="/opm",
    tags=["OPM Code Generator"]
)


ALLOWED_EXTENSIONS = {".pdf"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_LANGUAGES = ["python", "java", "csharp", "cpp"]


def validate_file(filename: str, size: int):
    """Utility to validate both extension and file size."""
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


# Initialize Gemini agent once at startup
ai_agent = GeminiOPMAgent()


@router.post("/generate-code")
async def generate_code(
    file: UploadFile = File(...),
    target_language: str = Form(...),
    user_email: str = Form(...)
):
    """
    Receives an OPM model (PDF or image) + target language.
    Generates code using Gemini and returns JSON.

     Response:
    {
        "status": "valid" | "invalid",
        "explanation": "human-readable explanation",
        "code": "generated code" (only if status is valid),
        "filename": "output_filename.ext" (only if status is valid)
    }
    """
    # -------- VALIDATE LANGUAGE --------
    if target_language not in ALLOWED_LANGUAGES:
        raise HTTPException(status_code=400, detail=f"Unsupported language: {target_language}")

    # -------- VALIDATE FILE --------
    contents = await file.read()
    validate_file(file.filename, len(contents))

    # -------- GENERATE CODE VIA GEMINI --------
    try:
        # CALL GEMINI
        ai_result: dict = ai_agent.generate_code_from_diagram(
            pdf_bytes=contents,
            filename=file.filename,
            language=target_language
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate code: {str(e)}"
        )

    return JSONResponse(content=ai_result)


@router.post("/refine-code")
async def refine_code(
        file: UploadFile = File(...),
        target_language: str = Form(...),
        previous_code: str = Form(...),
        fix_instructions: str = Form(...)
):
    """
    Receives an OPM diagram, previously generated code, and fix instructions.
    Refines the code using Gemini and returns JSON.

    Response:
    {
        "status": "valid" | "invalid",
        "explanation": "human-readable explanation",
        "code": "refined code" (only if status is valid),
        "filename": "output_filename.ext" (only if status is valid)
    }
    """
    # -------- VALIDATE LANGUAGE --------
    if target_language not in ALLOWED_LANGUAGES:
        raise HTTPException(status_code=400, detail=f"Unsupported language: {target_language}")

    # -------- VALIDATE FILE --------
    contents = await file.read()
    validate_file(file.filename, len(contents))

    # -------- VALIDATE INPUT --------
    if not previous_code.strip():
        raise HTTPException(status_code=400, detail="Previous code is required")

    if not fix_instructions.strip():
        raise HTTPException(status_code=400, detail="Fix instructions are required")

    # -------- REFINE CODE VIA GEMINI --------
    try:
        ai_result: dict = ai_agent.refine_generated_code(
            pdf_bytes=contents,
            filename=file.filename,
            language=target_language,
            previous_code=previous_code,
            fix_instructions=fix_instructions
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to refine code: {str(e)}"
        )

    return JSONResponse(content=ai_result)
