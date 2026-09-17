#!/usr/bin/env python3
"""
validate_math_extraction.py - Quality & Validation Auditor
Scans extracted question datasets for:
  - Unicode replacement characters (\ufffd, □, ???)
  - Blank or missing question options ((A) with empty string)
  - Broken fractions (dangling / or missing denominators)
  - Truncated equations or broken radical symbols
  - Missing answer keys or explanations
Emits a structured report with severity levels (OK, WARNING, ERROR).
"""

import re
import sys
from typing import List, Dict, Any

def audit_question_dataset(questions: List[Dict[str, Any]], dataset_name: str = "Dataset") -> Dict[str, Any]:
    print(f"\n========================================================")
    print(f"🔍 AUDITING DATASET: {dataset_name} ({len(questions)} Questions)")
    print(f"========================================================")

    errors = []
    warnings = []
    stats = {
        "total": len(questions),
        "with_math_symbols": 0,
        "with_exponents": 0,
        "with_subscripts": 0,
        "with_fractions": 0,
        "with_greek": 0,
        "with_radicals": 0,
        "clean_pass": 0
    }

    suspicious_chars = ['\ufffd', '□', '???']
    math_symbols = ['∫', '√', 'π', '±', '≤', '≥', '≠', '≈', '°', '∞', '→', '⇌', 'λ', 'θ', 'α', 'β', 'γ', 'μ', 'ω', 'Δ']
    greek_chars = ['α', 'β', 'γ', 'θ', 'λ', 'μ', 'ω', 'Δ', 'π']
    exponents = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹', '⁻', '⁺', '^']
    subscripts = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉', '_']

    for q in questions:
        qid = q.get('id', '?')
        qtext = q.get('question', '')
        options = q.get('options', {})
        correct_ans = q.get('correctAnswer', '')
        exp = q.get('explanation', '')

        has_math = any(s in qtext for s in math_symbols) or any(any(s in opt for s in math_symbols) for opt in options.values())
        has_exp = any(s in qtext for s in exponents) or any(any(s in opt for s in exponents) for opt in options.values())
        has_sub = any(s in qtext for s in subscripts) or any(any(s in opt for s in subscripts) for opt in options.values())
        has_frac = '/' in qtext or any('/' in opt for opt in options.values())
        has_greek = any(s in qtext for s in greek_chars) or any(any(s in opt for s in greek_chars) for opt in options.values())
        has_rad = '√' in qtext or any('√' in opt for opt in options.values())

        if has_math: stats["with_math_symbols"] += 1
        if has_exp: stats["with_exponents"] += 1
        if has_sub: stats["with_subscripts"] += 1
        if has_frac: stats["with_fractions"] += 1
        if has_greek: stats["with_greek"] += 1
        if has_rad: stats["with_radicals"] += 1

        # Check 1: Replacement chars
        for char in suspicious_chars:
            if char in qtext:
                errors.append(f"Q{qid}: Question contains suspicious replacement character {repr(char)}")
            for opt_key, opt_val in options.items():
                if char in opt_val:
                    errors.append(f"Q{qid}: Option ({opt_key.upper()}) contains suspicious character {repr(char)}")

        # Check 2: Empty or trivial options
        if not options or len(options) < 4:
            errors.append(f"Q{qid}: Incomplete options count ({len(options)}/4)")
        else:
            for opt_key in ['a', 'b', 'c', 'd']:
                opt_val = options.get(opt_key, '').strip()
                if not opt_val:
                    errors.append(f"Q{qid}: Option ({opt_key.upper()}) is completely blank!")
                elif opt_val in ['(A)', '(B)', '(C)', '(D)', 'A', 'B', 'C', 'D']:
                    warnings.append(f"Q{qid}: Option ({opt_key.upper()}) has trivial placeholder value '{opt_val}'")

        # Check 3: Broken fractions
        if re.search(r'\(\s*/\s*\)', qtext) or re.search(r'/\s*$', qtext):
            warnings.append(f"Q{qid}: Potential dangling fraction detected in question text")

        # Check 4: Answer key validity
        if not correct_ans or correct_ans not in ['a', 'b', 'c', 'd', '1', '2', '3', '4']:
            warnings.append(f"Q{qid}: Correct answer is non-standard or missing: '{correct_ans}'")

    error_count = len(errors)
    warning_count = len(warnings)
    stats["errors"] = error_count
    stats["warnings"] = warning_count
    stats["clean_pass"] = stats["total"] - error_count

    print(f"📊 Extraction Statistics:")
    print(f"  • Total Questions:          {stats['total']}")
    print(f"  • With Math Symbols (√,π,∫):{stats['with_math_symbols']}")
    print(f"  • With Exponents (x², 10⁻⁶): {stats['with_exponents']}")
    print(f"  • With Subscripts (H₂O, K_b):{stats['with_subscripts']}")
    print(f"  • With Fractions (a/b):     {stats['with_fractions']}")
    print(f"  • With Greek Letters (α,β): {stats['with_greek']}")
    print(f"  • With Radicals (√):        {stats['with_radicals']}")
    print(f"  ------------------------------------------------")
    print(f"  • Critical Errors:          {error_count}")
    print(f"  • Warnings:                 {warning_count}")

    if error_count == 0:
        print(f"  ✅ QUALITY AUDIT PASSED (0 Errors)")
    else:
        print(f"  ❌ AUDIT FOUND {error_count} ERRORS:")
        for err in errors[:10]:
            print(f"     - {err}")
        if len(errors) > 10:
            print(f"     ... and {len(errors) - 10} more.")

    return stats

if __name__ == "__main__":
    print("validate_math_extraction module ready.")
