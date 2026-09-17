import json
import re
import os

with open('public/paper/physics_50_questions.json', 'r', encoding='utf-8') as f:
    physics_qs = json.load(f)

with open('public/paper/chemistry_50_questions.json', 'r', encoding='utf-8') as f:
    chemistry_qs = json.load(f)

with open('public/paper/botany_50_questions.json', 'r', encoding='utf-8') as f:
    botany_qs = json.load(f)

with open('public/paper/zoology_50_questions.json', 'r', encoding='utf-8') as f:
    zoology_qs = json.load(f)

with open('public/paper/neet_all_subjects.json', 'r', encoding='utf-8') as f:
    all_qs = json.load(f)

# IIT-JEE standard paper without adding any IIT-JEE subjects
iit_qs = []
for idx, q in enumerate(physics_qs[:25] + chemistry_qs[:25], 1):
    c = dict(q)
    c["subject"] = "IIT-JEE"
    c["section"] = "Section 1" if idx <= 35 else "Section 2"
    c["id"] = idx
    iit_qs.append(c)

datasets = {
    "physics": physics_qs,
    "chemistry": chemistry_qs,
    "botany": botany_qs,
    "zoology": zoology_qs,
    "all": all_qs,
    "iit_jee": iit_qs
}

datasets_json = json.dumps(datasets, ensure_ascii=False)

