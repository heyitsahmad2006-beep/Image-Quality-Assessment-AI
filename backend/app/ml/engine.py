import os
import cv2
import numpy as np
from ..core.config import settings

import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..")))
from ml.preprocessing.classical_metrics import ClassicalImageMetrics
from ml.models.fusion import ScoreFusionEngine
from .iqa_model import iqa_service

class InferenceEngine:
    """
    Thread-safe Hybrid Inference Engine for Image Quality Assessment AI.
    Combines Pretrained NR-IQA Neural Model with Explainable OpenCV Technical Detectors.
    """

    def __init__(self):
        self.iqa_service = iqa_service
        self.status = self.iqa_service.get_status()

    def analyze(self, img_bgr: np.ndarray) -> dict:
        # 1. Compute explainable classical OpenCV technical metrics & defect severities
        classical_result = ClassicalImageMetrics.analyze_image(img_bgr)
        classical_severities = classical_result["severities"]
        technical_metrics = classical_result["technical_metrics"]

        # 2. Predict global perceptual quality score using Pretrained NR-IQA model
        pretrained_iqa_res = self.iqa_service.predict_perceptual_score(img_bgr)

        # 3. Fuse pretrained perceptual score (75%) & technical defect score (25%)
        fused_result = ScoreFusionEngine.fuse(
            severities=classical_severities,
            technical_metrics=technical_metrics,
            pretrained_iqa_res=pretrained_iqa_res,
            is_heuristic=(pretrained_iqa_res.get("mode") != "pretrained_iqa")
        )

        return fused_result

# Global inference engine instance (exported as both inference_engine and engine for compatibility)
inference_engine = InferenceEngine()
engine = inference_engine
