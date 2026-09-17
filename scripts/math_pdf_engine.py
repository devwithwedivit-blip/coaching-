#!/usr/bin/env python3
"""
math_pdf_engine.py - High-accuracy Math-Aware PDF Extraction Engine
Handles:
  - 2-Column layout sorting (Left column vs Right column)
  - Exponents and Superscripts (x^2, 10^-6, e^{tan^-1 x})
  - Subscripts and Chemical formulas (H2O, AlCl3, Kb)
  - 2D Vertical fractions ((numerator) / (denominator))
  - Special mathematical symbols (√, ±, °, ≤, ≥, π, ∫, ∞, etc.)
  - Greek letters (α, β, γ, θ, λ, μ, ω, Δ)
  - Unicode normalization & ligature cleanup (fi, fl)
"""

import re
import sys
import unicodedata
from typing import List, Dict, Any, Tuple, Optional
import pymupdf

# Common superscript and subscript Unicode mappings
SUPERSCRIPTS = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
    '+': '⁺', '-': '⁻', '−': '⁻', '–': '⁻', '—': '⁻', '=': '⁼', '(': '⁽', ')': '⁾',
    'n': 'ⁿ', 'i': 'ⁱ', 'x': 'ˣ', 'y': 'ʸ'
}

SUBSCRIPTS = {
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
    '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
    '+': '₊', '-': '₋', '−': '₋', '–': '₋', '—': '₋', '=': '₌', '(': '₍', ')': '₎',
    'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ', 'k': 'ₖ',
    'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ', 'p': 'ₚ', 'r': 'ᵣ',
    's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ', 'v': 'ᵥ', 'x': 'ₓ'
}

REV_SUPERSCRIPTS = {v: k for k, v in SUPERSCRIPTS.items()}
REV_SUBSCRIPTS = {v: k for k, v in SUBSCRIPTS.items()}

# Symbol normalization map
SYMBOL_MAP = {
    '\ufb01': 'fi',
    '\ufb02': 'fl',
    '\ufb03': 'ffi',
    '\ufb04': 'ffl',
    '\u2013': '–',      # en-dash
    '\u2014': '—',      # em-dash
    '\u2212': '−',      # minus sign
    '\u0192': 'f',      # function f
    '\u2113': 'l',      # script l (ln)
    '\u2113n': 'ln',
    '\u221a': '√',      # square root
    '\u03c0': 'π',      # pi
    '\u2264': '≤',
    '\u2265': '≥',
    '\u2260': '≠',
    '\u2248': '≈',
    '\u00b1': '±',
    '\u2213': '∓',
    '\u00b0': '°',      # degree
    '\u221e': '∞',      # infinity
    '\u222b': '∫',      # integral
    '\u2192': '→',
    '\u21cc': '⇌',
    '\u2208': '∈',
    '\u03b1': 'α',
    '\u03b2': 'β',
    '\u03b3': 'γ',
    '\u03b8': 'θ',
    '\u03bb': 'λ',
    '\u03bc': 'μ',
    '\u03c9': 'ω',
    '\u0394': 'Δ',
    '\xa0': ' '
}

def to_superscript_str(text: str) -> str:
    """Converts a simple string like '2', '3', '-1' into superscript Unicode, or returns ^(text)."""
    text = text.strip()
    if not text:
        return ""
    if all(c in SUPERSCRIPTS for c in text):
        return "".join(SUPERSCRIPTS[c] for c in text)
    return f"^{{{text}}}"

def to_subscript_str(text: str) -> str:
    """Converts a string into subscript Unicode, or returns _{text}."""
    text = text.strip()
    if not text:
        return ""
    if all(c in SUBSCRIPTS for c in text):
        return "".join(SUBSCRIPTS[c] for c in text)
    return f"_{{{text}}}"

def clean_text_symbols(text: str) -> str:
    """Replaces known custom symbols, ligatures, and normalizes unicode."""
    if not text:
        return ""
    for k, v in SYMBOL_MAP.items():
        text = text.replace(k, v)
    text = unicodedata.normalize('NFKC', text)
    text = text.replace('\ufffd', ' ')
    text = re.sub(r'[\r\t]+', ' ', text)
    text = re.sub(r' +', ' ', text)
    return text.strip()

