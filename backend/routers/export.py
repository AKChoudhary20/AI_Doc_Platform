from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlmodel import Session, select
from ..database import get_session
from ..auth import get_current_user
from ..models import User, Project, DocumentSection
from ..services.doc_service import create_docx, create_pptx

router = APIRouter(prefix="/export", tags=["export"])

@router.get("/{project_id}")
def export_document(project_id: int, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    # Fetch project
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Fetch sections
    statement = select(DocumentSection).where(DocumentSection.project_id == project_id).order_by(DocumentSection.order_index)
    sections = session.exec(statement).all()
    
    if project.document_type == 'docx':
        buffer = create_docx(project.title, sections)
        filename = f"{project.title.replace(' ', '_')}.docx"
        media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    elif project.document_type == 'pptx':
        buffer = create_pptx(project.title, sections)
        filename = f"{project.title.replace(' ', '_')}.pptx"
        media_type = "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    else:
        raise HTTPException(status_code=400, detail="Invalid document type")
    
    return StreamingResponse(
        buffer, 
        media_type=media_type, 
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
