import json
import re

def clean_opt(val):
    if not val:
        return ""
    val = re.sub(r'Chapter & Topicwise NEET PYQ\'s\d*', '', val)
    val = re.sub(r'\([A-Za-z\s,&–\-]+\)', '', val)
    val = re.sub(r'^[a-d]\.\s*', '', val.strip())
    return val.strip()

with open('public/paper/physics_50_questions.json', 'r', encoding='utf-8') as f:
    physics = json.load(f)

with open('public/paper/chemistry_50_questions.json', 'r', encoding='utf-8') as f:
    chemistry = json.load(f)

with open('public/paper/botany_50_questions.json', 'r', encoding='utf-8') as f:
    botany = json.load(f)

with open('public/paper/zoology_50_questions.json', 'r', encoding='utf-8') as f:
    zoology = json.load(f)

# Clean and normalize
def process_list(q_list, subject):
    processed = []
    for idx, q in enumerate(q_list, 1):
        opts = {}
        for k in ['a', 'b', 'c', 'd']:
            opts[k] = clean_opt(q.get('options', {}).get(k, ''))
            
        processed.append({
            "id": idx,
            "subject": subject,
            "section": f"{subject} Section A" if idx <= 35 else f"{subject} Section B",
            "topic": q.get('topic') or f"{subject} Topic",
            "question": q.get('question', '').strip(),
            "diagram": q.get('diagram'),
            "options": opts,
            "correctAnswer": (q.get('correctAnswer') or 'a').lower()[:1],
            "explanation": q.get('explanation') or "Refer to standard NCERT explanation.",
            "expDiagram": q.get('expDiagram')
        })
    return processed

physics_clean = process_list(physics, "Physics")
chemistry_clean = process_list(chemistry, "Chemistry")
botany_clean = process_list(botany, "Botany")
zoology_clean = process_list(zoology, "Zoology")

with open('public/paper/physics_50_questions.json', 'w', encoding='utf-8') as f:
    json.dump(physics_clean, f, indent=2, ensure_ascii=False)

with open('public/paper/chemistry_50_questions.json', 'w', encoding='utf-8') as f:
    json.dump(chemistry_clean, f, indent=2, ensure_ascii=False)

with open('public/paper/botany_50_questions.json', 'w', encoding='utf-8') as f:
    json.dump(botany_clean, f, indent=2, ensure_ascii=False)

with open('public/paper/zoology_50_questions.json', 'w', encoding='utf-8') as f:
    json.dump(zoology_clean, f, indent=2, ensure_ascii=False)

# Build full 200 question mock
all_200 = []
current_id = 1
for s_name, s_list in [("Physics", physics_clean), ("Chemistry", chemistry_clean), ("Botany", botany_clean), ("Zoology", zoology_clean)]:
    for q in s_list:
        q_copy = dict(q)
        q_copy["id"] = current_id
        q_copy["subId"] = q["id"]
        all_200.append(q_copy)
        current_id += 1

with open('public/paper/neet_all_subjects.json', 'w', encoding='utf-8') as f:
    json.dump(all_200, f, indent=2, ensure_ascii=False)

print(f"Successfully processed:\nPhysics: {len(physics_clean)}\nChemistry: {len(chemistry_clean)}\nBotany: {len(botany_clean)}\nZoology: {len(zoology_clean)}\nTotal NEET 200-Question Paper: {len(all_200)}")
