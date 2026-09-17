#!/usr/bin/env python3
import sys
import re
from pathlib import Path
import pymupdf

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE_DIR = Path(__file__).resolve().parent.parent
PDF_PATH = BASE_DIR / "paper" / "jee mock" / "jee main mock 1.pdf"
OUT_DIR = BASE_DIR / "relay-server" / "public" / "questions"
OUT_DIR.mkdir(parents=True, exist_ok=True)

def test_crop():
    doc = pymupdf.open(str(PDF_PATH))
    print(f"Loaded {PDF_PATH.name}, pages: {len(doc)}")
    
    # Test crop Question 3 on page 2 (0-indexed 1)
    p = doc[1]
    q3_rect = pymupdf.Rect(295.0, 70.0, 575.0, 355.0)
    pix = p.get_pixmap(clip=q3_rect, dpi=200)
    out_file = OUT_DIR / "jee_mock1_q3.png"
    pix.save(str(out_file))
    print(f"Saved {out_file} (bytes: {out_file.stat().st_size})")

    # Test crop Question 4 (sonometer)
    q4_rect = pymupdf.Rect(295.0, 353.0, 575.0, 630.0)
    pix4 = p.get_pixmap(clip=q4_rect, dpi=200)
    out_file4 = OUT_DIR / "jee_mock1_q4.png"
    pix4.save(str(out_file4))
    print(f"Saved {out_file4} (bytes: {out_file4.stat().st_size})")

if __name__ == "__main__":
    test_crop()
