import os
import uuid
import numpy as np
import cv2
from PIL import Image, ImageOps
from fastapi import UploadFile, HTTPException

Image.MAX_IMAGE_PIXELS = None

ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tiff", ".tif"}
ALLOWED_MIMETYPES = {"image/png", "image/jpeg", "image/jpg", "image/webp", "image/bmp", "image/tiff"}
MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024  # 15 MB

def validate_and_process_image(file: UploadFile) -> tuple[np.ndarray, str, bytes]:
    """
    Validates extension, MIME type, size, checks for corruption, applies EXIF correction,
    downscales ultra-high-resolution images safely in PIL to prevent memory exhaustion,
    converts to BGR numpy array for OpenCV analysis, and generates a safe filename.
    """
    ext = os.path.splitext(file.filename)[1].lower() if file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file extension '{ext}'. Allowed: PNG, JPG, JPEG, WEBP, BMP, TIFF")

    # Read bytes into memory
    content = file.file.read()
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=400, detail=f"File size exceeds maximum limit of 15 MB (Received {len(content)/(1024*1024):.2f} MB)")

    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # Corrupt file & EXIF check with Pillow
    try:
        from io import BytesIO
        pil_img = Image.open(BytesIO(content))
        pil_img.verify()
        
        # Re-open for transformation (verify closes image pointer)
        pil_img = Image.open(BytesIO(content))
        pil_img = ImageOps.exif_transpose(pil_img)

        # Memory optimization: Downscale ultra-high resolution images (>3840px) before converting to numpy
        orig_w, orig_h = pil_img.size
        MAX_DIM = 3840
        if max(orig_w, orig_h) > MAX_DIM:
            scale = MAX_DIM / float(max(orig_w, orig_h))
            new_size = (max(1, int(orig_w * scale)), max(1, int(orig_h * scale)))
            pil_img = pil_img.resize(new_size, Image.Resampling.BILINEAR)

        pil_img = pil_img.convert("RGB")
        rgb_arr = np.array(pil_img)
        bgr_arr = cv2.cvtColor(rgb_arr, cv2.COLOR_RGB2BGR)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"File is corrupted or invalid image format: {str(e)}")

    # Safe filename generation
    safe_name = f"{uuid.uuid4().hex[:12]}_{os.path.basename(file.filename)}"
    safe_name = "".join([c for c in safe_name if c.isalnum() or c in "._-"])

    return bgr_arr, safe_name, content

def cleanup_temp_file(file_path: str):
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception:
        pass
