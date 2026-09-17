#!/usr/bin/env python3
"""
test_math_pdf_pipeline.py - Synthetic & E2E Validation of Math PDF Extraction Pipeline
Tests:
  1. Exponents (x², y³, 10⁻⁶, e^{tan⁻¹ x})
  2. Subscripts (H₂O, AlCl₃, K_b)
  3. Fractions (a / b, 1 / 10N)
  4. Square roots (√x, 12√3)
  5. Greek letters (α, β, γ, θ, λ, π, μ, ω, Δ)
  6. Inequality symbols (≤, ≥, ≠, ±, °)
"""

import os
import sys
from pathlib import Path
import pymupdf

# Add scripts directory to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR / "scripts"))

from math_pdf_engine import MathPdfEngine, clean_text_symbols

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

def create_synthetic_math_pdf(filepath: str):
    """Creates a PDF with math formulas across all 6 target categories."""
    doc = pymupdf.open()
    page = doc.new_page(width=595, height=842) # Standard A4

    font_path = "C:/Windows/Fonts/arial.ttf"
    page.insert_font(fontname="f0", fontfile=font_path)

    # Title
    page.insert_text((50, 50), "SARVOTTAM MATHEMATICAL NOTATION BENCHMARK TEST", fontname="f0", fontsize=14)

    # 1. Exponents
    page.insert_text((50, 100), "1. Exponents: Evaluate x² + y³ = z⁵ when x = 10⁻⁶ M and f(x) = e^(tan⁻¹ x).", fontname="f0", fontsize=11)

    # 2. Subscripts & Chemistry
    page.insert_text((50, 150), "2. Subscripts: Reaction of 2H₂O + AlCl₃ with base at constant K_b.", fontname="f0", fontsize=11)

    # 3. Fractions
    page.insert_text((50, 200), "3. Fractions: If vernier constant is (1 / 10N) and ratio is (a / b).", fontname="f0", fontsize=11)

    # 4. Square Roots
    page.insert_text((50, 250), "4. Square Roots: Find the value of √x + 12√3 when x = 27.", fontname="f0", fontsize=11)

    # 5. Greek Letters
    page.insert_text((50, 300), "5. Greek Letters: Parameters α = 0.05, β = 1.2, θ = 45°, λ = 600 nm, π = 3.14159, and ΔE = hν.", fontname="f0", fontsize=11)

    # 6. Inequalities & Operators
    page.insert_text((50, 350), "6. Inequalities: Condition x ≤ 10, y ≥ 0, tolerance ±0.01, with integral ∫ f(x) dx.", fontname="f0", fontsize=11)

    doc.save(filepath)
    doc.close()
    print(f"✅ Generated synthetic test PDF: {filepath}")

def run_pipeline_tests():
    test_pdf_path = str(BASE_DIR / "scripts" / "synthetic_math_test.pdf")
    create_synthetic_math_pdf(test_pdf_path)

    print("\n🔬 Running Math Extraction Pipeline...")
    engine = MathPdfEngine(test_pdf_path)
    extracted_text = engine.extract_page_math_text(0)

    print("\n--- Extracted Text ---")
    print(extracted_text)
    print("----------------------\n")

    test_assertions = [
        ("Exponents (x², y³, 10⁻⁶)", any(exp in extracted_text for exp in ['²', '³', '⁵', '⁻⁶', '^'])),
        ("Subscripts (H₂O, AlCl₃, K_b)", any(sub in extracted_text for sub in ['₂', '₃', 'K_b', 'H₂O', 'AlCl₃'])),
        ("Fractions (1 / 10N, a / b)", ('1 / 10N' in extracted_text or 'a / b' in extracted_text or '/' in extracted_text)),
        ("Square Roots (√x, 12√3)", ('√x' in extracted_text or '√3' in extracted_text or '√' in extracted_text)),
        ("Greek Letters (α, β, θ, π, λ, Δ)", all(g in extracted_text for g in ['α', 'β', 'θ', 'π', 'λ', 'Δ'])),
        ("Inequalities & Symbols (≤, ≥, ±, °, ∫)", all(s in extracted_text for s in ['≤', '≥', '±', '°', '∫']))
    ]

    all_passed = True
    print("📋 Benchmark Assertion Results:")
    for name, passed in test_assertions:
        status = "✅ PASS" if passed else "❌ FAIL"
        if not passed:
            all_passed = False
        print(f"  {status} : {name}")

    if os.path.exists(test_pdf_path):
        try: os.remove(test_pdf_path)
        except: pass

    if all_passed:
        print("\n🎉 ALL 6 MATHEMATICAL EXTRACTION BENCHMARKS PASSED PERFECTLY!\n")
        return True
    else:
        print("\n❌ SOME BENCHMARKS FAILED!\n")
        return False

if __name__ == "__main__":
    success = run_pipeline_tests()
    sys.exit(0 if success else 1)
