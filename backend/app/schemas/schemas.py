from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Dict, List, Optional
from datetime import datetime

# --- Auth Schemas ---
class UserRegister(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    username: str
    email: str

class UserResponse(BaseModel):
    id: str
    email: str
    username: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Defect & Technical Metric Schemas ---
class DefectDetail(BaseModel):
    severity: float
    status: str
    confidence: float
    explanation: Optional[str] = None
    recommendation: Optional[str] = None

class TechnicalMetrics(BaseModel):
    width: int
    height: int
    megapixels: float
    mean_brightness: float
    median_brightness: float
    std_brightness: float
    laplacian_variance: float
    mean_edge_sharpness: float
    highlight_clipping_percent: float
    shadow_clipping_percent: float
    glare_pixel_percent: float

class IQAModelDetail(BaseModel):
    name: str
    raw_score: Optional[float] = None
    normalized_score: Optional[float] = None
    device: str = "cpu"

class ScoreBreakdownDetail(BaseModel):
    pretrained_weight: float = 0.75
    technical_weight: float = 0.25
    weighted_defect_severity: float = 0.0

# --- Analysis Response Schema ---
class AnalysisResponse(BaseModel):
    analysis_id: str
    filename: str
    overall_quality_score: float
    quality_category: str
    suitability: str
    confidence: float
    processing_time_ms: float
    model_mode: Optional[str] = "pretrained_iqa"
    iqa_model: Optional[IQAModelDetail] = None
    technical_quality_score: Optional[float] = None
    final_quality_score: Optional[float] = None
    score_breakdown: Optional[ScoreBreakdownDetail] = None
    defects: Dict[str, DefectDetail]
    technical_metrics: TechnicalMetrics
    recommendations: List[str]
    mode: Optional[str] = "AI Model Mode"
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# --- System / Model Status Schemas ---
class HealthResponse(BaseModel):
    status: str
    app_name: str
    environment: str
    version: str
    timestamp: str

class ModelStatusResponse(BaseModel):
    mode: str
    model_mode: str
    pretrained_iqa_name: str
    device: str
    loaded: bool
    version: str
    fallback_available: bool
    is_trained_weights_loaded: bool
    weights_path: str
    supported_defects: List[str]
    backbone_architecture: str

    model_config = ConfigDict(protected_namespaces=())