# Read the original build_test_page.py
with open('public/paper/build_test_page.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Locate html template
start_marker = "html_content = '''"
end_marker = "\n'''\n\nwith open('d:/sarvottam/paper/test.html'"

start_idx = content.find(start_marker) + len(start_marker)
end_idx = content.find(end_marker)

html = content[start_idx:end_idx]

# 1. Update Title in Head
html = html.replace(
    "<title>NEET (UG) 2024 — Botany CBT Mock Examination | Sarvottam Institutes</title>",
    "<title>CBT Examination Portal — NEET (UG) & IIT-JEE | Sarvottam Institutes</title>"
)

# 2. Update Topbar
old_topbar_info = '''    <div class="cbt-topbar-info">
      <h1>NEET (UG) 2024 — Botany CBT Examination</h1>
      <small>National Eligibility Cum Entrance Test · Simulated Portal</small>
    </div>'''

new_topbar_info = '''    <div class="cbt-topbar-info">
      <h1 id="examTopbarTitle">NEET (UG) 2024 — CBT Examination</h1>
      <small id="examTopbarSubtitle">National Eligibility Cum Entrance Test · Simulated Portal</small>
    </div>'''

html = html.replace(old_topbar_info, new_topbar_info)

# 3. Update Candidate Pill for Paper Code & Stream
old_paper_code_pill = '''<div class="candidate-pill">Paper Code: <strong>NEET-2024-BOTANY-50</strong></div>'''
new_paper_code_pill = '''<div class="candidate-pill">Stream: <strong id="candidateStreamBadge">NEET (UG)</strong></div>
    <div class="candidate-pill">Subject: <strong id="candidateSubjectBadge">Botany</strong></div>
    <div class="candidate-pill">Paper Code: <strong id="candidatePaperCode">NEET-2024-BOTANY-50</strong></div>'''

html = html.replace(old_paper_code_pill, new_paper_code_pill)

# 4. Update Scorecard Max Score
html = html.replace(
    '''<div class="score-number"><span id="finalScore">0</span> <span style="font-size:1.4rem;color:#cbd5e1;">/ 200</span></div>''',
    '''<div class="score-number"><span id="finalScore">0</span> <span style="font-size:1.4rem;color:#cbd5e1;">/ <span id="finalMaxScore">200</span></span></div>'''
)
html = html.replace(
    '''<p style="font-size:0.85rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--gold-bright);margin-bottom:6px;">NEET 2024 Botany Mock Result</p>''',
    '''<p id="scorecardExamBanner" style="font-size:0.85rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--gold-bright);margin-bottom:6px;">CBT Examination Result</p>'''
)

# 5. Update Confirm Submission Modal Total Qs
html = html.replace(
    '''<tr><td>Total Questions</td><td><strong>50</strong></td></tr>''',
    '''<tr><td>Total Questions</td><td><strong id="modalSummaryTotalQ">50</strong></td></tr>'''
)

# 6. Update Student Details Modal with Stream & Subject Selection
old_modal_header = '''        <span style="font-size:0.72rem;background:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.35);color:#047857;padding:3px 10px;border-radius:50px;font-weight:700;">
          NTA NEET UG 2024 · Verification
        </span>'''

new_modal_header = '''        <span id="modalVerificationBadge" style="font-size:0.72rem;background:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.35);color:#047857;padding:3px 10px;border-radius:50px;font-weight:700;">
          NTA Examination Verification · Session 2024
        </span>'''

html = html.replace(old_modal_header, new_modal_header)

old_form_start = '''    <form id="testStudentDetailsForm" onsubmit="return false;" novalidate>
      <div style="margin-bottom:14px;">
        <label for="testStudentFullName"'''

new_form_start = '''    <form id="testStudentDetailsForm" onsubmit="return false;" novalidate>
      <!-- TARGET STREAM SELECTION: NEET vs IIT-JEE -->
      <div style="margin-bottom:16px;">
        <label style="display:block;font-size:0.82rem;font-weight:700;color:var(--navy);margin-bottom:8px;">
          Select Examination Stream <span style="color:#ef4444;">*</span>
        </label>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          <label id="streamLabelNeet" style="display:flex;align-items:center;gap:8px;padding:11px 12px;border:2px solid #10b981;background:#ecfdf5;border-radius:10px;cursor:pointer;font-weight:700;font-size:0.86rem;color:#065f46;transition:all 0.2s ease;">
            <input type="radio" name="streamChoice" id="streamNeetRadio" value="NEET" checked style="accent-color:#10b981;cursor:pointer;">
            <span>🩺 NEET (UG) 2024</span>
          </label>
          <label id="streamLabelIit" style="display:flex;align-items:center;gap:8px;padding:11px 12px;border:1.5px solid #cbd5e1;background:#f8fafc;border-radius:10px;cursor:pointer;font-weight:700;font-size:0.86rem;color:#475569;transition:all 0.2s ease;">
            <input type="radio" name="streamChoice" id="streamIitRadio" value="IIT" style="accent-color:#2563eb;cursor:pointer;">
            <span>📐 IIT-JEE 2024</span>
          </label>
        </div>
      </div>

      <!-- NEET SUBJECT SELECTION (Shown only when NEET is chosen) -->
      <div id="neetSubjectGroup" style="margin-bottom:16px;">
        <label for="testSubjectSelect" style="display:flex;justify-content:space-between;font-size:0.82rem;font-weight:700;color:var(--navy);margin-bottom:6px;">
          <span>Choose NEET Subject <span style="color:#ef4444;">*</span></span>
          <span style="font-weight:400;font-size:0.75rem;color:#047857;">Physics, Chemistry, Botany, Zoology</span>
        </label>
        <select id="testSubjectSelect" class="cbt-form-input" style="padding:10px 12px;font-size:0.88rem;cursor:pointer;background:#ffffff;border:1.5px solid #cbd5e1;border-radius:8px;width:100%;">
          <option value="physics">⚡ Physics (50 Questions · Section A &amp; B)</option>
          <option value="chemistry">🧪 Chemistry (50 Questions · Section A &amp; B)</option>
          <option value="botany" selected>🌿 Botany (50 Questions · Section A &amp; B)</option>
          <option value="zoology">🐾 Zoology (50 Questions · Section A &amp; B)</option>
          <option value="all">📚 Full NEET Mock (All 4 Subjects · 200 Questions)</option>
        </select>
      </div>

      <!-- IIT-JEE STREAM NOTICE (Shown only when IIT-JEE is chosen - NO subjects added) -->
      <div id="iitNoticeGroup" style="display:none;margin-bottom:16px;background:#eff6ff;border:1.5px solid #bfdbfe;border-radius:10px;padding:12px 14px;font-size:0.82rem;color:#1e40af;line-height:1.45;">
        <div style="font-weight:700;display:flex;align-items:center;gap:6px;">
          <span>📐</span> IIT-JEE Examination Stream Selected
        </div>
        <p style="margin-top:4px;font-size:0.78rem;color:#3b82f6;">
          Standard comprehensive examination paper configured for IIT-JEE candidates.
        </p>
      </div>

      <div style="margin-bottom:14px;">
        <label for="testStudentFullName"'''

html = html.replace(old_form_start, new_form_start)

# 7. Replace Script Logic
old_script_full = html[html.find("<script>"):]

new_script = f'''<script>
const CBT_DATASETS = {datasets_json};

(function initCBTExam() {{
  let CURRENT_DATASET = CBT_DATASETS["botany"];
  let ACTIVE_STREAM = "NEET (UG) 2024";
  let ACTIVE_SUBJECT = "Botany (50 Qs)";
  let ACTIVE_SUBJECT_KEY = "botany";

  const STATE = {{
    currentIndex: 0,
    userAnswers: {{}},
    status: {{}},
    isSubmitted: false,
    isAbruptTerminated: false,
    isTimerStarted: false,
    violationCount: 0,
    activeSection: 'all',
    timerSeconds: 60 * 60,
    studentDetails: null
  }};

  function initQuestionsState(dataset) {{
    CURRENT_DATASET = dataset;
    STATE.currentIndex = 0;
    STATE.userAnswers = {{}};
    STATE.status = {{}};
    CURRENT_DATASET.forEach((q, idx) => {{
      STATE.status[q.id] = idx === 0 ? 'not-answered' : 'not-visited';
    }});
  }}

  // DOM Elements
  const examTopbarTitle = document.getElementById('examTopbarTitle');
  const examTopbarSubtitle = document.getElementById('examTopbarSubtitle');
  const candidateStreamBadge = document.getElementById('candidateStreamBadge');
  const candidateSubjectBadge = document.getElementById('candidateSubjectBadge');
  const candidatePaperCode = document.getElementById('candidatePaperCode');
  const sectionTabsContainer = document.getElementById('sectionTabsContainer');
  const displayQNum = document.getElementById('displayQNum');
  const displayQTopic = document.getElementById('displayQTopic');
  const displayQText = document.getElementById('displayQText');
  const diagramContainer = document.getElementById('diagramContainer');
  const diagramImg = document.getElementById('diagramImg');
  const optionsContainer = document.getElementById('optionsContainer');
  const reviewBox = document.getElementById('reviewBox');
  const reviewStatusBadge = document.getElementById('reviewStatusBadge');
  const reviewCorrectKey = document.getElementById('reviewCorrectKey');
  const reviewCorrectText = document.getElementById('reviewCorrectText');
  const reviewExpText = document.getElementById('reviewExpText');
  const paletteGrid = document.getElementById('paletteGrid');
  const timerDisplay = document.getElementById('timerDisplay');
  const modalFullscreenLock = document.getElementById('modalFullscreenLock');
  const btnResumeFullscreen = document.getElementById('btnResumeFullscreen');
  const lockTimerDisplay = document.getElementById('lockTimerDisplay');
  const lockStudentName = document.getElementById('lockStudentName');

  // Modal elements
  const modalStudentDetails = document.getElementById('modalStudentDetails');
  const btnLaunchExamModal = document.getElementById('btnLaunchExamModal');
  const testStudentAlert = document.getElementById('testStudentFormAlert');
  const inputTestName = document.getElementById('testStudentFullName');
  const inputTestAge = document.getElementById('testStudentAge');
  const inputTestEmail = document.getElementById('testStudentEmail');
  const inputTestPhone = document.getElementById('testStudentPhone');
  const streamNeetRadio = document.getElementById('streamNeetRadio');
  const streamIitRadio = document.getElementById('streamIitRadio');
  const streamLabelNeet = document.getElementById('streamLabelNeet');
  const streamLabelIit = document.getElementById('streamLabelIit');
  const neetSubjectGroup = document.getElementById('neetSubjectGroup');
  const iitNoticeGroup = document.getElementById('iitNoticeGroup');
  const testSubjectSelect = document.getElementById('testSubjectSelect');

  const modalSubmitConfirm = document.getElementById('modalSubmitConfirm');
  const modalScorecard = document.getElementById('modalScorecard');
  const modalInstructions = document.getElementById('modalInstructions');
  const modalQuestionPaper = document.getElementById('modalQuestionPaper');
  const modalViolationWarning = document.getElementById('modalViolationWarning');
  const modalAbruptTermination = document.getElementById('modalAbruptTermination');
  const btnAckWarning = document.getElementById('btnAckWarning');
  const violationCountBadge = document.getElementById('violationCountBadge');
  const proctorStatusPill = document.getElementById('proctorStatusPill');

  // Radio button switch between NEET and IIT-JEE
  function updateStreamUI() {{
    const isNeet = streamNeetRadio.checked;
    if (isNeet) {{
      streamLabelNeet.style.borderColor = '#10b981';
      streamLabelNeet.style.background = '#ecfdf5';
      streamLabelNeet.style.color = '#065f46';
      streamLabelIit.style.borderColor = '#cbd5e1';
      streamLabelIit.style.background = '#f8fafc';
      streamLabelIit.style.color = '#475569';
      neetSubjectGroup.style.display = 'block';
      iitNoticeGroup.style.display = 'none';
    }} else {{
      streamLabelIit.style.borderColor = '#2563eb';
      streamLabelIit.style.background = '#eff6ff';
      streamLabelIit.style.color = '#1e40af';
      streamLabelNeet.style.borderColor = '#cbd5e1';
      streamLabelNeet.style.background = '#f8fafc';
      streamLabelNeet.style.color = '#475569';
      neetSubjectGroup.style.display = 'none';
      iitNoticeGroup.style.display = 'block';
    }}
  }}

  if (streamNeetRadio && streamIitRadio) {{
    streamNeetRadio.addEventListener('change', updateStreamUI);
    streamIitRadio.addEventListener('change', updateStreamUI);
  }}

  // Build Dynamic Section Navigation Tabs
  function buildSectionTabs(stream, subjectKey) {{
    if (!sectionTabsContainer) return;
    sectionTabsContainer.innerHTML = '';

    if (stream.includes('IIT')) {{
      sectionTabsContainer.innerHTML = `
        <button type="button" class="section-tab-btn active" data-sec="all">
          All IIT-JEE Questions <span class="section-tab-badge">50</span>
        </button>
        <button type="button" class="section-tab-btn" data-sec="sec-1">
          Section 1 (Q1–Q35) <span class="section-tab-badge">35</span>
        </button>
        <button type="button" class="section-tab-btn" data-sec="sec-2">
          Section 2 (Q36–Q50) <span class="section-tab-badge">15</span>
        </button>
      `;
    }} else if (subjectKey === 'all') {{
      sectionTabsContainer.innerHTML = `
        <button type="button" class="section-tab-btn active" data-sec="all">
          All NEET Questions <span class="section-tab-badge">200</span>
        </button>
        <button type="button" class="section-tab-btn" data-sec="physics">
          ⚡ Physics (Q1–Q50) <span class="section-tab-badge">50</span>
        </button>
        <button type="button" class="section-tab-btn" data-sec="chemistry">
          🧪 Chemistry (Q51–Q100) <span class="section-tab-badge">50</span>
        </button>
        <button type="button" class="section-tab-btn" data-sec="botany">
          🌿 Botany (Q101–Q150) <span class="section-tab-badge">50</span>
        </button>
        <button type="button" class="section-tab-btn" data-sec="zoology">
          🐾 Zoology (Q151–Q200) <span class="section-tab-badge">50</span>
        </button>
      `;
    }} else {{
      const subTitle = subjectKey.charAt(0).toUpperCase() + subjectKey.slice(1);
      sectionTabsContainer.innerHTML = `
        <button type="button" class="section-tab-btn active" data-sec="all">
          All ${{subTitle}} Questions <span class="section-tab-badge">50</span>
        </button>
        <button type="button" class="section-tab-btn" data-sec="sec-a">
          ${{subTitle}} Section A (Q1–Q35) <span class="section-tab-badge">35</span>
        </button>
        <button type="button" class="section-tab-btn" data-sec="sec-b">
          ${{subTitle}} Section B (Q36–Q50) <span class="section-tab-badge">15</span>
        </button>
      `;
    }}

    // Bind tab clicks
    sectionTabsContainer.querySelectorAll('.section-tab-btn').forEach(btn => {{
      btn.addEventListener('click', () => {{
        sectionTabsContainer.querySelectorAll('.section-tab-btn').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        STATE.activeSection = btn.dataset.sec;

        let targetIdx = 0;
        if (btn.dataset.sec === 'sec-b' || btn.dataset.sec === 'sec-2') targetIdx = 35;
        else if (btn.dataset.sec === 'chemistry') targetIdx = 50;
        else if (btn.dataset.sec === 'botany') targetIdx = 100;
        else if (btn.dataset.sec === 'zoology') targetIdx = 150;

        loadQuestion(targetIdx);
      }});
    }});
  }}

  // Telemetry Dispatch to Next.js API
  function sendExamTelemetry(action, extra = {{}}) {{
    try {{
      const s = STATE.studentDetails;
      if (!s || !s.fullName) return;
      const cleanPhone = String(s.phone || '').replace(/[\\+\\-\\s\\(\\)]/g, '');
      const rollPrefix = (s.stream && s.stream.includes('IIT')) ? 'JEE2024-' : 'NEET2024-';
      const rollNo = rollPrefix + (s.age || '180506') + '-' + (cleanPhone.slice(-4) || '0881');
      const payload = {{
        action: action,
        fullName: s.fullName,
        age: s.age,
        email: s.email,
        phone: cleanPhone,
        rollNo: rollNo,
        stream: s.stream || ACTIVE_STREAM,
        subject: s.subject || ACTIVE_SUBJECT,
        proctorFlags: STATE.violationCount || 0,
        ...extra
      }};

      let telemetryUrl = '/api/cbt/telemetry';
      if (typeof window !== 'undefined' && window.location && window.location.protocol.startsWith('http')) {{
        telemetryUrl = window.location.origin + '/api/cbt/telemetry';
      }} else {{
        telemetryUrl = 'http://localhost:3001/api/cbt/telemetry';
      }}

      fetch(telemetryUrl, {{
        method: 'POST',
        headers: {{ 'Content-Type': 'application/json' }},
        body: JSON.stringify(payload),
        keepalive: true
      }}).catch(() => {{}});
    }} catch(e) {{}}
  }}

  // Timer Countdown Logic
  let timerInterval = null;
  function updateTimerDisplays(sec) {{
    const h = String(Math.floor(sec / 3600)).padStart(2, '0');
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    const formatted = `${{h}}:${{m}}:${{s}}`;
    if (timerDisplay) timerDisplay.textContent = formatted;
    if (lockTimerDisplay) lockTimerDisplay.textContent = formatted;
    if (sec < 600 && timerDisplay) timerDisplay.classList.add('warning');
  }}

  function startExamCountdown() {{
    if (!STATE.isTimerStarted && !STATE.isSubmitted && !STATE.isAbruptTerminated) {{
      STATE.isTimerStarted = true;
      startTimer();
      sendExamTelemetry('start_exam', {{ status: 'LIVE_TESTING' }});
    }}
  }}

  function startTimer() {{
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {{
      if (STATE.isSubmitted || STATE.isAbruptTerminated) {{
        clearInterval(timerInterval);
        return;
      }}
      if (STATE.timerSeconds > 0) {{
        STATE.timerSeconds--;
        updateTimerDisplays(STATE.timerSeconds);
      }} else {{
        clearInterval(timerInterval);
        alert("Exam time has elapsed! Auto-submitting responses.");
        submitFinalTest();
      }}
    }}, 1000);
  }}

  function enterExamFullscreen() {{
    const elem = document.documentElement;
    const req = elem.requestFullscreen || elem.webkitRequestFullscreen || elem.mozRequestFullScreen || elem.msRequestFullscreen;
    if (req) {{
      try {{ req.call(elem); }} catch(e) {{}}
    }}
  }}

  function exitExamFullscreen() {{
    const ext = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
    if (ext && document.fullscreenElement) {{
      try {{ ext.call(document); }} catch(e) {{}}
    }}
  }}

  // Apply Candidate Configuration & Question Dataset
  function applyCandidateSession(student) {{
    if (!student) return;
    STATE.studentDetails = student;

    ACTIVE_STREAM = student.stream || "NEET (UG) 2024";
    ACTIVE_SUBJECT = student.subject || "Botany (50 Qs)";
    ACTIVE_SUBJECT_KEY = student.subjectKey || "botany";

    const dataset = CBT_DATASETS[ACTIVE_SUBJECT_KEY] || CBT_DATASETS["botany"];
    initQuestionsState(dataset);

    // Update Topbar
    if (examTopbarTitle) {{
      if (ACTIVE_STREAM.includes('IIT')) {{
        examTopbarTitle.textContent = "IIT-JEE 2024 — Standard Examination";
      }} else if (ACTIVE_SUBJECT_KEY === 'all') {{
        examTopbarTitle.textContent = "NEET (UG) 2024 — Comprehensive (4 Subjects) CBT Mock";
      }} else {{
        const subUpper = ACTIVE_SUBJECT_KEY.charAt(0).toUpperCase() + ACTIVE_SUBJECT_KEY.slice(1);
        examTopbarTitle.textContent = `NEET (UG) 2024 — ${{subUpper}} CBT Examination`;
      }}
    }}

    if (examTopbarSubtitle) {{
      examTopbarSubtitle.textContent = ACTIVE_STREAM.includes('IIT')
        ? "Joint Entrance Examination (Main & Advanced) · Simulated Portal"
        : "National Eligibility Cum Entrance Test · Simulated Portal";
    }}

    // Update candidate pill badges
    if (candidateStreamBadge) candidateStreamBadge.textContent = ACTIVE_STREAM;
    if (candidateSubjectBadge) candidateSubjectBadge.textContent = ACTIVE_SUBJECT;
    if (candidatePaperCode) {{
      if (ACTIVE_STREAM.includes('IIT')) candidatePaperCode.textContent = "JEE-2024-STD-50";
      else if (ACTIVE_SUBJECT_KEY === 'all') candidatePaperCode.textContent = "NEET-2024-ALL-200";
      else candidatePaperCode.textContent = `NEET-2024-${{ACTIVE_SUBJECT_KEY.toUpperCase()}}-50`;
    }}

    const candidateName = document.getElementById('candidateName');
    const candidateAvatar = document.getElementById('candidateAvatar');
    const candidateRollNo = document.getElementById('candidateRollNo');
    const candidateAgePill = document.getElementById('candidateAgePill');
    const candidateAge = document.getElementById('candidateAge');

    if (candidateName) candidateName.textContent = student.fullName;
    if (candidateAvatar) candidateAvatar.textContent = student.fullName.charAt(0).toUpperCase();
    const rollPrefix = ACTIVE_STREAM.includes('IIT') ? 'JEE2024-' : 'NEET2024-';
    const rollStr = rollPrefix + (student.age || '180506') + '-' + (student.phone ? student.phone.slice(-4) : '0881');
    if (candidateRollNo) candidateRollNo.textContent = rollStr;
    if (candidateAgePill && candidateAge) {{
      candidateAge.textContent = student.age;
      candidateAgePill.style.display = 'inline-flex';
    }}

    if (lockStudentName) lockStudentName.textContent = student.fullName;

    // Scorecard strip
    const sn = document.getElementById('scorecardStudentName');
    const sa = document.getElementById('scorecardStudentAge');
    const se = document.getElementById('scorecardStudentEmail');
    const sp = document.getElementById('scorecardStudentPhone');
    if (sn) sn.textContent = student.fullName;
    if (sa) sa.textContent = student.age;
    if (se) se.textContent = student.email;
    if (sp) sp.textContent = student.phone;

    // Build Tabs & Load Question 0
    buildSectionTabs(ACTIVE_STREAM, ACTIVE_SUBJECT_KEY);
    loadQuestion(0);

    sendExamTelemetry('register', {{ status: 'LIVE_TESTING' }});
  }}

  function validateAgeDDMMYY(val) {{
    if (!val) return false;
    const clean = val.replace(/[\\/\\-\\s]/g, '');
    if (clean.length !== 6 && clean.length !== 8) return false;
    const d = parseInt(clean.slice(0, 2), 10);
    const m = parseInt(clean.slice(2, 4), 10);
    return !(isNaN(d) || d < 1 || d > 31 || isNaN(m) || m < 1 || m > 12);
  }}

  function showTestStudentError(msg, el) {{
    if (testStudentAlert) {{
      testStudentAlert.textContent = msg;
      testStudentAlert.style.display = 'block';
    }}
    if (el) {{
      el.classList.add('input-error');
      el.focus();
    }}
  }}

  // Launch Exam from Modal
  if (btnLaunchExamModal) {{
    btnLaunchExamModal.addEventListener('click', () => {{
      if (testStudentAlert) testStudentAlert.style.display = 'none';
      [inputTestName, inputTestAge, inputTestEmail, inputTestPhone].forEach(i => i && i.classList.remove('input-error'));

      const fn = inputTestName ? inputTestName.value.trim() : '';
      const ag = inputTestAge ? inputTestAge.value.trim() : '';
      const em = inputTestEmail ? inputTestEmail.value.trim() : '';
      const ph = inputTestPhone ? inputTestPhone.value.trim() : '';

      if (!fn || fn.length < 2) {{
        showTestStudentError("Please enter the student's full name.", inputTestName);
        return;
      }}
      if (!validateAgeDDMMYY(ag)) {{
        showTestStudentError('Please enter DOB in DDMMYY format (e.g. 180506).', inputTestAge);
        return;
      }}
      const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
      if (!em || !emailRegex.test(em)) {{
        showTestStudentError('Please enter a valid email address.', inputTestEmail);
        return;
      }}
      const cleanPhone = ph.replace(/[\\+\\-\\s\\(\\)]/g, '');
      if (!cleanPhone || !/^\\d{{10}}$/.test(cleanPhone)) {{
        showTestStudentError('Please enter a valid 10-digit mobile phone number.', inputTestPhone);
        return;
      }}

      const isIit = streamIitRadio && streamIitRadio.checked;
      let streamName = isIit ? "IIT-JEE 2024" : "NEET (UG) 2024";
      let subjectKey = "botany";
      let subjectName = "Botany (50 Qs)";

      if (isIit) {{
        // No subjects for IIT-JEE per user prompt ("DONT ADD SUBJECTTS OF IIT JEE JUST A DIFFERENT OPTION")
        subjectKey = "iit_jee";
        subjectName = "IIT-JEE Standard Paper";
      }} else {{
        subjectKey = testSubjectSelect ? testSubjectSelect.value : "botany";
        if (subjectKey === 'physics') subjectName = "Physics (50 Qs)";
        else if (subjectKey === 'chemistry') subjectName = "Chemistry (50 Qs)";
        else if (subjectKey === 'botany') subjectName = "Botany (50 Qs)";
        else if (subjectKey === 'zoology') subjectName = "Zoology (50 Qs)";
        else if (subjectKey === 'all') subjectName = "Full NEET Mock (200 Qs)";
      }}

      const studentData = {{
        fullName: fn,
        age: ag,
        email: em,
        phone: cleanPhone,
        stream: streamName,
        subject: subjectName,
        subjectKey: subjectKey,
        registeredAt: new Date().toISOString()
      }};

      try {{
        localStorage.setItem('sarvottam_cbt_student', JSON.stringify(studentData));
        sessionStorage.setItem('sarvottam_cbt_student', JSON.stringify(studentData));
      }} catch(e){{}}

      applyCandidateSession(studentData);

      if (modalStudentDetails) modalStudentDetails.classList.remove('open');
      if (modalFullscreenLock) modalFullscreenLock.classList.add('open');
    }});
  }}

  if (btnResumeFullscreen) {{
    btnResumeFullscreen.addEventListener('click', (e) => {{
      e.stopPropagation();
      enterExamFullscreen();
      startExamCountdown();
      if (modalFullscreenLock) modalFullscreenLock.classList.remove('open');
      if (STATE.violationCount === 1 && modalViolationWarning) modalViolationWarning.classList.add('open');
    }});
  }}

  // Check saved student
  let savedStudent = null;
  try {{
    const raw = localStorage.getItem('sarvottam_cbt_student') || sessionStorage.getItem('sarvottam_cbt_student');
    if (raw) savedStudent = JSON.parse(raw);
  }} catch(e){{}}

  if (savedStudent && savedStudent.fullName) {{
    applyCandidateSession(savedStudent);
    if (modalFullscreenLock) modalFullscreenLock.classList.add('open');
  }} else {{
    if (modalStudentDetails) modalStudentDetails.classList.add('open');
  }}

  // Render question
  function loadQuestion(index) {{
    if (!CURRENT_DATASET || index < 0 || index >= CURRENT_DATASET.length) return;
    STATE.currentIndex = index;
    const q = CURRENT_DATASET[index];

    if (STATE.status[q.id] === 'not-visited' && !STATE.isSubmitted) {{
      STATE.status[q.id] = 'not-answered';
    }}

    displayQNum.textContent = `Question No. ${{q.id}} (${{q.section || 'General'}})`;
    displayQTopic.textContent = q.topic || 'General Topic';
    displayQText.textContent = q.question;

    if (q.diagram) {{
      diagramImg.src = q.diagram;
      diagramContainer.style.display = 'block';
    }} else {{
      diagramContainer.style.display = 'none';
    }}

    optionsContainer.innerHTML = '';
    const chosen = STATE.userAnswers[q.id];
    const correctChoice = q.correctAnswer ? q.correctAnswer.toLowerCase() : 'a';

    ['a', 'b', 'c', 'd'].forEach((optKey) => {{
      const optText = (q.options && q.options[optKey]) || '';
      const card = document.createElement('div');
      card.className = 'cbt-option-card' + (chosen === optKey ? ' selected' : '');

      if (STATE.isSubmitted) {{
        if (optKey === correctChoice) card.classList.add('is-correct');
        if (chosen === optKey && optKey !== correctChoice) card.classList.add('is-incorrect');
      }}

      card.innerHTML = `
        <div class="cbt-radio-custom"></div>
        <span class="cbt-opt-key">(${{optKey.toUpperCase()}})</span>
        <span class="cbt-opt-text">${{optText}}</span>
        ${{STATE.isSubmitted && optKey === correctChoice ? '<span style="font-size:0.72rem;background:#16a34a;color:#fff;padding:2px 8px;border-radius:4px;font-weight:700;margin-left:auto;">CORRECT</span>' : ''}}
        ${{STATE.isSubmitted && chosen === optKey && optKey !== correctChoice ? '<span style="font-size:0.72rem;background:#ef4444;color:#fff;padding:2px 8px;border-radius:4px;font-weight:700;margin-left:auto;">YOUR CHOICE</span>' : ''}}
      `;

      if (!STATE.isSubmitted) {{
        card.addEventListener('click', () => {{
          optionsContainer.querySelectorAll('.cbt-option-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          STATE.userAnswers[q.id] = optKey;
        }});
      }}
      optionsContainer.appendChild(card);
    }});

    // Review mode
    if (STATE.isSubmitted) {{
      reviewBox.style.display = 'block';
      const userChoice = STATE.userAnswers[q.id];
      if (reviewCorrectKey) reviewCorrectKey.textContent = correctChoice.toUpperCase();
      if (reviewCorrectText) reviewCorrectText.textContent = (q.options && q.options[correctChoice]) || '';
      if (reviewExpText) reviewExpText.textContent = q.explanation || 'Refer to standard syllabus and NCERT reference.';

      const expDiagWrap = document.getElementById('reviewExpDiagramWrap');
      const expDiagImg = document.getElementById('reviewExpDiagramImg');
      if (q.expDiagram) {{
        if (expDiagImg) expDiagImg.src = q.expDiagram;
        if (expDiagWrap) expDiagWrap.style.display = 'block';
      }} else if (expDiagWrap) {{
        expDiagWrap.style.display = 'none';
      }}

      if (!userChoice) {{
        reviewStatusBadge.className = 'review-status-badge unattempted';
        reviewStatusBadge.textContent = 'NOT ATTEMPTED (0 Marks)';
      }} else if (userChoice.toLowerCase() === correctChoice) {{
        reviewStatusBadge.className = 'review-status-badge correct';
        reviewStatusBadge.textContent = 'CORRECT (+4 Marks)';
      }} else {{
        reviewStatusBadge.className = 'review-status-badge wrong';
        reviewStatusBadge.textContent = `INCORRECT (-1 Mark) — You Chose: (${{userChoice.toUpperCase()}})`;
      }}
    }} else {{
      reviewBox.style.display = 'none';
    }}

    updatePaletteUI();
    const scrollArea = document.getElementById('qScrollArea');
    if (scrollArea) scrollArea.scrollTop = 0;
  }}

  // Update Palette UI
  function updatePaletteUI() {{
    if (!CURRENT_DATASET) return;
    let answered = 0, notAnswered = 0, notVisited = 0, markedReview = 0, ansReview = 0;

    CURRENT_DATASET.forEach((q) => {{
      const st = STATE.status[q.id];
      if (st === 'answered') answered++;
      else if (st === 'not-answered') notAnswered++;
      else if (st === 'not-visited') notVisited++;
      else if (st === 'marked-review') markedReview++;
      else if (st === 'ans-review') ansReview++;
    }});

    const elAns = document.getElementById('countAnswered');
    const elNotAns = document.getElementById('countNotAnswered');
    const elNotVis = document.getElementById('countNotVisited');
    const elMarked = document.getElementById('countMarkedReview');
    const elAnsRev = document.getElementById('countAnsReview');
    if (elAns) elAns.textContent = answered;
    if (elNotAns) elNotAns.textContent = notAnswered;
    if (elNotVis) elNotVis.textContent = notVisited;
    if (elMarked) elMarked.textContent = markedReview;
    if (elAnsRev) elAnsRev.textContent = ansReview;

    paletteGrid.innerHTML = '';
    let visibleCount = 0;

    CURRENT_DATASET.forEach((q, idx) => {{
      let isVisible = true;
      if (STATE.activeSection === 'sec-a' && (q.id < 1 || q.id > 35)) isVisible = false;
      if (STATE.activeSection === 'sec-b' && (q.id < 36 || q.id > 50)) isVisible = false;
      if (STATE.activeSection === 'physics' && (q.id < 1 || q.id > 50)) isVisible = false;
      if (STATE.activeSection === 'chemistry' && (q.id < 51 || q.id > 100)) isVisible = false;
      if (STATE.activeSection === 'botany' && (q.id < 101 || q.id > 150)) isVisible = false;
      if (STATE.activeSection === 'zoology' && (q.id < 151 || q.id > 200)) isVisible = false;

      if (isVisible) {{
        visibleCount++;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `q-palette-btn ${{STATE.status[q.id] || 'not-visited'}}` + (STATE.currentIndex === idx ? ' current' : '');
        btn.textContent = q.id;
        btn.addEventListener('click', () => {{
          const curQ = CURRENT_DATASET[STATE.currentIndex];
          if (STATE.userAnswers[curQ.id] && !STATE.isSubmitted) {{
            if (STATE.status[curQ.id] !== 'ans-review' && STATE.status[curQ.id] !== 'marked-review') {{
              STATE.status[curQ.id] = 'answered';
            }}
          }}
          loadQuestion(idx);
        }});
        paletteGrid.appendChild(btn);
      }}
    }});

    const elFilterCount = document.getElementById('paletteFilteredCount');
    if (elFilterCount) elFilterCount.textContent = visibleCount;
  }}

  // Action Buttons
  document.getElementById('btnSaveNext').addEventListener('click', () => {{
    const q = CURRENT_DATASET[STATE.currentIndex];
    if (STATE.userAnswers[q.id]) STATE.status[q.id] = 'answered';
    else STATE.status[q.id] = 'not-answered';
    if (STATE.currentIndex < CURRENT_DATASET.length - 1) loadQuestion(STATE.currentIndex + 1);
    else updatePaletteUI();
  }});

  document.getElementById('btnSaveReview').addEventListener('click', () => {{
    const q = CURRENT_DATASET[STATE.currentIndex];
    if (STATE.userAnswers[q.id]) STATE.status[q.id] = 'ans-review';
    else STATE.status[q.id] = 'marked-review';
    if (STATE.currentIndex < CURRENT_DATASET.length - 1) loadQuestion(STATE.currentIndex + 1);
    else updatePaletteUI();
  }});

  document.getElementById('btnReviewNext').addEventListener('click', () => {{
    const q = CURRENT_DATASET[STATE.currentIndex];
    if (STATE.userAnswers[q.id]) STATE.status[q.id] = 'ans-review';
    else STATE.status[q.id] = 'marked-review';
    if (STATE.currentIndex < CURRENT_DATASET.length - 1) loadQuestion(STATE.currentIndex + 1);
    else updatePaletteUI();
  }});

  document.getElementById('btnClearResp').addEventListener('click', () => {{
    const q = CURRENT_DATASET[STATE.currentIndex];
    delete STATE.userAnswers[q.id];
    STATE.status[q.id] = 'not-answered';
    loadQuestion(STATE.currentIndex);
  }});

  document.getElementById('btnPrevQ').addEventListener('click', () => {{
    if (STATE.currentIndex > 0) loadQuestion(STATE.currentIndex - 1);
  }});

  document.getElementById('btnNextQ').addEventListener('click', () => {{
    if (STATE.currentIndex < CURRENT_DATASET.length - 1) loadQuestion(STATE.currentIndex + 1);
  }});

  const btnResetFilter = document.getElementById('btnResetFilter');
  if (btnResetFilter) {{
    btnResetFilter.addEventListener('click', () => {{
      if (sectionTabsContainer) {{
        sectionTabsContainer.querySelectorAll('.section-tab-btn').forEach(t => t.classList.remove('active'));
        const first = sectionTabsContainer.querySelector('.section-tab-btn');
        if (first) first.classList.add('active');
      }}
      STATE.activeSection = 'all';
      updatePaletteUI();
    }});
  }}

  // Submissions
  document.getElementById('btnSubmitExam').addEventListener('click', () => {{
    let answered = 0, notAnswered = 0, notVisited = 0, markedReview = 0;
    CURRENT_DATASET.forEach((q) => {{
      const st = STATE.status[q.id];
      if (st === 'answered' || st === 'ans-review') answered++;
      else if (st === 'not-answered') notAnswered++;
      else if (st === 'not-visited') notVisited++;
      else if (st === 'marked-review') markedReview++;
    }});

    const modalSummaryTotalQ = document.getElementById('modalSummaryTotalQ');
    if (modalSummaryTotalQ) modalSummaryTotalQ.textContent = CURRENT_DATASET.length;
    document.getElementById('modalCountAns').textContent = answered;
    document.getElementById('modalCountNotAns').textContent = notAnswered;
    document.getElementById('modalCountRev').textContent = markedReview;
    document.getElementById('modalCountNotVis').textContent = notVisited;

    modalSubmitConfirm.classList.add('open');
  }});

  document.getElementById('btnResumeTest').addEventListener('click', () => {{
    modalSubmitConfirm.classList.remove('open');
  }});

  document.getElementById('btnFinalSubmit').addEventListener('click', () => {{
    modalSubmitConfirm.classList.remove('open');
    submitFinalTest();
  }});

  function submitFinalTest() {{
    STATE.isSubmitted = true;
    clearInterval(timerInterval);
    window.onbeforeunload = null;
    if (modalFullscreenLock) modalFullscreenLock.classList.remove('open');
    exitExamFullscreen();

    let correct = 0;
    let wrong = 0;
    let unattempted = 0;

    CURRENT_DATASET.forEach((q) => {{
      const userAns = STATE.userAnswers[q.id];
      const correctChoice = q.correctAnswer ? q.correctAnswer.toLowerCase() : 'a';
      if (!userAns) unattempted++;
      else if (userAns.toLowerCase() === correctChoice) correct++;
      else wrong++;
    }});

    const score = (correct * 4) - (wrong * 1);
    const maxScore = CURRENT_DATASET.length === 200 ? 720 : (ACTIVE_STREAM.includes('IIT') ? 300 : 200);

    document.getElementById('finalScore').textContent = score;
    const finalMaxScore = document.getElementById('finalMaxScore');
    if (finalMaxScore) finalMaxScore.textContent = maxScore;

    document.getElementById('finalCorrect').textContent = correct;
    document.getElementById('finalWrong').textContent = wrong;
    document.getElementById('finalUnatt').textContent = unattempted;

    const scorecardExamBanner = document.getElementById('scorecardExamBanner');
    if (scorecardExamBanner) {{
      scorecardExamBanner.textContent = `${{ACTIVE_STREAM}} · ${{ACTIVE_SUBJECT}} RESULT`;
    }}

    modalScorecard.classList.add('open');

    // Show return home buttons in footer & sidebar
    const btnFooterReturnHome = document.getElementById('btnFooterReturnHome');
    const btnSidebarReturnHome = document.getElementById('btnSidebarReturnHome');
    const examLiveActionGroup = document.getElementById('examLiveActionGroup');
    const examReviewActionGroup = document.getElementById('examReviewActionGroup');
    if (examLiveActionGroup) examLiveActionGroup.style.display = 'none';
    if (examReviewActionGroup) examReviewActionGroup.style.display = 'flex';
    if (btnSidebarReturnHome) btnSidebarReturnHome.style.display = 'block';

    sendExamTelemetry('submit_exam', {{
      status: 'COMPLETED',
      score: score,
      correct: correct,
      wrong: wrong,
      unattempted: unattempted
    }});
  }}

  document.getElementById('btnReviewSolutions').addEventListener('click', () => {{
    modalScorecard.classList.remove('open');
    loadQuestion(0);
  }});

  document.getElementById('btnRetakeTest').addEventListener('click', () => {{
    if (confirm('Reset answers and retake test?')) {{
      try {{
        localStorage.removeItem('sarvottam_cbt_student');
        sessionStorage.removeItem('sarvottam_cbt_student');
      }} catch(e){{}}
      location.reload();
    }}
  }});

  // Question Paper Modal View
  const fullPaperContainer = document.getElementById('fullPaperContainer');
  document.getElementById('btnQuestionPaper').addEventListener('click', () => {{
    if (!fullPaperContainer || !CURRENT_DATASET) return;
    fullPaperContainer.innerHTML = '';
    CURRENT_DATASET.forEach((q) => {{
      const qBox = document.createElement('div');
      qBox.style.padding = '14px 0';
      qBox.style.borderBottom = '1px solid #e2e8f0';

      let optsHtml = '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-top:8px;font-size:0.86rem;color:#475569;">';
      ['a', 'b', 'c', 'd'].forEach(k => {{
        const letterLabel = `(${{k.toUpperCase()}})`;
        optsHtml += `<div><strong>${{letterLabel}}</strong> ${{q.options ? q.options[k] || '' : ''}}</div>`;
      }});
      optsHtml += '</div>';

      let diagHtml = '';
      if (q.diagram) {{
        diagHtml = `<div style="margin:8px 0;"><img src="${{q.diagram}}" style="max-height:160px;border-radius:6px;border:1px solid #cbd5e1;"></div>`;
      }}

      qBox.innerHTML = `
        <div style="font-weight:700;color:var(--navy);font-size:0.92rem;">Q${{q.id}}. [${{q.section || 'General'}}] ${{q.topic || ''}}</div>
        <div style="margin-top:6px;font-size:0.92rem;line-height:1.5;">${{q.question}}</div>
        ${{diagHtml}}
        ${{optsHtml}}
      `;
      fullPaperContainer.appendChild(qBox);
    }});
    modalQuestionPaper.classList.add('open');
  }});

  document.getElementById('btnClosePaperView').addEventListener('click', () => {{
    modalQuestionPaper.classList.remove('open');
  }});

  document.getElementById('btnViewInstructions').addEventListener('click', () => {{
    modalInstructions.classList.add('open');
  }});
  document.getElementById('btnCloseInstructions').addEventListener('click', () => {{
    modalInstructions.classList.remove('open');
  }});

  [modalSubmitConfirm, modalScorecard, modalInstructions, modalQuestionPaper].forEach(m => {{
    if (m) {{
      m.addEventListener('click', (e) => {{
        if (e.target === m && m !== modalScorecard) m.classList.remove('open');
      }});
    }}
  }});

  // AI Proctoring: tab visibility switch detection
  document.addEventListener('visibilitychange', () => {{
    if (document.hidden && STATE.isTimerStarted && !STATE.isSubmitted && !STATE.isAbruptTerminated) {{
      STATE.violationCount++;
      if (violationCountBadge) violationCountBadge.textContent = STATE.violationCount;
      sendExamTelemetry('proctor_warning', {{ proctorFlags: STATE.violationCount }});

      if (STATE.violationCount === 1) {{
        if (modalViolationWarning) modalViolationWarning.classList.add('open');
      }} else if (STATE.violationCount >= 2) {{
        STATE.isAbruptTerminated = true;
        clearInterval(timerInterval);
        if (modalViolationWarning) modalViolationWarning.classList.remove('open');
        if (modalFullscreenLock) modalFullscreenLock.classList.remove('open');
        if (modalAbruptTermination) modalAbruptTermination.classList.add('open');
        sendExamTelemetry('abrupt_terminate', {{ status: 'DISQUALIFIED_ABRUPT', proctorFlags: STATE.violationCount }});
      }}
    }}
  }});

  if (btnAckWarning) {{
    btnAckWarning.addEventListener('click', () => {{
      if (modalViolationWarning) modalViolationWarning.classList.remove('open');
      enterExamFullscreen();
    }});
  }}

  // Initial Load
  initQuestionsState(CBT_DATASETS["botany"]);
  updateTimerDisplays(STATE.timerSeconds);
  buildSectionTabs("NEET (UG) 2024", "botany");
  loadQuestion(0);
}})();
</script>
</body>
</html>
'''

full_html = html[:html.find("<script>")] + new_script

# Write to test.html, index.html, and test/index.html
with open('public/paper/test.html', 'w', encoding='utf-8') as f:
    f.write(full_html)

with open('public/paper/index.html', 'w', encoding='utf-8') as f:
    f.write(full_html)

deep_html = full_html.replace('../sarvottam-hero.html', '../../sarvottam-hero.html')
with open('public/paper/test/index.html', 'w', encoding='utf-8') as f:
    f.write(deep_html)

print("Successfully generated updated public/paper/test.html, index.html, and test/index.html!")
print("HTML Size:", len(full_html))
