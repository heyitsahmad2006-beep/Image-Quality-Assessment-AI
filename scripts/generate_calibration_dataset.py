import os
import cv2
import numpy as np

def generate_calibration_dataset():
    base_dir = os.path.join("ml", "calibration")
    categories = ["high_quality", "medium_quality", "low_quality"]

    for cat in categories:
        os.makedirs(os.path.join(base_dir, cat), exist_ok=True)

    np.random.seed(42)

    # 1. Generate 5 High-Quality Images
    for i in range(1, 6):
        img = np.zeros((480, 640, 3), dtype=np.uint8)
        for y in range(480):
            img[y, :, 0] = int(50 + (y / 480) * 100)
            img[y, :, 1] = int(30 + (y / 480) * 80)
            img[y, :, 2] = int(60 + (y / 480) * 90)
        cv2.circle(img, (320, 240), 120 + i * 5, (200, 220, 250), -1)
        cv2.putText(img, f"High Quality Sample #{i}", (30, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
        cv2.imwrite(os.path.join(base_dir, "high_quality", f"hq_sample_{i}.jpg"), img)

    # 2. Generate 5 Medium-Quality Images
    for i in range(1, 6):
        img = np.zeros((480, 640, 3), dtype=np.uint8)
        for y in range(480):
            img[y, :, 0] = int(40 + (y / 480) * 60)
            img[y, :, 1] = int(20 + (y / 480) * 50)
            img[y, :, 2] = int(50 + (y / 480) * 70)
        cv2.circle(img, (320, 240), 120, (160, 180, 210), -1)
        img = cv2.GaussianBlur(img, (9, 9), 2.5)
        cv2.imwrite(os.path.join(base_dir, "medium_quality", f"mq_sample_{i}.jpg"), img)

    # 3. Generate 5 Low-Quality Images
    for i in range(1, 6):
        img = np.zeros((240, 320, 3), dtype=np.uint8)
        img[:, :] = (15, 15, 20)
        cv2.circle(img, (160, 120), 50, (40, 40, 60), -1)
        img = cv2.GaussianBlur(img, (19, 19), 6.0)
        cv2.imwrite(os.path.join(base_dir, "low_quality", f"lq_sample_{i}.jpg"), img)

    print("Calibration dataset created successfully under ml/calibration/")

if __name__ == "__main__":
    generate_calibration_dataset()
