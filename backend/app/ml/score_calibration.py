import numpy as np

class ScoreCalibration:
    """
    Normalizes raw No-Reference IQA model predictions (e.g. 0-1 continuous scale or MOS 1-5 scale)
    into a calibrated 0-100 perceptual quality score.
    """

    @staticmethod
    def calibrate_raw_score(raw_score: float, scale_type: str = "sigmoid_0_1") -> dict:
        """
        Calibrates raw neural model predictions to 0-100 scale.
        """
        if scale_type == "sigmoid_0_1":
            # Raw score is continuous [0.0, 1.0]
            normalized = raw_score * 100.0
        elif scale_type == "mos_1_5":
            # Raw MOS score is [1.0, 5.0]
            normalized = ((raw_score - 1.0) / 4.0) * 100.0
        elif scale_type == "mos_1_10":
            # Raw MOS score is [1.0, 10.0]
            normalized = ((raw_score - 1.0) / 9.0) * 100.0
        else:
            normalized = raw_score

        # Clamp strictly between 0.0 and 100.0
        clamped_normalized = float(np.clip(normalized, 0.0, 100.0))

        return {
            "raw_iqa_score": round(float(raw_score), 4),
            "normalized_iqa_score": round(clamped_normalized, 1),
            "calibration_method": scale_type,
            "min_possible": 0.0,
            "max_possible": 100.0
        }
