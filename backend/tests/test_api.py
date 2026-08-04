import io
import sys
import os
import pytest
from PIL import Image

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def create_dummy_image_bytes(fmt="PNG", size=(200, 200), color=(100, 150, 200)):
    buf = io.BytesIO()
    img = Image.new("RGB", size, color=color)
    img.save(buf, format=fmt)
    buf.seek(0)
    return buf.getvalue()

def test_health_endpoint():
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"

def test_model_status_endpoint():
    res = client.get("/api/v1/model/status")
    assert res.status_code == 200
    data = res.json()
    assert "model_mode" in data
    assert len(data["supported_defects"]) == 8

def test_auth_flow():
    reg_data = {"email": "user123@example.com", "username": "user123", "password": "password123"}
    res = client.post("/api/v1/auth/register", json=reg_data)
    assert res.status_code in [201, 400]

    login_res = client.post("/api/v1/auth/login", json={"email": "user123@example.com", "password": "password123"})
    if login_res.status_code == 200:
        token = login_res.json()["access_token"]
        me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert me_res.status_code == 200

def test_analyze_image_valid_formats():
    for fmt in ["PNG", "JPEG", "WEBP"]:
        img_bytes = create_dummy_image_bytes(fmt=fmt)
        files = {"file": (f"test_image.{fmt.lower()}", img_bytes, f"image/{fmt.lower()}")}
        res = client.post("/api/v1/analysis/analyze", files=files)
        assert res.status_code == 200
        data = res.json()
        assert 0.0 <= data["overall_quality_score"] <= 100.0
        assert data["suitability"] in ["Not Suitable", "Needs Improvement", "Suitable", "Highly Suitable"]
        assert len(data["defects"]) == 8

def test_analyze_invalid_extension():
    files = {"file": ("test.txt", b"not an image", "text/plain")}
    res = client.post("/api/v1/analysis/analyze", files=files)
    assert res.status_code == 400
    assert "Unsupported file extension" in res.json()["detail"]

def test_analyze_corrupt_image():
    files = {"file": ("corrupt.png", b"corrupt bytes data", "image/png")}
    res = client.post("/api/v1/analysis/analyze", files=files)
    assert res.status_code == 400
    assert "corrupted" in res.json()["detail"].lower()
