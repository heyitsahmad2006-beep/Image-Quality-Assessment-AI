# Image Quality Assessment AI

A computer-vision application that evaluates whether an uploaded image is suitable for downstream AI and computer-vision tasks.

## Features

- Upload and validate high-resolution images
- Overall image-quality score from 0 to 100
- Blur detection (Laplacian variance & Sobel edge sharpness)
- Glare detection (Specular highlight ratio)
- Darkness detection (Shadow clipping & mean luminance)
- Overexposure detection (Highlight clipping ratio)
- Motion-artifact detection (Directional edge consistency)
- Occlusion estimation (Central ROI uniformity)
- Poor-framing estimation (Border contact ratio)
- Low-resolution detection (Original Megapixel thresholding)
- Animated quality circle and luxury automotive-style speedometer
- React frontend with dark midnight-purple theme
- FastAPI backend with REST endpoints
- OpenCV-based technical analysis & Pretrained NR-IQA model support (`NIMA_MobileNet_NR`)

## Technology Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide Icons
- **Backend**: FastAPI, Uvicorn, Pydantic, Python 3.11
- **Computer Vision & ML**: OpenCV, NumPy, Pillow, PyTorch

## Project Structure

```
Image-Quality-Assessment-AI/
├── backend/            # FastAPI application, REST endpoints, and ML engine
│   ├── app/            # Core models, schemas, and API endpoints
│   ├── tests/          # Pytest automated test suite
│   ├── requirements.txt# Python backend dependencies
│   └── .env.example    # Environment variables template
├── frontend/           # React + TypeScript frontend UI
│   ├── src/            # Components, pages, hooks, and API client
│   ├── public/         # Static assets and icons
│   ├── package.json    # Frontend dependencies
│   └── .env.example    # Frontend environment configuration template
├── ml/                 # Machine Learning & Computer Vision modules
│   ├── calibration/    # Calibration dataset samples
│   ├── configs/        # Scoring and model weights configuration
│   ├── models/         # Score fusion engine & neural networks
│   ├── preprocessing/  # Classical OpenCV feature extractors
│   ├── scripts/        # Data generation & validation utilities
│   └── weights/        # Trained model checkpoints
├── scripts/            # PowerShell startup and utility scripts
├── docs/               # Technical documentation & architecture guides
├── .gitignore          # Git ignore configuration
└── README.md           # Project documentation
```

## Local Setup

### 1. Backend Setup

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
python run_backend.py
```

The backend server will start on `http://localhost:8000`. Interactive API documentation is available at `http://localhost:8000/docs`.

### 2. Frontend Setup

```powershell
cd frontend
npm install
npm run dev -- --host 0.0.0.0
```

The frontend application will start on `http://localhost:5173`.

### 3. Quick Master Launcher

To launch both backend and frontend servers simultaneously in separate windows:

```powershell
powershell -ExecutionPolicy Bypass -File "scripts/run_all.ps1"
```
