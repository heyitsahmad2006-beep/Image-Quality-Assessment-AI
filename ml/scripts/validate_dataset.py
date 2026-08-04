import os
import pandas as pd

def validate_dataset(dataset_dir="ml/datasets/synthetic"):
    anno_path = os.path.join(dataset_dir, "annotations.csv")
    if not os.path.exists(anno_path):
        print(f" Dataset file not found at {anno_path}")
        return False

    df = pd.read_csv(anno_path)
    print(f"Dataset summary for {anno_path}:")
    print(f"- Total images: {len(df)}")
    print(f"- Splits: {df['split'].value_counts().to_dict()}")
    print(f"- Suitability distribution: {df['suitable_label'].value_counts().to_dict()}")
    print(f"- Mean overall quality score: {df['overall_quality_score'].mean():.2f}")

    # Check file existence
    missing = 0
    for idx, row in df.iterrows():
        p = os.path.join(dataset_dir, row["image_path"])
        if not os.path.exists(p):
            missing += 1

    if missing > 0:
        print(f" Warning: {missing} image files in CSV annotations were not found on disk!")
        return False

    print(" All image paths verified successfully! Dataset integrity OK.")
    return True

if __name__ == "__main__":
    validate_dataset()