class MathPdfEngine:
    def __init__(self, doc_path: str):
        self.doc_path = doc_path
        self.doc = pymupdf.open(doc_path)

    def extract_page_math_text(self, page_num: int, col_split: Optional[float] = None) -> str:
        """
        Extracts structured text from page_num with 2-column deconstruction,
        fraction synthesis, and exponent/subscript formatting.
        """
        page = self.doc[page_num]
        d = page.get_text('dict')
        page_width = page.rect.width
        if col_split is None:
            col_split = page_width / 2.0

        raw_spans = []
        for b in d.get('blocks', []):
            if 'lines' in b:
                for l in b['lines']:
                    for s in l['spans']:
                        t = s['text']
                        if t.strip():
                            raw_spans.append({
                                'text': t,
                                'bbox': s['bbox'],
                                'size': s['size'],
                                'font': s['font'],
                                'flags': s['flags']
                            })

        if not raw_spans:
            return ""

        # Check if page is 2-column or 1-column
        has_left = any(s['bbox'][0] < (col_split - 20) for s in raw_spans)
        has_right = any(s['bbox'][0] > (col_split + 20) for s in raw_spans)
        is_two_column = has_left and has_right and page_width > 500

        if is_two_column:
            header_spans = []
            col0_spans = []
            col1_spans = []
            footer_spans = []

            for s in raw_spans:
                y0 = s['bbox'][1]
                x0 = s['bbox'][0]
                x1 = s['bbox'][2]
                # Header: ONLY if it crosses the center gutter at the very top of the page
                if y0 < 60 and x0 < (col_split - 15) and x1 > (col_split + 15):
                    header_spans.append(s)
                elif y0 > (page.rect.height - 45):
                    footer_spans.append(s)
                elif x0 < col_split:
                    col0_spans.append(s)
                else:
                    col1_spans.append(s)

            header_text = self._process_column_spans(header_spans)
            col0_text = self._process_column_spans(col0_spans)
            col1_text = self._process_column_spans(col1_spans)
            footer_text = self._process_column_spans(footer_spans)

            full_page_text = "\n".join(filter(None, [header_text, col0_text, col1_text, footer_text]))
        else:
            full_page_text = self._process_column_spans(raw_spans)

        return full_page_text

    def _synthesize_span_fractions(self, spans: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Synthesizes 2D vertical fractions at span level based on bounding box geometry
        (numerator directly above denominator with high x-overlap and narrow width).
        Guarded against merging across distinct multiple-choice option lines or words.
        """
        def is_opt(t: str) -> bool:
            return bool(re.match(r'^\([A-Da-d]\)$', t) or re.match(r'^\([1-4]\)$', t) or re.match(r'^[A-Da-d]\.$', t))

        # Identify spans that immediately follow an option label on the same line
        opt_spans = [s for s in spans if is_opt(s['text'].strip())]
        def is_opt_start(s: Dict[str, Any]) -> bool:
            s_ymid = (s['bbox'][1] + s['bbox'][3]) / 2.0
            for opt in opt_spans:
                opt_ymid = (opt['bbox'][1] + opt['bbox'][3]) / 2.0
                if abs(s_ymid - opt_ymid) <= 4.0:
                    # To the right of option label, within 35 pt
                    if 0 < (s['bbox'][0] - opt['bbox'][2]) <= 35.0:
                        return True
            return False

        def is_valid_math_term(t: str) -> bool:
            t = t.strip()
            if not t or len(t) > 10:
                return False
            if is_opt(t):
                return False
            # Disallow punctuation like colons, semicolons
            if any(c in t for c in [':', ';', '!', '?']):
                return False
            # Disallow spaces followed by letters/units, e.g. "12.5 J", "5000 Hz", "2 m/s"
            if re.search(r'\s+[A-Za-z]', t):
                return False
            # Disallow ordinary English words of length >= 3
            words = re.findall(r'[a-zA-Z]{3,}', t)
            math_funcs = {'sin', 'cos', 'tan', 'cot', 'sec', 'csc', 'log', 'ln', 'lim', 'det', 'exp', 'max', 'min'}
            for w in words:
                if w.lower() not in math_funcs:
                    return False
            # Must contain at least a digit, variable, or math symbol
            if not re.search(r'[0-9a-zA-Z\+\-\*\/\\^_(){}\[\]±√π]', t):
                return False
            return True

        spans_sorted = sorted(spans, key=lambda s: (s['bbox'][1], s['bbox'][0]))
        used = set()
        new_spans = []

        for i, s1 in enumerate(spans_sorted):
            if i in used:
                continue
            t1 = s1['text'].strip()
            b1 = s1['bbox']
            w1 = b1[2] - b1[0]
            best_j = None

            if w1 <= 50 and is_valid_math_term(t1):
                for j in range(i + 1, len(spans_sorted)):
                    if j in used:
                        continue
                    s2 = spans_sorted[j]
                    b2 = s2['bbox']
                    t2 = s2['text'].strip()
                    w2 = b2[2] - b2[0]
                    y_gap = b2[1] - b1[3]
                    if y_gap > 8.0:
                        break
                    # Vertical gap must be tight (typical fraction gap is 0-6 pt; body line spacing is 14-18 pt)
                    # Denominator cannot be an option start span and must be a valid math term
                    if -2.5 <= y_gap <= 7.0 and w2 <= 50 and is_valid_math_term(t2):
                        if is_opt_start(s2):
                            continue
                        overlap = min(b1[2], b2[2]) - max(b1[0], b2[0])
                        min_w = min(w1, w2)
                        if min_w > 0 and (overlap / min_w >= 0.35 or overlap > 0):
                            best_j = j
                            break

            if best_j is not None:
                s2 = spans_sorted[best_j]
                used.add(i)
                used.add(best_j)
                txt = f"({t1} / {s2['text'].strip()})"
                bb = (min(b1[0], s2['bbox'][0]), b1[1], max(b1[2], s2['bbox'][2]), s2['bbox'][3])
                new_spans.append({
                    'text': txt,
                    'bbox': bb,
                    'size': s1['size'],
                    'font': s1['font'],
                    'flags': s1.get('flags', 0)
                })
            else:
                used.add(i)
                new_spans.append(s1)

        return new_spans

    def _process_column_spans(self, spans: List[Dict[str, Any]]) -> str:
        if not spans:
            return ""

        # Step 0: Synthesize local 2D fractions at span level before line clustering
        spans = self._synthesize_span_fractions(spans)

        # Step 1: Cluster spans into horizontal visual lines
        spans_sorted = sorted(spans, key=lambda s: (s['bbox'][1], s['bbox'][0]))
        lines = []
        for s in spans_sorted:
            placed = False
            y_mid = (s['bbox'][1] + s['bbox'][3]) / 2.0
            for l in lines:
                l_y_mid = (l['y0'] + l['y1']) / 2.0
                if abs(y_mid - l_y_mid) <= 5.0:
                    l['spans'].append(s)
                    l['y0'] = min(l['y0'], s['bbox'][1])
                    l['y1'] = max(l['y1'], s['bbox'][3])
                    placed = True
                    break
            if not placed:
                lines.append({
                    'y0': s['bbox'][1],
                    'y1': s['bbox'][3],
                    'spans': [s]
                })

        lines.sort(key=lambda l: l['y0'])

        # Step 2: Sort spans inside each line left to right
        for l in lines:
            l['spans'].sort(key=lambda s: s['bbox'][0])

        # Step 3: Vertical fraction synthesis across adjacent lines (fallback for multi-token fractions)
        assembled_lines = []
        skip_indices = set()

        for i in range(len(lines)):
            if i in skip_indices:
                continue
            curr_line = lines[i]

            if i + 1 < len(lines) and (i + 1) not in skip_indices:
                next_line = lines[i + 1]
                y_gap = next_line['y0'] - curr_line['y1']
                merged = self._try_merge_fraction(curr_line, next_line, y_gap)
                if merged is not None:
                    assembled_lines.append(merged)
                    skip_indices.add(i + 1)
                    continue

            rendered_line = self._render_line_with_scripts(curr_line['spans'])
            assembled_lines.append(rendered_line)

        raw_result = "\n".join(filter(None, assembled_lines))
        return self._post_process_math_text(raw_result)

    def _try_merge_fraction(self, top_line: Dict, bot_line: Dict, y_gap: float) -> Optional[str]:
        """Tries to pair top_line (numerator) and bot_line (denominator) if they form a fraction."""
        if y_gap > 7.0 or y_gap < -3.0:
            return None

        top_spans = top_line['spans']
        bot_spans = bot_line['spans']

        # Guard: Do not merge across lines containing option labels or markers
        if any(re.search(r'\([A-Da-d1-4]\)', s['text']) for s in top_spans + bot_spans):
            return None

        # Fractions are concise expressions, not full sentences or headings
        if len(top_spans) <= 3 and len(bot_spans) <= 3:
            t_txt = " ".join(s['text'].strip() for s in top_spans).strip()
            b_txt = " ".join(s['text'].strip() for s in bot_spans).strip()

            # Guard: Must be concise math formula (<= 20 chars and <= 3 words)
            if len(t_txt) > 20 or len(b_txt) > 20:
                return None
            if len(t_txt.split()) > 3 or len(b_txt.split()) > 3:
                return None

            # Guard: A true fraction must contain at least one digit or math symbol in numerator or denominator
            if not re.search(r'[\d+\-−×÷=√π±/]', t_txt) and not re.search(r'[\d+\-−×÷=√π±/]', b_txt):
                return None

            # Guard: Do not merge option labels, question markers, or punctuation
            if re.match(r'^\(?\d+\.?\)?$', t_txt) or re.match(r'^\(?[A-Da-d]\.?\)?$', t_txt):
                return None
            if re.match(r'^\(?\d+\.?\)?$', b_txt) or re.match(r'^\(?[A-Da-d]\.?\)?$', b_txt):
                return None
            disallowed = ['section', 'marks', 'question', 'evaluate', 'find', 'reaction', 'subscripts', 'year', 'paper', 'solved', 'solid', 'angle', 'strain', 'discover', 'zero', 'none', 'these', 'ratio', 'speed', 'true', 'false', 'both', 'only']
            if any(w in t_txt.lower() for w in disallowed) or any(w in b_txt.lower() for w in disallowed):
                return None

            t_x0 = min(s['bbox'][0] for s in top_spans)
            t_x1 = max(s['bbox'][2] for s in top_spans)
            b_x0 = min(s['bbox'][0] for s in bot_spans)
            b_x1 = max(s['bbox'][2] for s in bot_spans)

            overlap = min(t_x1, b_x1) - max(t_x0, b_x0)
            w_min = min(t_x1 - t_x0, b_x1 - b_x0)
            if w_min > 0 and (overlap / w_min >= 0.35 or overlap > -3):
                return f"({t_txt} / {b_txt})"
        return None

    def _render_line_with_scripts(self, spans: List[Dict[str, Any]]) -> str:
        if not spans:
            return ""

        # Step A: Pre-merge adjacent minus and digit exponents (e.g. '–' followed by '1' or '4')
        merged_spans = []
        skip_idx = set()
        for idx, s in enumerate(spans):
            if idx in skip_idx:
                continue
            if idx + 1 < len(spans):
                next_s = spans[idx + 1]
                t1 = s['text'].strip()
                t2 = next_s['text'].strip()
                if t1 in ['–', '-', '−', '—'] and t2.isdigit() and (next_s['bbox'][0] - s['bbox'][2] <= 8.0):
                    merged_spans.append({
                        'text': f"-{t2}",
                        'bbox': (s['bbox'][0], min(s['bbox'][1], next_s['bbox'][1]), next_s['bbox'][2], max(s['bbox'][3], next_s['bbox'][3])),
                        'size': min(s['size'], next_s['size']),
                        'font': s['font'],
                        'flags': s.get('flags', 0)
                    })
                    skip_idx.add(idx + 1)
                    continue
            merged_spans.append(s)

        spans = merged_spans

        sizes = [s['size'] for s in spans if s['text'].strip()]
        if not sizes:
            return ""
        base_size = sorted(sizes)[len(sizes) // 2]
        base_y_mid = sum((s['bbox'][1] + s['bbox'][3]) / 2.0 for s in spans) / len(spans)

        pieces = []
        for idx, s in enumerate(spans):
            t = s['text']
            sz = s['size']
            y_mid = (s['bbox'][1] + s['bbox'][3]) / 2.0
            flags = s.get('flags', 0)

            clean_t = t
            for k, v in SYMBOL_MAP.items():
                clean_t = clean_t.replace(k, v)

            # Math operators that should never be standalone superscripts
            MATH_OP_WORDS = {'√', '∫', 'lim', 'log', 'ln', 'sin', 'cos', 'tan', 'cot', 'sec', 'cosec', 'dx', 'dy', 'dt', 'Lim', 'Log'}

            is_sup = False
            is_sub = False
            if clean_t not in MATH_OP_WORDS:
                is_sup = bool(flags & 1) or (sz < 0.88 * base_size and y_mid < base_y_mid - 1.5)
                is_sub = (sz < 0.88 * base_size and y_mid > base_y_mid + 1.5)

            if is_sup:
                pieces.append(to_superscript_str(clean_t))
            elif is_sub:
                pieces.append(to_subscript_str(clean_t))
            else:
                pieces.append(clean_t)

        line_text = ""
        for p in pieces:
            if not line_text:
                line_text = p
            elif line_text.endswith((' ', '(', '[', '{', '/', '^', '_', '√')) or p.startswith((' ', ')', ']', '}', ',', '.', ';', ':', '%', '°')):
                line_text += p
            elif re.search(r'[a-zA-Z0-9]$', line_text) and re.match(r'^[a-zA-Z0-9]', p):
                line_text += " " + p
            else:
                line_text += p

        return line_text

    def _post_process_math_text(self, text: str) -> str:
        text = clean_text_symbols(text)
        # Exponent & Subscript Normalization
        # Fix 10^{-}4 -> 10^-4, kJ mol^{-}1 -> kJ mol^-1
        text = re.sub(r'\^?\{?[-–—−]\}\s*(\d+)', r'^-\1', text)
        text = re.sub(r'(\d+)\s*\^?\{?[-–—−](\d+)\}?', r'\1^-\2', text)
        text = re.sub(r'([a-zA-Z]+)\s*\^?\{?[-–—−](\d+)\}?', r'\1^-\2', text)
        text = re.sub(r'(\d+)\s*\^\{\s*(\d+)\s*\}', r'\1^\2', text)
        text = re.sub(r'(\d+)\s*\^?\{?–\}?(\d+)', r'\1^-\2', text)
        text = re.sub(r'K\s*=\s*1\s*[×x*]\s*10\^?\{?[-–—−]\}?(\d+)', r'K = 1 × 10^-\1', text)
        text = re.sub(r'kJ\s+mol\^?\{?[-–—−]\}?(\d+)', r'kJ mol^-\1', text)
        text = re.sub(r'\bK\s*\n?\s*a\b', 'K_a', text)
        text = re.sub(r'\bK\s*\n?\s*b\b', 'K_b', text)
        text = re.sub(r'\bK\s*\n?\s*c\b', 'K_c', text)
        text = re.sub(r'\bK\s*\n?\s*p\b', 'K_p', text)
        text = re.sub(r'\bK\s*3_\{?C\}?', 'K_C', text)
        text = re.sub(r'ℓ\s*n', 'ln', text)
        text = re.sub(r'\bL\s*i\s*m\b', 'lim', text)
        text = re.sub(r'√\s+([0-9a-zA-Z])', r'√\1', text)
        text = re.sub(r'°\s*C\b', '°C', text)
        text = re.sub(r'Fridel\s*[-–—]?\s*Crafts', 'Friedel–Crafts', text)
        text = re.sub(r'Reimer\s*[-–—]?\s*Tiemann', 'Reimer–Tiemann', text)
        text = re.sub(r' +', ' ', text)
        return text
