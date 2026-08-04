import uuid
from sqlalchemy.orm import Session
from fastapi import HTTPException
from ..models.models import AnalysisRecord

def save_analysis_record(db: Session, analysis_data: dict, filename: str, user_id: str = None) -> AnalysisRecord:
    record = AnalysisRecord(
        id=str(uuid.uuid4()),
        user_id=user_id,
        filename=filename,
        overall_quality_score=analysis_data["overall_quality_score"],
        quality_category=analysis_data["quality_category"],
        suitability=analysis_data["suitability"],
        confidence=analysis_data["confidence"],
        processing_time_ms=analysis_data["processing_time_ms"],
        defects=analysis_data["defects"],
        technical_metrics=analysis_data["technical_metrics"],
        recommendations=analysis_data["recommendations"],
        mode=analysis_data.get("mode", "Heuristic Mode")
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

def get_analysis_by_id(db: Session, analysis_id: str, user_id: str = None) -> AnalysisRecord:
    query = db.query(AnalysisRecord).filter(AnalysisRecord.id == analysis_id)
    if user_id:
        query = query.filter(AnalysisRecord.user_id == user_id)
    record = query.first()
    if not record:
        raise HTTPException(status_code=404, detail=f"Analysis record '{analysis_id}' not found.")
    return record

def get_user_analysis_history(db: Session, user_id: str, limit: int = 50) -> list[AnalysisRecord]:
    return db.query(AnalysisRecord).filter(AnalysisRecord.user_id == user_id).order_by(AnalysisRecord.created_at.desc()).limit(limit).all()

def delete_analysis_record(db: Session, analysis_id: str, user_id: str = None) -> bool:
    record = get_analysis_by_id(db, analysis_id, user_id=user_id)
    db.delete(record)
    db.commit()
    return True
