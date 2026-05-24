from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.schema_note import NoteCreate, NoteUpdate, NoteResponse
from app.services.srv_note import NoteService

router = APIRouter(prefix="/notes", tags=["Notes"])

@router.get("/", response_model=List[NoteResponse])
def get_notes(tag: str = Query(None), db: Session = Depends(get_db)):
    if tag:
        return NoteService.filter_by_tag(db, tag)
    return NoteService.get_active_notes(db)

@router.get("/archived", response_model=List[NoteResponse])
def get_archived_notes(db: Session = Depends(get_db)):
    return NoteService.get_archived_notes(db)

@router.post("/", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def create_note(note_data: NoteCreate, db: Session = Depends(get_db)):
    return NoteService.create_note(db, note_data)

@router.put("/{note_id}", response_model=NoteResponse)
def update_note(note_id: int, update_data: NoteUpdate, db: Session = Depends(get_db)):
    return NoteService.update_note(db, note_id, update_data)

@router.delete("/{note_id}", status_code=status.HTTP_200_OK)
def delete_note(note_id: int, db: Session = Depends(get_db)):
    return NoteService.delete_note(db, note_id)

@router.post("/{note_id}/tags/{tag_name}", response_model=NoteResponse)
def add_tag_to_note(note_id: int, tag_name: str, db: Session = Depends(get_db)):
    return NoteService.add_tag(db, note_id, tag_name)

@router.delete("/{note_id}/tags/{tag_name}", response_model=NoteResponse)
def remove_tag_from_note(note_id: int, tag_name: str, db: Session = Depends(get_db)):
    return NoteService.remove_tag(db, note_id, tag_name)