from sqlalchemy.orm import Session
from app.models.model_note import Note, Tag
from app.schemas.schema_note import NoteCreate, NoteUpdate

class NoteRepository:

    @staticmethod
    def get_all_active(db: Session):
        return db.query(Note).filter(Note.is_archived == False).all()

    @staticmethod
    def get_all_archived(db: Session):
        return db.query(Note).filter(Note.is_archived == True).all()

    @staticmethod
    def get_by_id(db: Session, note_id: int):
        return db.query(Note).filter(Note.id == note_id).first()

    @staticmethod
    def create(db: Session, note_data: NoteCreate):
        db_note = Note(title=note_data.title, content=note_data.content, is_archived=False)
        db.add(db_note)
        db.commit()
        db.refresh(db_note)
        return db_note

    @staticmethod
    def update(db: Session, db_note: Note, update_data: NoteUpdate):
        update_dict = update_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(db_note, key, value)
        db.commit()
        db.refresh(db_note)
        return db_note

    @staticmethod
    def delete(db: Session, db_note: Note):
        db.delete(db_note)
        db.commit()
        return True

    @staticmethod
    def add_tag_to_note(db: Session, db_note: Note, tag_name: str):
        db_tag = db.query(Tag).filter(Tag.name == tag_name.strip()).first()
        if not db_tag:
            db_tag = Tag(name=tag_name.strip())
            db.add(db_tag)
        if db_tag not in db_note.tags:
            db_note.tags.append(db_tag)
            db.commit()
            db.refresh(db_note)
        return db_note

    @staticmethod
    def remove_tag_from_note(db: Session, db_note: Note, tag_name: str):
        db_tag = db.query(Tag).filter(Tag.name == tag_name.strip()).first()
        if db_tag and db_tag in db_note.tags:
            db_note.tags.remove(db_tag)
            db.commit()
            db.refresh(db_note)
        return db_note

    @staticmethod
    def get_notes_by_tag(db: Session, tag_name: str):
        return db.query(Note).join(Note.tags).filter(Tag.name == tag_name.strip()).all()