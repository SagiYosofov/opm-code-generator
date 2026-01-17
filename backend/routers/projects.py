from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
from db.database import opm_generations_collection
import io

router = APIRouter(
    prefix="/projects",
    tags=["User Projects"]
)

@router.get("/")
async def get_user_projects(user_email: str):
    """
    Get all OPM generations for a specific user.

    :param user_email: Email of the user (identifier)
    :return: List of projects (without the binary PDF data for performance)
    """
    try:
        projects = list(opm_generations_collection.find(
            {"user_email": user_email},
            {
                "_id": 0,
                "pdf_file": 0  # Exclude binary data for list view
            }
        ).sort("created_at", -1))  # Most recent first

        return projects
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch projects: {str(e)}"
        )


@router.get("/{generation_id}")
async def get_project_by_id(generation_id: str):
    """
    Get a specific project by generation_id (without binary PDF).

    :param generation_id: Unique ID of the generation
    :return: Project details
    """
    project = opm_generations_collection.find_one(
        {"generation_id": generation_id},
        {"_id": 0, "pdf_file": 0} # Exclude MongoDB id and binary data of pdf file
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    return project


@router.get("/{generation_id}/pdf")
async def download_pdf(generation_id: str):
    """
    Download the PDF diagram for a specific project.

    :param generation_id: Unique ID of the generation
    :return: PDF file as streaming response
    """
    project = opm_generations_collection.find_one(
        {"generation_id": generation_id},
        {"pdf_file": 1, "pdf_filename": 1}
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    if "pdf_file" not in project:
        raise HTTPException(
            status_code=404,
            detail="PDF file not found for this project"
        )

    pdf_bytes = bytes(project["pdf_file"])

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{project["pdf_filename"]}"'
        }
    )


@router.delete("/{generation_id}")
async def delete_project(generation_id: str, user_email: str):
    """
    Delete a specific project.

    :param generation_id: Unique ID of the generation
    :param user_email: Email of the user (for authorization)
    :return: Deletion confirmation
    """
    # First, verify the project belongs to the user
    project = opm_generations_collection.find_one(
        {"generation_id": generation_id},
        {"user_email": 1}
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    if project["user_email"] != user_email:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to delete this project"
        )

    # Delete the project
    result = opm_generations_collection.delete_one({"generation_id": generation_id})

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=500,
            detail="Failed to delete project"
        )

    return JSONResponse(content={
        "message": "Project deleted successfully",
        "generation_id": generation_id
    })


@router.get("/{generation_id}/stats")
async def get_project_stats(generation_id: str):
    """
    Get statistics for a specific project.

    :param generation_id: Unique ID of the generation
    :return: Project statistics (code lines, file size, etc.)
    """
    project = opm_generations_collection.find_one(
        {"generation_id": generation_id},
        {
            "_id": 0,
            "ai_generated_code": 1,
            "pdf_file": 1,
            "target_language": 1,
            "created_at": 1,
            "updated_at": 1
        }
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    # Calculate statistics
    code = project.get("ai_generated_code", "")
    pdf_bytes = project.get("pdf_file", b"")

    stats = {
        "generation_id": generation_id,
        "target_language": project.get("target_language"),
        "code_lines": len(code.split('\n')) if code else 0,
        "code_characters": len(code) if code else 0,
        "code_size_kb": round(len(code.encode('utf-8')) / 1024, 2) if code else 0,
        "pdf_size_kb": round(len(bytes(pdf_bytes)) / 1024, 2) if pdf_bytes else 0,
        "created_at": project.get("created_at"),
        "updated_at": project.get("updated_at"),
        "has_been_refined": project.get("created_at") != project.get("updated_at")
    }

    return stats