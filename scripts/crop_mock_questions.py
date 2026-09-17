#!/usr/bin/env python3
"""
crop_mock_questions.py - Automated PDF Question Cropper & Classifier
Extracts questions with diagrams/figures or mathematical/vector notation as 200-DPI PNGs.
Leaves pure conceptual text questions as text.
"""

import os
import re
import sys
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
import pymupdf

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE_DIR = Path(__file__).resolve().parent.parent
PDF_DIR = BASE_DIR / "paper" / "jee mock"
PUBLIC_QUESTIONS_DIR = BASE_DIR / "relay-server" / "public" / "questions"
PUBLIC_QUESTIONS_DIR.mkdir(parents=True, exist_ok=True)


def is_pure_text_question(page: pymupdf.Page, rect: pymupdf.Rect, raw_text: str, options: Dict[str, str]) -> bool:
    """
    Returns True ONLY if the question is pure prose with no diagrams, no drawings, and no math symbols.
    Returns False if it contains diagrams/figures, vectors, or math notation.
    """
    # 1. Check for raster images in the question rect
    for img in page.get_images():
        for r in page.get_image_rects(img[0]):
            if r.intersects(rect) and (r & rect).get_area() > 40:
                return False

    # 2. Check for vector drawings (fraction lines, graphs, circuits, curves)
    for d in page.get_drawings():
        dr = d['rect']
        if dr.intersects(rect):
            # Ignore outer page boundaries and column dividers
            if dr.width > 500 or (dr.width < 1.0 and dr.height > 200) or dr.y0 < 65 or dr.y1 > page.rect.height - 35:
                continue
            if (dr & rect).get_area() > 5 or dr.width > 10:
                return False

    # 3. Check text content for figures, diagrams, or structures
    combined = raw_text + " " + " ".join(str(v) for v in options.values())
    if re.search(r'\b(figure|fig\.|diagram|graph|circuit|shown in|as shown|reaction sequence|structure|pathway)\b', combined, re.IGNORECASE):
        return False

    # 4. Check for vector hats, arrows, and vector notation
    if any(s in combined for s in ['î', 'ĵ', 'k̂', '\u0302', '\u20d7', '→', '−−→']):
        return False
    if re.search(r'[a-zA-Z0-9]\s*[\^ˆ]', combined) or re.search(r'[\^ˆ]\s*[a-zA-Z]', combined):
        return False

    # 5. Check for math symbols, radicals, integrals, matrices, fractions
    if any(s in combined for s in ['√', '∫', '±', '≤', '≥', '≠', '≈', '∞', '⇌', '∑', '∏', 'Δ', 'λ', 'θ', 'α', 'β', 'γ', 'μ', 'ω']):
        return False
    if re.search(r'\([^\)]+/[^\)]+\)', combined) or re.search(r'[\^]\d+', combined) or re.search(r'[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]', combined):
        return False

    return True


def crop_question_bounds(page: pymupdf.Page, rect: pymupdf.Rect, out_path: Path, dpi: int = 200) -> bool:
    """Crops question rect from page at high resolution."""
    try:
        clip_rect = rect & page.rect
        if clip_rect.is_empty or clip_rect.width <= 10 or clip_rect.height <= 10:
            return False
        pix = page.get_pixmap(clip=clip_rect, dpi=dpi)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        pix.save(str(out_path))
        return True
    except Exception as e:
        print(f"Error cropping {out_path}: {e}")
        return False


def build_page_question_crops(doc: pymupdf.Document, p_start: int, p_end: int) -> List[Dict[str, Any]]:
    """
    Scans pages p_start to p_end in 2-column layout and returns a list of question crop descriptors:
    [{'qnum': int, 'page_num': int, 'rect': pymupdf.Rect, 'text': str}]
    """
    crops = []
    for p_idx in range(p_start, p_end):
        p = doc[p_idx]
        col_split = p.rect.width / 2.0
        blocks = p.get_text('blocks')
        
        q_blocks = []
        for b in blocks:
            m = re.match(r'^(\d+)\.', b[4].strip())
            if m and 60 < b[1] < p.rect.height - 35:
                q_blocks.append({
                    'num': int(m.group(1)),
                    'bbox': b[:4],
                    'text': b[4].strip()
                })
        
        left_qs = sorted([q for q in q_blocks if q['bbox'][0] < col_split], key=lambda x: x['bbox'][1])
        right_qs = sorted([q for q in q_blocks if q['bbox'][0] >= col_split], key=lambda x: x['bbox'][1])
        
        def process_col(qs, x0, x1):
            col_results = []
            col_blocks = [b for b in blocks if x0 <= (b[0]+b[2])/2.0 <= x1 and 60 < b[1] < p.rect.height - 35]
            for i, q in enumerate(qs):
                y0 = max(65.0, q['bbox'][1] - 4.0)
                if i + 1 < len(qs):
                    y1 = qs[i+1]['bbox'][1] - 2.0
                else:
                    below_blocks = [b[3] for b in col_blocks if b[1] >= q['bbox'][1] - 2.0]
                    bot_y = max(below_blocks + [q['bbox'][3]])
                    for img in p.get_images():
                        for r in p.get_image_rects(img[0]):
                            if x0 <= (r.x0+r.x1)/2.0 <= x1 and r.y0 >= q['bbox'][1] and r.y1 < p.rect.height - 35:
                                bot_y = max(bot_y, r.y1)
                    y1 = min(p.rect.height - 40.0, bot_y + 8.0)
                
                rect = pymupdf.Rect(x0, y0, x1, y1)
                col_results.append({
                    'num': q['num'],
                    'page_num': p_idx,
                    'rect': rect,
                    'text': q['text']
                })
            return col_results

        crops.extend(process_col(left_qs, 22.0, col_split - 4.0))
        crops.extend(process_col(right_qs, col_split - 4.0, p.rect.width - 20.0))

    return crops


if __name__ == "__main__":
    for m in [1, 2, 3]:
        pdf_file = PDF_DIR / f"jee main mock {m}.pdf"
        doc = pymupdf.open(str(pdf_file))
        crops = build_page_question_crops(doc, 1, 13)
        print(f"Mock {m}: found {len(crops)} crop regions across pages 2-13")
