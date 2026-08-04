import cv2
import numpy as np

class ClassicalImageMetrics:
    """
    Computes explainable, calibrated computer vision measurements using OpenCV and NumPy.
    Provides mathematical statistics and calibrated defect severity scores (0-100).
    """

    @staticmethod
    def analyze_image(img_bgr: np.ndarray) -> dict:
        if img_bgr is None or img_bgr.size == 0:
            raise ValueError("Invalid or empty image provided for analysis.")

        orig_height, orig_width = img_bgr.shape[:2]
        megapixels = round((orig_width * orig_height) / 1e6, 2)

        # Downscale ultra-high-resolution images (>1280px) for memory efficiency & speed
        MAX_PROC_DIM = 1280
        if max(orig_height, orig_width) > MAX_PROC_DIM:
            scale = MAX_PROC_DIM / float(max(orig_height, orig_width))
            img_proc = cv2.resize(img_bgr, (max(1, int(orig_width * scale)), max(1, int(orig_height * scale))), interpolation=cv2.INTER_AREA)
        else:
            img_proc = img_bgr

        height, width = img_proc.shape[:2]
        total_pixels = height * width
        gray = cv2.cvtColor(img_proc, cv2.COLOR_BGR2GRAY)
        hsv = cv2.cvtColor(img_proc, cv2.COLOR_BGR2HSV)

        # 1. Technical Brightness & Contrast Statistics
        mean_brightness = float(np.mean(gray))
        median_brightness = float(np.median(gray))
        std_brightness = float(np.std(gray))

        # 2. Blur / Sharpness (Laplacian variance & Sobel gradients)
        laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        grad_mag = np.sqrt(sobelx**2 + sobely**2)
        mean_edge_sharpness = float(np.mean(grad_mag))
        blur_severity = ClassicalImageMetrics._calculate_blur(laplacian_var)

        # 3. Glare (Specular highlights ratio)
        glare_mask = (hsv[:, :, 2] > 248) & (hsv[:, :, 1] < 25)
        glare_pixel_percent = float((np.sum(glare_mask) / total_pixels) * 100.0)
        glare_severity = ClassicalImageMetrics._calculate_glare(glare_pixel_percent)

        # 4. Darkness (Shadow clipping & low luminance)
        shadow_mask = gray < 20
        shadow_clipping_percent = float((np.sum(shadow_mask) / total_pixels) * 100.0)
        darkness_severity = ClassicalImageMetrics._calculate_darkness(mean_brightness)

        # 5. Overexposure (Highlight clipping ratio)
        highlight_mask = gray > 248
        highlight_clipping_percent = float((np.sum(highlight_mask) / total_pixels) * 100.0)
        overexposure_severity = ClassicalImageMetrics._calculate_overexposure(highlight_clipping_percent, mean_brightness)

        # 6. Motion Artifacts
        motion_severity = ClassicalImageMetrics._calculate_motion(sobelx, sobely, grad_mag, laplacian_var)

        # 7. Occlusion (Central ROI uniform blockage)
        occlusion_severity = ClassicalImageMetrics._calculate_occlusion(gray, height, width)

        # 8. Poor Framing (Border touch ratio)
        framing_severity = ClassicalImageMetrics._calculate_framing(gray, height, width)

        # 9. Low Resolution (Uses original uploaded Megapixels)
        low_res_severity = ClassicalImageMetrics._calculate_low_res(megapixels)

        # Technical Metrics Dictionary
        technical_metrics = {
            "width": orig_width,
            "height": orig_height,
            "megapixels": megapixels,
            "mean_brightness": round(mean_brightness, 2),
            "median_brightness": round(median_brightness, 2),
            "std_brightness": round(std_brightness, 2),
            "laplacian_variance": round(laplacian_var, 2),
            "mean_edge_sharpness": round(mean_edge_sharpness, 2),
            "highlight_clipping_percent": round(highlight_clipping_percent, 2),
            "shadow_clipping_percent": round(shadow_clipping_percent, 2),
            "glare_pixel_percent": round(glare_pixel_percent, 2)
        }

        # Defect Severities Dictionary
        severities = {
            "blur": round(blur_severity, 2),
            "glare": round(glare_severity, 2),
            "darkness": round(darkness_severity, 2),
            "overexposure": round(overexposure_severity, 2),
            "motion_artifacts": round(motion_severity, 2),
            "occlusion": round(occlusion_severity, 2),
            "poor_framing": round(framing_severity, 2),
            "low_resolution": round(low_res_severity, 2)
        }

        return {
            "severities": severities,
            "technical_metrics": technical_metrics
        }

    @staticmethod
    def _calculate_blur(laplacian_var: float) -> float:
        if laplacian_var >= 250.0:
            return 0.0
        if laplacian_var >= 100.0:
            return float(np.clip(15.0 * (1.0 - (laplacian_var - 100.0) / 150.0), 0.0, 15.0))
        if laplacian_var >= 30.0:
            return float(np.clip(15.0 + 35.0 * (1.0 - (laplacian_var - 30.0) / 70.0), 15.0, 50.0))
        return float(np.clip(50.0 + 50.0 * (1.0 - laplacian_var / 30.0), 50.0, 100.0))

    @staticmethod
    def _calculate_glare(glare_pixel_percent: float) -> float:
        if glare_pixel_percent < 0.5:
            return 0.0
        return float(np.clip((glare_pixel_percent - 0.5) * 6.0, 0.0, 100.0))

    @staticmethod
    def _calculate_darkness(mean_brightness: float) -> float:
        if mean_brightness >= 80.0:
            return 0.0
        if mean_brightness >= 50.0:
            return float(np.clip((80.0 - mean_brightness) * 0.5, 0.0, 15.0))
        if mean_brightness >= 25.0:
            return float(np.clip(15.0 + (50.0 - mean_brightness) * 1.4, 15.0, 50.0))
        return float(np.clip(50.0 + (25.0 - mean_brightness) * 2.0, 50.0, 100.0))

    @staticmethod
    def _calculate_overexposure(highlight_clipping_percent: float, mean_brightness: float) -> float:
        if highlight_clipping_percent < 3.0 and mean_brightness <= 225.0:
            return 0.0
        clip_penalty = max(0.0, highlight_clipping_percent - 3.0) * 5.0
        bright_penalty = max(0.0, mean_brightness - 225.0) * 2.0
        return float(np.clip(clip_penalty + bright_penalty, 0.0, 100.0))

    @staticmethod
    def _calculate_motion(sobelx: np.ndarray, sobely: np.ndarray, grad_mag: np.ndarray, laplacian_var: float) -> float:
        if laplacian_var > 150.0:
            return 0.0
        angles = np.arctan2(sobely, sobelx) * (180 / np.pi)
        angles_valid = angles[grad_mag > 20]
        if len(angles_valid) <= 200:
            return 0.0
        hist, _ = np.histogram(angles_valid, bins=36, range=(-180, 180))
        max_bin_ratio = float(np.max(hist) / np.sum(hist))
        if max_bin_ratio > 0.20:
            return float(np.clip((max_bin_ratio - 0.20) * 150.0 * (1.0 - laplacian_var / 150.0), 0.0, 100.0))
        return 0.0

    @staticmethod
    def _calculate_occlusion(gray: np.ndarray, height: int, width: int) -> float:
        y1, y2 = int(height * 0.2), int(height * 0.8)
        x1, x2 = int(width * 0.2), int(width * 0.8)
        roi = gray[y1:y2, x1:x2]
        roi_h, roi_w = roi.shape

        block_size = max(16, min(roi_w, roi_h) // 10)
        h_blocks = roi_h // block_size
        w_blocks = roi_w // block_size
        total_blocks = h_blocks * w_blocks

        if total_blocks == 0:
            return 0.0

        occluded_blocks = 0
        for i in range(h_blocks):
            for j in range(w_blocks):
                patch = roi[i*block_size:(i+1)*block_size, j*block_size:(j+1)*block_size]
                if np.std(patch) < 2.0 and (np.mean(patch) < 10 or np.mean(patch) > 248):
                    occluded_blocks += 1

        return float(np.clip((occluded_blocks / total_blocks) * 120.0, 0.0, 100.0))

    @staticmethod
    def _calculate_framing(gray: np.ndarray, height: int, width: int) -> float:
        edges = cv2.Canny(gray, 50, 150)
        border = max(2, min(width, height) // 30)
        border_mask = np.zeros_like(edges)
        border_mask[:border, :] = 1
        border_mask[-border:, :] = 1
        border_mask[:, :border] = 1
        border_mask[:, -border:] = 1

        border_edges = np.sum((edges > 0) & (border_mask == 1))
        total_edges = max(1, np.sum(edges > 0))
        return float(np.clip((border_edges / total_edges - 0.15) * 50.0, 0.0, 20.0))

    @staticmethod
    def _calculate_low_res(megapixels: float) -> float:
        if megapixels >= 2.0:
            return 0.0
        if megapixels >= 1.0:
            return float(np.clip((2.0 - megapixels) * 10.0, 0.0, 10.0))
        if megapixels >= 0.3:
            return float(np.clip(10.0 + (1.0 - megapixels) * 40.0, 10.0, 38.0))
        return float(np.clip(38.0 + (0.3 - megapixels) * 200.0, 38.0, 100.0))
