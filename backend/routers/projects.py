from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from ..database import get_session
from ..models import Project, User, DocumentSection
from ..auth import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/projects", tags=["projects"])

class ProjectCreate(BaseModel):
    title: str
    document_type: str # "docx" or "pptx"
    topic: str # Optional, for AI generation context

class ProjectRead(BaseModel):
    id: int
    title: str
    document_type: str
    created_at: str

@router.post("/", response_model=Project)
def create_project(project_in: ProjectCreate, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    project = Project(title=project_in.title, document_type=project_in.document_type, user_id=current_user.id)
    session.add(project)
    session.commit()
    session.refresh(project)
    return project

@router.get("/", response_model=List[Project])
def read_projects(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    statement = select(Project).where(Project.user_id == current_user.id)
    projects = session.exec(statement).all()
    return projects

@router.get("/{project_id}", response_model=Project)
def read_project(project_id: int, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    statement = select(Project).where(Project.id == project_id, Project.user_id == current_user.id)
    project = session.exec(statement).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

class SectionCreate(BaseModel):
    title: str
    order_index: int

class BulkSectionsRequest(BaseModel):
    sections: List[SectionCreate]

@router.post("/{project_id}/sections/bulk")
def create_bulk_sections(project_id: int, request: BulkSectionsRequest, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    # Verify project ownership
    statement = select(Project).where(Project.id == project_id, Project.user_id == current_user.id)
    project = session.exec(statement).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Create sections
    for section_in in request.sections:
        section = DocumentSection(
            project_id=project_id,
            title=section_in.title,
            order_index=section_in.order_index
        )
        session.add(section)
    
    session.commit()
    return {"message": "Sections created successfully"}

@router.get("/{project_id}/sections", response_model=List[DocumentSection])
def read_sections(project_id: int, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    statement = select(DocumentSection).where(DocumentSection.project_id == project_id).order_by(DocumentSection.order_index)
    sections = session.exec(statement).all()
    return sections
