# API Documentation — Image Quality Assessment AI

Base URL: `http://localhost:8000/api/v1`

## Endpoints

### 1. Health & Status
- **`GET /health`**: Returns system health status and timestamp.
- **`GET /model/status`**: Returns active inference mode (`Trained AI Model` or `Heuristic Mode`), device (`cpu`/`cuda`), and loaded weight path.
- **`GET /model/metrics`**: Returns empirical evaluation metrics loaded from `metrics.json`.

### 2. Authentication
- **`POST /auth/register`**: Registers a new user (`email`, `username`, `password`).
- **`POST /auth/login`**: Authenticates user and returns JWT bearer token.
- **`GET /auth/me`**: Returns current user details (Header: `Authorization: Bearer <token>`).

### 3. Image Quality Analysis
- **`POST /analysis/analyze`**: Accepts multipart `file` upload (PNG, JPG, WEBP, BMP, TIFF). Guest mode supported.
  **Response Format**:
  ```json
  {
    "analysis_id": "uuid",
    "filename": "sample.png",
    "overall_quality_score": 84,
    "quality_category": "Best",
    "suitability": "Highly Suitable",
    "confidence": 0.93,
    "processing_time_ms": 185,
    "defects": {
      "blur": { "severity": 10, "status": "low", "confidence": 0.95 },
      "glare": { "severity": 12, "status": "low", "confidence": 0.91 },
      "darkness": { "severity": 8, "status": "low", "confidence": 0.94 },
      "overexposure": { "severity": 5, "status": "low", "confidence": 0.92 },
      "motion_artifacts": { "severity": 6, "status": "low", "confidence": 0.90 },
      "occlusion": { "severity": 9, "status": "low", "confidence": 0.88 },
      "poor_framing": { "severity": 14, "status": "low", "confidence": 0.85 },
      "low_resolution": { "severity": 4, "status": "low", "confidence": 0.98 }
    },
    "technical_metrics": {
      "width": 1920,
      "height": 1080,
      "megapixels": 2.07,
      "mean_brightness": 128.5,
      "laplacian_variance": 412.0,
      "highlight_clipping_percent": 1.2
    },
    "recommendations": [
      "Image quality is excellent and ready for downstream computer-vision processing."
    ]
  }
  ```
- **`GET /analysis/history`**: Returns user's saved analysis history (Authenticated).
- **`GET /analysis/{analysis_id}`**: Retrieves a specific analysis record.
- **`DELETE /analysis/{analysis_id}`**: Deletes a specific analysis record.
