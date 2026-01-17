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


@router.get("/{generation_id}/pdf")
async def get_pdf_by_id(generation_id: str):
    """
    Get the PDF diagram of a specific project.

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
