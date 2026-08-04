import numpy as np

class ScoreFusionEngine:
    """
    Calibrated Hybrid Overall Score Fusion Engine for Image Quality Assessment AI.
    Combines Pretrained NR-IQA Perceptual Neural Predictions (75% weight) with
    Explainable OpenCV Technical Defect Metrics (25% weight).
    """

    DEFECT_WEIGHTS = {
        "blur": 0.25,
        "low_resolution": 0.20,
        "darkness": 0.15,
        "overexposure": 0.15,
        "glare": 0.10,
        "motion_artifacts": 0.08,
        "occlusion": 0.04,
        "poor_framing": 0.03
    }

    DEFECT_MESSAGES = {
        "blur": ("Image exhibits blur or softness affecting fine details.", "Re-focus camera lens or use faster shutter speed."),
        "glare": ("Specular reflections or intense highlights obscure key regions.", "Adjust lighting angle or use a polarizing filter."),
        "darkness": ("Image is underexposed with shadow clipping.", "Increase ambient lighting or exposure time."),
        "overexposure": ("Highlights are blown out with lost pixel details.", "Reduce exposure setting or scene illumination."),
        "motion_artifacts": ("Directional motion streak detected across pixels.", "Hold camera steady or use a tripod."),
        "occlusion": ("Foreground obstruction or frame blockage detected.", "Remove physical objects blocking the main subject."),
        "poor_framing": ("Subject touches image boundaries or is off-center.", "Center main subject with adequate margins."),
        "low_resolution": ("Image resolution is low for computer vision models.", "Provide image at higher resolution (min 1024x768).")
    }

    @classmethod
    def fuse(cls, severities: dict, technical_metrics: dict, pretrained_iqa_res: dict = None, is_heuristic: bool = False) -> dict:
        # 1. Calculate technical defect score
        total_defect_score = round(sum(
            float(severities.get(d, 0.0)) * w for d, w in cls.DEFECT_WEIGHTS.items()
        ), 2)
        technical_quality_score = round(float(np.clip(100.0 - total_defect_score, 0.0, 100.0)), 1)

        # 2. Hybrid Score Fusion with Pretrained IQA Model
        if pretrained_iqa_res and pretrained_iqa_res.get("normalized_score") is not None:
            pretrained_score = float(pretrained_iqa_res["normalized_score"])
            pretrained_weight, technical_weight = 0.75, 0.25
            final_quality = (0.75 * pretrained_score) + (0.25 * technical_quality_score)
            overall_quality_score = round(float(np.clip(final_quality, 0.0, 100.0)), 1)
            model_mode = "pretrained_iqa"
            raw_score = pretrained_iqa_res.get("raw_score")
            model_name = pretrained_iqa_res.get("name", "NIMA_MobileNet_NR")
            device = pretrained_iqa_res.get("device", "cpu")
        else:
            pretrained_score = None
            pretrained_weight, technical_weight = 0.0, 1.0
            overall_quality_score = technical_quality_score
            model_mode = "heuristic_fallback"
            raw_score, model_name, device = None, "Heuristic Fallback Engine", "cpu"

        # 3. Dynamic Reliability Index
        dynamic_confidence = round(
            float(np.clip(0.98 - (abs(pretrained_score - technical_quality_score) / 100.0) * 0.25, 0.75, 0.98))
            if pretrained_score is not None else 0.88, 2
        )

        # 4. Quality Category & Suitability Decision
        quality_category, suitability = cls._get_category_and_suitability(overall_quality_score)

        # 5. Format Defect Details & Recommendations
        defects_output, recommendations = cls._format_defects(severities, dynamic_confidence)

        return {
            "overall_quality_score": overall_quality_score,
            "quality_category": quality_category,
            "suitability": suitability,
            "confidence": dynamic_confidence,
            "model_mode": model_mode,
            "iqa_model": {
                "name": model_name,
                "raw_score": raw_score,
                "normalized_score": pretrained_score,
                "device": device
            },
            "technical_quality_score": technical_quality_score,
            "final_quality_score": overall_quality_score,
            "score_breakdown": {
                "pretrained_weight": pretrained_weight,
                "technical_weight": technical_weight,
                "weighted_defect_severity": total_defect_score
            },
            "defects": defects_output,
            "technical_metrics": technical_metrics,
            "recommendations": recommendations,
            "mode": "AI Model Mode" if model_mode == "pretrained_iqa" else "Heuristic Fallback Mode"
        }

    @staticmethod
    def _get_category_and_suitability(score: float) -> tuple[str, str]:
        if score < 25.0:
            return "Worst", "Not Suitable"
        if score < 50.0:
            return "Average", "Needs Improvement"
        if score < 75.0:
            return "Good", "Suitable"
        return "Best", "Highly Suitable"

    @classmethod
    def _format_defects(cls, severities: dict, dynamic_confidence: float) -> tuple[dict, list[str]]:
        defects_output = {}
        recommendations = []

        for name, weight in cls.DEFECT_WEIGHTS.items():
            sev = float(severities.get(name, 0.0))
            status = "low" if sev < 20.0 else "moderate" if sev < 45.0 else "high" if sev < 70.0 else "critical"
            defect_conf = round(float(np.clip(dynamic_confidence + (0.02 if status in ["low", "critical"] else -0.02), 0.70, 0.99)), 2)
            explanation, rec = cls.DEFECT_MESSAGES.get(name, ("Potential defect detected.", "Check image capture conditions."))

            defects_output[name] = {
                "severity": round(sev, 1),
                "status": status,
                "confidence": defect_conf,
                "explanation": explanation,
                "recommendation": rec if sev >= 20.0 else "No action required."
            }
            if sev >= 25.0:
                recommendations.append(rec)

        if not recommendations:
            recommendations.append("Image quality is excellent and ready for downstream computer-vision processing.")

        return defects_output, recommendations
