import time
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from ...db.session import get_db
from ...schemas.schemas import AnalysisResponse
from ...utils.image_utils import validate_and_process_image
from ...ml.engine import inference_engine
from ...services.analysis_service import save_analysis_record, get_analysis_by_id, get_user_analysis_history, delete_analysis_record
from .auth import get_current_user, get_optional_current_user
from ...models.models import User, AnalysisRecord

router = APIRouter()

def _format_record(r: AnalysisRecord) -> dict:
    return {
        "analysis_id": r.id,
        "filename": r.filename,
        "overall_quality_score": r.overall_quality_score,
        "quality_category": r.quality_category,
        "suitability": r.suitability,
        "confidence": r.confidence,
        "processing_time_ms": r.processing_time_ms,
        "defects": r.defects,
        "technical_metrics": r.technical_metrics,
        "recommendations": r.recommendations,
        "mode": r.mode,
        "created_at": r.created_at
    }

@router.post("/analysis/analyze", response_model=AnalysisResponse)
async def analyze_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_current_user)
):
    t_start = time.perf_counter()

    # 1. Validate image and prepare OpenCV BGR array
    img_bgr, safe_filename, _ = validate_and_process_image(file)

    # 2. Run hybrid inference engine (AI + Classical CV + Score Fusion)
    try:
        analysis_result = inference_engine.analyze(img_bgr)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image quality analysis failed: {str(e)}")

    analysis_result["processing_time_ms"] = round((time.perf_counter() - t_start) * 1000.0, 1)
    user_id = current_user.id if current_user else None

    # 3. Save to database
    record = save_analysis_record(db, analysis_result, filename=file.filename or safe_filename, user_id=user_id)
    return _format_record(record)

@router.get("/analysis/history")
def list_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    records = get_user_analysis_history(db, user_id=current_user.id)
    return [_format_record(r) for r in records]

@router.get("/analysis/{analysis_id}")
def get_analysis(
    analysis_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_current_user)
):
    user_id = current_user.id if current_user else None
    record = get_analysis_by_id(db, analysis_id, user_id=user_id)
    return _format_record(record)

@router.delete("/analysis/{analysis_id}")
def delete_analysis(
    analysis_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    delete_analysis_record(db, analysis_id, user_id=current_user.id)
    return {"message": f"Analysis record '{analysis_id}' deleted successfully."}
