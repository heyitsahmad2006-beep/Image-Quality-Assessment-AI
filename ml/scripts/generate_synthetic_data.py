import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from ml.data.synthetic_generator import SyntheticDefectGenerator

if __name__ == "__main__":
    output_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "datasets", "synthetic"))
    print(f"Generating synthetic dataset in {output_dir}...")
    generator = SyntheticDefectGenerator(output_dir=output_dir)
    df = generator.generate_dataset(num_samples=150)
    print(f"Successfully generated {len(df)} samples across train, val, and test splits!")
