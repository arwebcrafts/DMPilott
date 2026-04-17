"""
Script to copy all Instagram DM automation related files for Gemini analysis.
Run: python scripts/copy_for_gemini.py
"""

import shutil
import os
from pathlib import Path

# Base project directory
PROJECT_DIR = Path(r"C:\Users\PMYLS\Downloads\DMpilot\dmpilot")

# All files related to Instagram connection and DM sending
FILES_TO_COPY = [
    # API Routes - Instagram Connection
    "src/app/api/meta/connect/route.ts",
    "src/app/api/meta/callback/route.ts",
    "src/app/api/accounts/route.ts",
    "src/app/api/accounts/[id]/route.ts",
    
    # Automation Management
    "src/app/api/automations/route.ts",
    "src/app/api/automations/[id]/route.ts",
    "src/app/api/automations/[id]/toggle/route.ts",
    
    # Webhook Handler
    "src/app/api/webhooks/meta/route.ts",
    
    # DM Worker (BullMQ background processor)
    "src/workers/dmWorker.ts",
    
    # Encryption utility
    "src/lib/encryption.ts",
    
    # Database Schema
    "supabase/migrations/001_initial_schema.sql",
    
    # Testing/Debug Scripts
    "scripts/verify-sig.js",
    "scripts/test-webhook-local.js",
    "scripts/test-webhook-signature.js",
    
    # Store and User models
    "src/stores/userStore.ts",
]

def copy_files_to_gemini_folder():
    # Create destination folder
    dest_dir = PROJECT_DIR / "gemini_analysis"
    
    # Remove existing folder if present
    if dest_dir.exists():
        shutil.rmtree(dest_dir)
    
    dest_dir.mkdir(parents=True, exist_ok=True)
    print(f"Created folder: {dest_dir}")
    
    copied_files = []
    failed_files = []
    
    for relative_path in FILES_TO_COPY:
        src_path = PROJECT_DIR / relative_path
        
        if src_path.exists():
            # Flatten: create unique filename based on path
            # e.g. "src/app/api/meta/connect/route.ts" -> "meta_connect_route.ts"
            parts = Path(relative_path).parts
            flat_name = "_".join(parts).replace("/", "_").replace("[", "").replace("]", "")
            dest_path = dest_dir / flat_name
            
            # Copy the file
            shutil.copy2(src_path, dest_path)
            copied_files.append((relative_path, flat_name))
            print(f"  [COPIED] {relative_path} -> {flat_name}")
        else:
            failed_files.append(relative_path)
            print(f"  [NOT FOUND] {relative_path}")
    
    # Create a manifest file listing all copied files
    manifest_path = dest_dir / "MANIFEST.txt"
    with open(manifest_path, 'w', encoding='utf-8') as f:
        f.write("DMPILOT - INSTAGRAM DM AUTOMATION FILES\n")
        f.write("=" * 50 + "\n\n")
        f.write(f"Total files copied: {len(copied_files)}\n")
        f.write(f"Failed files: {len(failed_files)}\n\n")
        f.write("COPIED FILES:\n")
        f.write("-" * 50 + "\n")
        for i, (orig, flat) in enumerate(copied_files, 1):
            f.write(f"{i}. {flat}\n")
            f.write(f"   (original: {orig})\n")
        
        if failed_files:
            f.write("\n\nFAILED FILES (not found):\n")
            f.write("-" * 50 + "\n")
            for file in failed_files:
                f.write(f"  - {file}\n")
    
    print(f"\nManifest saved to: {manifest_path}")
    print(f"\n{'=' * 50}")
    print(f"Done! {len(copied_files)} files copied to:")
    print(f"  {dest_dir}")
    
    return copied_files, failed_files


if __name__ == "__main__":
    copy_files_to_gemini_folder()
