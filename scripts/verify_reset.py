import os
import requests
from pathlib import Path

# Paths to check
ROOT_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = ROOT_DIR / "data" / "uploads"
PROCESSED_DIR = ROOT_DIR / "data" / "processed"
MANUAL_DIR = ROOT_DIR / "data" / "manual"

def list_files(directory):
    if not directory.exists():
        return []
    return [str(f.relative_to(ROOT_DIR)) for f in directory.rglob("*") if f.is_file()]

print("--- Data State BEFORE Reset ---")
print(f"Uploads: {len(list_files(UPLOAD_DIR))} files")
print(f"Processed: {len(list_files(PROCESSED_DIR))} files")
print(f"Manual: {len(list_files(MANUAL_DIR))} files")

print("\nTriggering System Reset...")
try:
    response = requests.post("http://localhost:8000/api/upload/reset")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")

print("\n--- Data State AFTER Reset ---")
print(f"Uploads: {len(list_files(UPLOAD_DIR))} files (Expected: 0)")
print(f"Processed: {len(list_files(PROCESSED_DIR))} files (Expected: 0)")
print(f"Manual: {len(list_files(MANUAL_DIR))} files (Expected: same as before)")
