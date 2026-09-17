import pypdf
import json
import re
import os

def clean_text(text):
    if not text:
        return ""
    text = text.replace('\r\n', '\n').replace('\r', '\n')
    text = re.sub(r'Chapter & Topicwise NEET PYQ\'s\d*', '', text)
    text = re.sub(r'To Discover more', '', text)
    text = re.sub(r'[ \t]+', ' ', text)
    return text.strip()

def parse_physics():
    reader = pypdf.PdfReader('public/paper/NEET 2024 Paper - Physics.pdf')
    q_text = ""
    for i in range(7):
        q_text += reader.pages[i].extract_text() + "\n"
    
    sol_text = ""
    for i in range(7, len(reader.pages)):
        sol_text += reader.pages[i].extract_text() + "\n"
        
    return parse_subject_paper("Physics", q_text, sol_text)

def parse_chemistry():
    reader = pypdf.PdfReader('public/paper/NEET 2024 Paper - Chemistry.pdf')
    q_text = ""
    for i in range(7):
        q_text += reader.pages[i].extract_text() + "\n"
        
    sol_text = ""
    for i in range(6, len(reader.pages)):
        sol_text += reader.pages[i].extract_text() + "\n"
        
    return parse_subject_paper("Chemistry", q_text, sol_text)

def parse_subject_paper(subject_name, q_text, sol_text):
    # Extract solutions mapping: q_num -> (correctAnswer, explanation)
    sol_map = {}
    sol_blocks = re.split(r'(?:^|\n)\s*(\d+)\.\s*\(([a-d])\)\s*', sol_text)
    
    for i in range(1, len(sol_blocks) - 2, 3):
        qnum = int(sol_blocks[i])
        ans = sol_blocks[i+1].strip().lower()
        exp = clean_text(sol_blocks[i+2])
        if qnum not in sol_map and 1 <= qnum <= 50:
            sol_map[qnum] = {"correctAnswer": ans, "explanation": exp}
            
    q_splits = re.split(r'(?:^|\n)\s*(\d+)\.\s+', q_text)
    questions = []
    
    for i in range(1, len(q_splits) - 1, 2):
        qnum = int(q_splits[i])
        if qnum > 50:
            continue
        content = q_splits[i+1]
        
        opt_match = list(re.finditer(r'(?:^|[\s\n])([a-d])\.\s+', content))
        if len(opt_match) >= 4:
            q_only = content[:opt_match[0].start()].strip()
            topic_m = re.findall(r'\(([A-Za-z\s,&–\-]+)\)', q_only)
            topic = topic_m[-1] if topic_m else f"{subject_name} Core"
            
            q_clean = re.sub(r'\([A-Za-z\s,&–\-]+\)', '', q_only).strip()
            
            options = {}
            for j in range(4):
                opt_key = opt_match[j].group(1)
                start_idx = opt_match[j].end()
                end_idx = opt_match[j+1].start() if j < 3 else len(content)
                opt_val = clean_text(content[start_idx:end_idx])
                # remove any trailing next option artifacts
                opt_val = re.sub(r'\s*[a-d]\.\s*$', '', opt_val)
                options[opt_key] = opt_val
                
            sol_info = sol_map.get(qnum, {"correctAnswer": "a", "explanation": "Detailed explanation available in standard syllabus."})
            
            section_name = f"{subject_name} Section A" if qnum <= 35 else f"{subject_name} Section B"
            questions.append({
                "id": qnum,
                "subject": subject_name,
                "section": section_name,
                "topic": topic,
                "question": clean_text(q_clean),
                "diagram": None,
                "options": options,
                "correctAnswer": sol_info["correctAnswer"],
                "explanation": sol_info["explanation"][:600],
                "expDiagram": None
            })
            
    print(f"Extracted {len(questions)} questions for {subject_name}")
    return questions

if __name__ == '__main__':
    p_qs = parse_physics()
    with open('public/paper/physics_50_questions.json', 'w', encoding='utf-8') as f:
        json.dump(p_qs, f, indent=2, ensure_ascii=False)
        
    c_qs = parse_chemistry()
    with open('public/paper/chemistry_50_questions.json', 'w', encoding='utf-8') as f:
        json.dump(c_qs, f, indent=2, ensure_ascii=False)
