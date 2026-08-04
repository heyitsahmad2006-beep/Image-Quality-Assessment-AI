# Image Quality Assessment AI

An AI-powered computer-vision system that evaluates whether an uploaded image is suitable for downstream computer-vision tasks.

## Eight Defect Categories

The system analyzes images across 8 explainable defect categories:

1. **Blur**: Laplacian variance and Sobel edge sharpness evaluation.
2. **Glare**: Specular highlight pixel percentage thresholding.
3. **Darkness**: Shadow clipping percentage and mean luminance analysis.
4. **Overexposure**: Highlight clipping percentage and high luminance detection.
5. **Motion Artifacts**: Directional edge consistency & orientation variance.
6. **Occlusion**: Central ROI patch uniformity assessment.
7. **Poor Framing**: Subject border touch ratio and framing balance.
8. **Low Resolution**: Original uploaded Megapixels thresholding.

## Key Features

- **Dual Scoring Mode**: Hybrid fusion combining a Pretrained No-Reference IQA Neural Backbone (`NIMA_MobileNet_NR`, 75% weight) with Classical OpenCV Technical Defect Metrics (25% weight).
- **React Frontend**: Built with TypeScript, Vite, Tailwind CSS, Framer Motion, and custom speedometers.
- **FastAPI Backend**: Asynchronous REST API server with Pydantic schemas and SQLAlchemy ORM.

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide React
- **Backend**: FastAPI, Uvicorn, Pydantic v2, Python 3.11
- **Computer Vision & ML**: OpenCV, PyTorch, NumPy, Pillow

## Local Setup & Server URLs

### 1. Backend Setup

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python run_backend.py
```

- **Backend API URL**: `http://localhost:8000`
- **Swagger Documentation**: `http://localhost:8000/docs`

### 2. Frontend Setup

```powershell
cd frontend
npm install
npm run dev
```

- **Frontend Application URL**: `http://localhost:5173`

### 3. Quick Startup Script

To run both backend and frontend simultaneously:

```powershell
powershell -ExecutionPolicy Bypass -File "scripts/run_all.ps1"
```

## System Limitations

- Evaluation accuracy depends on image domain distribution and lighting conditions.
- Deep neural NR-IQA inference scales with GPU/CPU hardware capacity.
