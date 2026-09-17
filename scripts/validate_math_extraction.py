#!/usr/bin/env python3
"""
validate_math_extraction.py - Quality & Option Validation Auditor
Scans extracted question datasets to confirm:
  1. Each question has EXACTLY 4 distinct, non-empty options ('a', 'b', 'c', 'd').
  2. Flags any duplicate, missing, empty, or placeholder options.
  3. Audits mathematical notation (exponents, subscripts, fractions, Greek letters, radicals).
  4. Flags Unicode replacement characters (\ufffd, □, ???).

Can be imported by build pipelines (build_jee_mocks.py, build_neet_mocks.py)
or executed directly from CLI: python scripts/validate_math_extraction.py
"""

import json
import re
import sys
from pathlib import Path
from typing import List, Dict, Any, Tuple

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')


def validate_question_options(q: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """
    Validates that a question has exactly 4 distinct, non-empty options ('a', 'b', 'c', 'd').
    Returns (is_valid, issues).
    """
    issues = []
    options = q.get('options')
    if not options or not isinstance(options, dict):
        return False, ["Options field is missing or not a dictionary"]

    expected_keys = ['a', 'b', 'c', 'd']
    actual_keys = list(options.keys())

    # 1. Check for exact 4 keys
    missing_keys = [k for k in expected_keys if k not in options]
    if missing_keys:
        issues.append(f"Missing option keys: {[k.upper() for k in missing_keys]}")

    extra_keys = [k for k in actual_keys if k not in expected_keys]
    if extra_keys:
        issues.append(f"Unexpected extra option keys: {[k.upper() for k in extra_keys]}")

    # 2. Check each option is non-empty
    for k in expected_keys:
        val = options.get(k)
        if val is None or not isinstance(val, str) or not val.strip():
            issues.append(f"Option ({k.upper()}) is blank or empty")

    # 3. Check all 4 options are distinct
    seen_values: Dict[str, str] = {}
    for k in expected_keys:
        if k in options and isinstance(options[k], str):
            val = options[k].strip()
            if val:
                if val in seen_values:
                    first_key = seen_values[val]
                    issues.append(
                        f"Duplicate options: Option ({first_key.upper()}) and Option ({k.upper()}) "
                        f"have identical content: {repr(val)[:60]}"
                    )
                else:
                    seen_values[val] = k

    # 4. Check for placeholder markers
    for k in expected_keys:
        if k in options and isinstance(options[k], str):
            val = options[k].strip()
            if any(marker in val for marker in ['[Refer to Question Diagram', '[Option', 'extraction error']):
                issues.append(f"Placeholder text in Option ({k.upper()}): {repr(val)[:60]}")
            elif val in ['(A)', '(B)', '(C)', '(D)', 'A', 'B', 'C', 'D']:
                issues.append(f"Option ({k.upper()}) is just the option letter: {repr(val)}")

    is_valid = (len(issues) == 0)
    return is_valid, issues


def audit_question_dataset(questions: List[Dict[str, Any]], dataset_name: str = "Dataset") -> Dict[str, Any]:
    print(f"\n========================================================")
    print(f"🔍 AUDITING DATASET: {dataset_name} ({len(questions)} Questions)")
    print(f"========================================================")

    errors = []
    warnings = []
    flagged_option_questions = []

    stats = {
        "dataset": dataset_name,
        "total": len(questions),
        "options_valid_count": 0,
        "options_flagged_count": 0,
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
        subject = q.get('subject', '')
        section = q.get('section', '')

        # 1. Validate 4 distinct non-empty options
        is_opt_valid, opt_issues = validate_question_options(q)
        if is_opt_valid:
            stats["options_valid_count"] += 1
        else:
            stats["options_flagged_count"] += 1
            flagged_option_questions.append({
                "id": qid,
                "subject": subject,
                "section": section,
                "snippet": qtext[:70].replace('\n', ' '),
                "issues": opt_issues,
                "options": options
            })
            for issue in opt_issues:
                # Differentiate between hard errors (empty/duplicate) and warnings (diagram placeholder)
                if any(k in issue for k in ['blank or empty', 'Duplicate options', 'Missing option keys', 'extraction error']):
                    errors.append(f"Q{qid}: {issue}")
                else:
                    warnings.append(f"Q{qid}: {issue}")

        # 2. Mathematical Content Tracking
        opt_vals = [str(v) for v in options.values()] if isinstance(options, dict) else []
        has_math = any(s in qtext for s in math_symbols) or any(any(s in opt for s in math_symbols) for opt in opt_vals)
        has_exp = any(s in qtext for s in exponents) or any(any(s in opt for s in exponents) for opt in opt_vals)
        has_sub = any(s in qtext for s in subscripts) or any(any(s in opt for s in subscripts) for opt in opt_vals)
        has_frac = '/' in qtext or any('/' in opt for opt in opt_vals)
        has_greek = any(s in qtext for s in greek_chars) or any(any(s in opt for s in greek_chars) for opt in opt_vals)
        has_rad = '√' in qtext or any('√' in opt for opt in opt_vals)

        if has_math: stats["with_math_symbols"] += 1
        if has_exp: stats["with_exponents"] += 1
        if has_sub: stats["with_subscripts"] += 1
        if has_frac: stats["with_fractions"] += 1
        if has_greek: stats["with_greek"] += 1
        if has_rad: stats["with_radicals"] += 1

        # 3. Check for Unicode replacement chars
        for char in suspicious_chars:
            if char in qtext:
                errors.append(f"Q{qid}: Question contains suspicious replacement character {repr(char)}")
            for opt_key, opt_val in options.items():
                if isinstance(opt_val, str) and char in opt_val:
                    errors.append(f"Q{qid}: Option ({opt_key.upper()}) contains suspicious character {repr(char)}")

        # 4. Check broken fractions
        if re.search(r'\(\s*/\s*\)', qtext) or re.search(r'/\s*$', qtext):
            warnings.append(f"Q{qid}: Potential dangling fraction detected in question text")

        # 5. Answer key validity
        if not correct_ans or str(correct_ans).lower() not in ['a', 'b', 'c', 'd', '1', '2', '3', '4']:
            warnings.append(f"Q{qid}: Correct answer is non-standard or missing: '{correct_ans}'")

    error_count = len(errors)
    warning_count = len(warnings)
    stats["errors"] = error_count
    stats["warnings"] = warning_count
    stats["clean_pass"] = stats["total"] - error_count
    stats["flagged_questions"] = flagged_option_questions

    # Print Formatted Report
    print(f"📊 Extraction & Notation Statistics:")
    print(f"  • Total Questions:          {stats['total']}")
    print(f"  • With Math Symbols (√,π,∫):{stats['with_math_symbols']}")
    print(f"  • With Exponents (x², 10⁻⁶): {stats['with_exponents']}")
    print(f"  • With Subscripts (H₂O, K_b):{stats['with_subscripts']}")
    print(f"  • With Fractions (a/b):     {stats['with_fractions']}")
    print(f"  • With Greek Letters (α,β): {stats['with_greek']}")
    print(f"  • With Radicals (√):        {stats['with_radicals']}")
    print(f"  ------------------------------------------------")
    print(f"🎯 4-Option Verification Report:")
    print(f"  • Exactly 4 Distinct, Non-Empty Options: {stats['options_valid_count']} / {stats['total']} ({stats['options_valid_count']*100//max(1,stats['total'])}%)")
    print(f"  • Flagged Questions:                     {stats['options_flagged_count']}")
    print(f"  ------------------------------------------------")
    print(f"  • Critical Errors:                       {error_count}")
    print(f"  • Warnings:                              {warning_count}")

    if flagged_option_questions:
        print(f"\n⚠️ FLAGGED QUESTIONS ({len(flagged_option_questions)}):")
        for fq in flagged_option_questions[:10]:
            print(f"   [Q{fq['id']}] {fq['subject']} | {fq['section']}")
            print(f"     Preview : {fq['snippet']}...")
            for iss in fq['issues']:
                print(f"     Issue   : ⚠️ {iss}")
            if isinstance(fq['options'], dict):
                print(f"     Options : A: {repr(fq['options'].get('a', ''))[:30]} | B: {repr(fq['options'].get('b', ''))[:30]}")
                print(f"               C: {repr(fq['options'].get('c', ''))[:30]} | D: {repr(fq['options'].get('d', ''))[:30]}")
        if len(flagged_option_questions) > 10:
            print(f"   ... and {len(flagged_option_questions) - 10} more flagged questions.")

    if error_count == 0:
        print(f"\n✅ QUALITY AUDIT PASSED (0 Critical Errors)")
    else:
        print(f"\n❌ AUDIT FOUND {error_count} CRITICAL ERRORS")

    return stats


def parse_ts_dataset(filepath: Path) -> List[Dict[str, Any]]:
    """Extracts JSON question list from a TypeScript data file."""
    content = filepath.read_text(encoding='utf-8')
    m = re.search(r'=\s*(\[\s*\{.*\}\s*\]);?', content, re.DOTALL)
    if m:
        try:
            return json.loads(m.group(1))
        except Exception:
            pass

    raw_objs = re.findall(
        r'\{\s*"id":\s*(\d+).*?"subject":\s*"([^"]*)".*?"section":\s*"([^"]*)".*?"question":\s*"((?:[^"\\]|\\.)*)".*?"options":\s*\{([^}]+)\}.*?"correctAnswer":\s*"([^"]*)"',
        content,
        re.DOTALL
    )
    questions = []
    for qid, subj, sec, qtext, opts_str, ans in raw_objs:
        opts = {}
        for line in opts_str.strip().split('\n'):
            om = re.search(r'"([a-d])":\s*"((?:[^"\\]|\\.)*)"', line)
            if om:
                opts[om.group(1)] = om.group(2).encode().decode('unicode-escape', errors='replace')
        questions.append({
            "id": int(qid),
            "subject": subj,
            "section": sec,
            "question": qtext.encode().decode('unicode-escape', errors='replace'),
            "options": opts,
            "correctAnswer": ans
        })
    return questions


def validate_all_cbt_datasets(data_dir: Path = None):
    """Audits all CBT question datasets in the workspace."""
    if data_dir is None:
        base_dir = Path(__file__).resolve().parent.parent
        data_dir = base_dir / "sarvottam-mobile" / "src" / "data"

    datasets = [
        ("JEE Main Mock 1", data_dir / "questionsJeeMock1.ts"),
        ("JEE Main Mock 2", data_dir / "questionsJeeMock2.ts"),
        ("JEE Main Mock 3", data_dir / "questionsJeeMock3.ts"),
        ("NEET 2024 Botany", data_dir / "questionsNeetBotany.ts"),
        ("NEET 2024 Physics", data_dir / "questionsNeetPhysics.ts"),
        ("NEET 2024 Chemistry", data_dir / "questionsNeetChemistry.ts"),
    ]

    print(f"\n========================================================")
    print(f"🚀 RUNNING COMPREHENSIVE 4-OPTION & MATH AUDITOR")
    print(f"   Target Directory: {data_dir}")
    print(f"========================================================")

    all_stats = []
    for name, path in datasets:
        if not path.exists():
            print(f"⚠️ Skipping {name} ({path.name} not found)")
            continue
        questions = parse_ts_dataset(path)
        stats = audit_question_dataset(questions, name)
        all_stats.append(stats)

    # Print Summary Table
    print(f"\n========================================================")
    print(f"📋 GLOBAL SUMMARY: 4 DISTINCT, NON-EMPTY OPTIONS AUDIT")
    print(f"========================================================")
    print(f"{'Dataset':<22} | {'Total':<6} | {'4 Valid Opts':<14} | {'Flagged':<8} | {'Status'}")
    print(f"-" * 65)

    grand_total = 0
    grand_valid = 0
    grand_flagged = 0

    for s in all_stats:
        grand_total += s['total']
        grand_valid += s['options_valid_count']
        grand_flagged += s['options_flagged_count']
        pct = (s['options_valid_count'] * 100) // max(1, s['total'])
        status = "✅ PASS" if s['errors'] == 0 else f"❌ {s['errors']} ERR"
        print(f"{s['dataset']:<22} | {s['total']:<6} | {s['options_valid_count']:>4} ({pct:>2}%)     | {s['options_flagged_count']:<8} | {status}")

    print(f"-" * 65)
    overall_pct = (grand_valid * 100) // max(1, grand_total)
    print(f"{'OVERALL TOTAL':<22} | {grand_total:<6} | {grand_valid:>4} ({overall_pct:>2}%)     | {grand_flagged:<8}")
    print(f"========================================================\n")

    return all_stats


if __name__ == "__main__":
    validate_all_cbt_datasets()
