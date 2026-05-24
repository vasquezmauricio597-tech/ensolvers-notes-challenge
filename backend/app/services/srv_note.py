from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.repo_note import NoteRepository
from app.schemas.schema_note import NoteCreate, NoteUpdate

class NoteService:

    @staticmethod
    def get_active_notes(db: Session):
        return NoteRepository.get_all_active(db)

    @staticmethod
    def get_archived_notes(db: Session):
        return NoteRepository.get_all_archived(db)

    @staticmethod
    def create_note(db: Session, note_data: NoteCreate):
        if not note_data.title.strip():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El título no puede estar vacío")
        return NoteRepository.create(db, note_data)

    @staticmethod
    def update_note(db: Session, note_id: int, update_data: NoteUpdate):
        db_note = NoteRepository.get_by_id(db, note_id)
        if not db_note:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No se encontró la nota con ID {note_id}")
        return NoteRepository.update(db, db_note, update_data)

    @staticmethod
    def delete_note(db: Session, note_id: int):
        db_note = NoteRepository.get_by_id(db, note_id)
        if not db_note:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No se encontró la nota con ID {note_id}")
        NoteRepository.delete(db, db_note)
        return {"detail": "Nota eliminada exitosamente"}

    @staticmethod
    def add_tag(db: Session, note_id: int, tag_name: str):
        if not tag_name.strip():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El tag no puede estar vacío")
        db_note = NoteRepository.get_by_id(db, note_id)
        if not db_note:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No se encontró la nota")
        return NoteRepository.add_tag_to_note(db, db_note, tag_name)

    @staticmethod
    def remove_tag(db: Session, note_id: int, tag_name: str):
        db_note = NoteRepository.get_by_id(db, note_id)
        if not db_note:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No se encontró la nota")
        return NoteRepository.remove_tag_from_note(db, db_note, tag_name)

    @staticmethod
    def filter_by_tag(db: Session, tag_name: str):
        return NoteRepository.get_notes_by_tag(db, tag_name)