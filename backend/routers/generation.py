from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from pydantic import BaseModel
from ..database import get_session
from ..auth import get_current_user
from ..models import User, DocumentSection, Project
from ..services.llm_service import generate_outline, generate_section_content

router = APIRouter(prefix="/generation", tags=["generation"])

class SuggestRequest(BaseModel):
    topic: str
    document_type: str

class SuggestResponse(BaseModel):
    outline: list[str]

class RefineRequest(BaseModel):
    prompt: str

@router.post("/suggest-outline", response_model=SuggestResponse)
def suggest_outline(request: SuggestRequest, current_user: User = Depends(get_current_user)):
    outline = generate_outline(request.topic, request.document_type)
    return {"outline": outline}

@router.post("/section/{section_id}")
def generate_section(section_id: int, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    section = session.get(DocumentSection, section_id)
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    project = session.get(Project, section.project_id)
    if project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Generate content
    content = generate_section_content(project.title, section.title, project.document_type)
    
    # Update section
    section.content = content
    session.add(section)
    session.commit()
    session.refresh(section)
    
    return {"content": content}

@router.post("/refine/{section_id}")
def refine_section(section_id: int, request: RefineRequest, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    section = session.get(DocumentSection, section_id)
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    project = session.get(Project, section.project_id)
    if project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # For now, we'll just append the refinement prompt to the generation call or use a specific refine prompt
    # In a real app, we'd send the existing content + prompt
    # Let's mock a refinement for now or use the same generator with context
    
    # Simple mock refinement for demonstration if no LLM key
    refined_content = f"{section.content}\n\n[Refined with: {request.prompt}]"
    
    # If we had the LLM service fully wired for refinement:
    # refined_content = refine_content(section.content, request.prompt)
    
    section.content = refined_content
    session.add(section)
    session.commit()
    session.refresh(section)
    
    return {"content": refined_content}
