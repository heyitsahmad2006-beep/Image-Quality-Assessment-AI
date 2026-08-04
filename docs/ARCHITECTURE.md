# Architecture Documentation — Image Quality Assessment AI

## System Overview
Image Quality Assessment AI is a multi-task deep computer-vision framework designed to evaluate whether input images are suitable for downstream computer vision tasks (such as object detection, OCR, facial recognition, or segmentation).

## Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                    React / Vite Frontend                     │
│  (Tailwind CSS, Speedometer Gauge, Circular Quality Meter)   │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST API (JSON / FormData)
┌──────────────────────────────▼──────────────────────────────┐
│                    FastAPI Backend Server                   │
│  - Authentication (JWT / Bcrypt)                            │
│  - Image Validation & EXIF Preprocessing                    │
│  - Database ORM (SQLAlchemy / SQLite)                        │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│               Multi-Task Computer Vision Engine              │
│  ┌─────────────────────────┐   ┌──────────────────────────┐  │
│  │ PyTorch Deep Network    │   │ Explainable OpenCV Layer │  │
│  │ (ConvNeXt / Efficient)  │   │ (Laplacian, Glare, etc.) │  │
│  └────────────┬────────────┘   └────────────┬─────────────┘  │
│               └──────────────┬──────────────┘                │
│                              ▼                               │
│                   Quality Score Fusion                       │
└─────────────────────────────────────────────────────────────┘
```

## Key Modules
1. **Frontend**: React + TypeScript + Vite + Tailwind CSS + Framer Motion. Provides interactive 3D buttons, drag-and-drop upload zone, semicircular speedometer gauge, and animated quality ring.
2. **Backend API**: FastAPI framework serving versioned endpoints (`/api/v1`), token-based JWT authentication, rate limiting, and safe error handling.
3. **ML Pipeline**: Multi-task PyTorch architecture with shared backbone predicting 8 defect severities, defect presence logits, overall quality score, and 4-class suitability decisions.
4. **Explainable Metric Layer**: Deterministic OpenCV computations for Laplacian variance, specular glare ratio, shadow clipping, overexposure percentage, and resolution thresholds.
