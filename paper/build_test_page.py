import json

with open('d:/sarvottam/paper/botany_50_questions.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

json_str = json.dumps(questions, ensure_ascii=False)

html_content = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>NEET (UG) 2024 — Botany CBT Mock Examination | Sarvottam Institutes</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Montserrat:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
<style>
  :root {
    --navy-dark: #071326;
    --navy: #0e1f3d;
    --navy-mid: #17325e;
    --gold: #c9982a;
    --gold-bright: #e0ac3d;
    --gold-light: rgba(201, 152, 42, 0.1);
    --gold-border: rgba(201, 152, 42, 0.4);
    --bg-page: #f1f5f9;
    --bg-card: #ffffff;
    --text-main: #1e293b;
    --text-muted: #64748b;
    --border-color: #cbd5e1;

    /* NTA Official CBT Colors */
    --cbt-green: #22c55e;
    --cbt-green-dark: #16a34a;
    --cbt-red: #ef4444;
    --cbt-purple: #8b5cf6;
    --cbt-silver: #94a3b8;
    --cbt-silver-bg: #f8fafc;
  }

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    -webkit-user-select: none !important;
    -moz-user-select: none !important;
    -ms-user-select: none !important;
    user-select: none !important;
  }

  body, html {
    font-family: 'Montserrat', sans-serif;
    background: var(--bg-page);
    color: var(--text-main);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
    -webkit-user-select: none !important;
    -moz-user-select: none !important;
    -ms-user-select: none !important;
    user-select: none !important;
    -webkit-touch-callout: none !important;
  }

  img {
    pointer-events: none;
    -webkit-user-drag: none;
    user-select: none;
  }

  /* ---------- TOP NAVBAR ---------- */
  .cbt-topbar {
    background: var(--navy);
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 20px;
    border-bottom: 3px solid var(--gold);
    box-shadow: 0 4px 16px rgba(7, 19, 38, 0.15);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .cbt-topbar-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
    color: #ffffff;
  }

  .cbt-topbar-brand .badge-mark {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: linear-gradient(135deg, var(--gold-bright), var(--gold));
    color: var(--navy-dark);
    font-family: 'Poppins', sans-serif;
    font-weight: 800;
    font-size: 1.15rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .cbt-topbar-info h1 {
    font-family: 'Poppins', sans-serif;
    font-size: 0.95rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    color: #ffffff;
  }

  .cbt-topbar-info small {
    font-size: 0.72rem;
    color: var(--gold-bright);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .cbt-topbar-center {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .cbt-timer-wrap {
    background: rgba(0, 0, 0, 0.35);
    border: 1.5px solid var(--gold-border);
    padding: 6px 16px;
    border-radius: 50px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .cbt-timer-label {
    font-size: 0.75rem;
    text-transform: uppercase;
    color: #94a3b8;
    font-weight: 600;
    letter-spacing: 0.05em;
  }

  .cbt-timer-display {
    font-family: 'JetBrains Mono', monospace;
    font-weight: 700;
    font-size: 1.25rem;
    color: #38bdf8;
    letter-spacing: 0.05em;
  }

  .cbt-timer-display.warning {
    color: #f87171;
    animation: timerBlink 1s infinite alternate;
  }

  @keyframes timerBlink {
    from { opacity: 1; }
    to { opacity: 0.5; }
  }

  .cbt-topbar-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .topbar-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #ffffff;
    padding: 7px 14px;
    border-radius: 6px;
    font-size: 0.78rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 6px;
    text-decoration: none;
  }

  .topbar-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: var(--gold);
    color: var(--gold-bright);
  }

  .btn-return-home {
    background: rgba(201, 152, 42, 0.15);
    border-color: var(--gold);
    color: var(--gold-bright);
  }

  .btn-return-home-action {
    pointer-events: auto !important;
    cursor: pointer !important;
    opacity: 1 !important;
    user-select: none;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .btn-return-home-action:hover {
    transform: translateY(-2px);
    filter: brightness(1.1);
  }

  .btn-return-home-action:active {
    transform: translateY(0);
  }

  .topbar-btn.btn-return-home.highlight-active {
    background: linear-gradient(135deg, #10b981, #059669) !important;
    border-color: #34d399 !important;
    color: #ffffff !important;
    box-shadow: 0 0 16px rgba(16, 185, 129, 0.6) !important;
    animation: pulseReturnHome 2s infinite alternate ease-in-out;
  }

  @keyframes pulseReturnHome {
    0% { transform: scale(1); box-shadow: 0 0 12px rgba(16, 185, 129, 0.4); }
    100% { transform: scale(1.05); box-shadow: 0 0 22px rgba(16, 185, 129, 0.85); }
  }

  /* ---------- CANDIDATE SUB-HEADER ---------- */
  .cbt-candidate-bar {
    background: #ffffff;
    border-bottom: 1px solid var(--border-color);
    padding: 8px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
    font-size: 0.82rem;
  }

  .candidate-info-left {
    display: flex;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
  }

  .candidate-pill {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--text-muted);
  }

  .candidate-pill strong {
    color: var(--navy);
  }

  .candidate-avatar-chip {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--cbt-silver-bg);
    padding: 3px 10px 3px 4px;
    border-radius: 50px;
    border: 1px solid var(--border-color);
  }

  .candidate-avatar-chip .avatar-circle {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: var(--navy-mid);
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.72rem;
  }

  /* ---------- SECTION SELECTION TABS ---------- */
  .cbt-section-tabs {
    background: #ffffff;
    border-bottom: 2px solid var(--border-color);
    padding: 0 20px;
    display: flex;
    gap: 6px;
    overflow-x: auto;
  }

  .section-tab-btn {
    background: transparent;
    border: none;
    border-bottom: 3px solid transparent;
    padding: 11px 18px;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 0.84rem;
    color: var(--text-muted);
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .section-tab-btn:hover {
    color: var(--navy);
    background: #f8fafc;
  }

  .section-tab-btn.active {
    color: var(--navy);
    border-bottom-color: var(--gold);
    font-weight: 700;
    background: #fdfbf7;
  }

  .section-tab-badge {
    background: #e2e8f0;
    color: var(--navy);
    font-size: 0.7rem;
    padding: 2px 7px;
    border-radius: 50px;
    font-weight: 700;
  }

  .section-tab-btn.active .section-tab-badge {
    background: var(--gold-light);
    border: 1px solid var(--gold-border);
    color: var(--gold);
  }

  /* ---------- MAIN EXAM CONTAINER (SPLIT SCREEN) ---------- */
  .cbt-workspace {
    flex: 1;
    display: flex;
    overflow: hidden;
    height: calc(100vh - 150px);
  }

  @media (max-width: 900px) {
    .cbt-workspace {
      flex-direction: column;
      height: auto;
      overflow: visible;
    }
  }

  /* ---------- LEFT PANE: QUESTION DISPLAY ---------- */
  .cbt-question-pane {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #ffffff;
    border-right: 1px solid var(--border-color);
    overflow: hidden;
  }

  .cbt-q-header {
    padding: 12px 24px;
    background: #f8fafc;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
  }

  .cbt-q-num-wrap {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .cbt-q-num-badge {
    font-family: 'Poppins', sans-serif;
    font-weight: 800;
    font-size: 1.15rem;
    color: var(--navy);
  }

  .cbt-q-topic-tag {
    background: var(--gold-light);
    border: 1px solid var(--gold-border);
    color: #855d14;
    padding: 3px 10px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .cbt-q-marks {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 0.78rem;
    font-weight: 600;
  }

  .mark-tag-correct {
    color: var(--cbt-green-dark);
    background: #dcfce7;
    padding: 3px 8px;
    border-radius: 4px;
  }

  .mark-tag-wrong {
    color: #b91c1c;
    background: #fee2e2;
    padding: 3px 8px;
    border-radius: 4px;
  }

  /* Scrollable Question Content */
  .cbt-q-scroll-body {
    flex: 1;
    overflow-y: auto;
    padding: 24px 30px;
  }

  .cbt-q-text {
    font-size: 1.05rem;
    line-height: 1.7;
    color: #1e293b;
    margin-bottom: 24px;
    font-weight: 500;
  }

  .cbt-q-diagram-wrap {
    margin: 16px 0 24px;
    text-align: center;
    background: #f8fafc;
    border: 1.5px dashed var(--gold-border);
    border-radius: 12px;
    padding: 16px;
    max-width: 500px;
  }

  .cbt-q-diagram-wrap img {
    max-width: 100%;
    max-height: 280px;
    object-fit: contain;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .cbt-q-diagram-caption {
    font-size: 0.78rem;
    color: var(--text-muted);
    margin-top: 8px;
    font-style: italic;
  }

  /* Multiple Choice Options */
  .cbt-options-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 30px;
  }

  .cbt-option-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 14px 18px;
    background: #ffffff;
    border: 1.5px solid var(--border-color);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    user-select: none;
  }

  .cbt-option-card:hover {
    background: #f8fafc;
    border-color: #94a3b8;
    transform: translateX(4px);
  }

  .cbt-option-card.selected {
    background: #fdfbf7;
    border-color: var(--gold);
    box-shadow: 0 4px 14px rgba(201, 152, 42, 0.16);
  }

  .cbt-option-card.is-correct {
    background: #f0fdf4 !important;
    border-color: #22c55e !important;
    color: #14532d !important;
    box-shadow: 0 2px 10px rgba(34, 197, 94, 0.15) !important;
  }

  .cbt-option-card.is-correct .cbt-radio-custom {
    border-color: #16a34a !important;
    background: #16a34a !important;
  }

  .cbt-option-card.is-incorrect {
    background: #fef2f2 !important;
    border-color: #ef4444 !important;
    color: #7f1d1d !important;
    box-shadow: 0 2px 10px rgba(239, 68, 68, 0.15) !important;
  }

  .cbt-option-card.is-incorrect .cbt-radio-custom {
    border-color: #ef4444 !important;
    background: #ef4444 !important;
  }

  .cbt-radio-custom {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 2px solid #94a3b8;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.2s ease;
  }

  .cbt-option-card.selected .cbt-radio-custom {
    border-color: var(--gold);
    background: var(--gold);
  }

  .cbt-radio-custom::after {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #ffffff;
    display: none;
  }

  .cbt-option-card.selected .cbt-radio-custom::after {
    display: block;
  }

  .cbt-opt-key {
    font-family: 'Poppins', sans-serif;
    font-weight: 700;
    font-size: 0.95rem;
    color: var(--navy);
    width: 28px;
    flex-shrink: 0;
  }

  .cbt-opt-text {
    font-size: 0.96rem;
    color: #334155;
    line-height: 1.5;
    flex: 1;
  }

  /* Bottom Controls Toolbar */
  .cbt-q-footer {
    padding: 14px 24px;
    background: #f8fafc;
    border-top: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
  }

  .cbt-action-group {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .cbt-btn {
    padding: 10px 18px;
    border-radius: 6px;
    font-family: 'Poppins', sans-serif;
    font-weight: 700;
    font-size: 0.84rem;
    cursor: pointer;
    border: none;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }

  .btn-save-next {
    background: #16a34a;
    color: #ffffff;
    box-shadow: 0 2px 6px rgba(22, 163, 74, 0.25);
  }

  .btn-save-next:hover {
    background: #15803d;
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(22, 163, 74, 0.35);
  }

  .btn-save-review {
    background: #8b5cf6;
    color: #ffffff;
  }

  .btn-save-review:hover {
    background: #7c3aed;
  }

  .btn-clear {
    background: #ffffff;
    color: #475569;
    border: 1px solid var(--border-color);
  }

  .btn-clear:hover {
    background: #fee2e2;
    color: #b91c1c;
    border-color: #fca5a5;
  }

  .btn-review-next {
    background: #f1f5f9;
    color: #6d28d9;
    border: 1px solid #c4b5fd;
  }

  .btn-review-next:hover {
    background: #ede9fe;
  }

  .btn-nav-arrow {
    background: #ffffff;
    border: 1px solid var(--border-color);
    color: var(--navy);
  }

  .btn-nav-arrow:hover {
    background: #f8fafc;
    border-color: var(--navy);
  }

  /* ---------- RIGHT PANE: PALETTE & CANDIDATE ---------- */
  .cbt-palette-pane {
    width: 380px;
    display: flex;
    flex-direction: column;
    background: #ffffff;
    overflow: hidden;
  }

  @media (max-width: 900px) {
    .cbt-palette-pane {
      width: 100%;
      height: auto;
    }
  }

  /* Status Summary Grid */
  .cbt-legend-box {
    padding: 14px 18px;
    background: #f8fafc;
    border-bottom: 1px solid var(--border-color);
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px 12px;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.74rem;
    font-weight: 600;
    color: #475569;
  }

  .legend-badge {
    width: 26px;
    height: 24px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 700;
    font-size: 0.76rem;
    color: #ffffff;
    flex-shrink: 0;
  }

  .bg-answered { background: var(--cbt-green); }
  .bg-not-answered { background: var(--cbt-red); }
  .bg-not-visited {
    background: #e2e8f0;
    color: #475569;
    border: 1px solid #cbd5e1;
  }
  .bg-marked-review { background: var(--cbt-purple); }
  .bg-ans-review {
    background: var(--cbt-purple);
    position: relative;
  }
  .bg-ans-review::after {
    content: '';
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--cbt-green);
    border: 1px solid #ffffff;
  }

  /* Palette Header */
  .cbt-palette-head {
    padding: 10px 18px;
    background: var(--navy);
    color: #ffffff;
    font-family: 'Poppins', sans-serif;
    font-weight: 700;
    font-size: 0.82rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  /* 100 Questions Scrollable Grid */
  .cbt-grid-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    background: #ffffff;
  }

  .cbt-questions-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 8px;
  }

  .q-palette-btn {
    height: 40px;
    border-radius: 6px;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 700;
    font-size: 0.84rem;
    cursor: pointer;
    border: 1px solid #cbd5e1;
    background: #f8fafc;
    color: #334155;
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .q-palette-btn:hover {
    transform: scale(1.06);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }

  .q-palette-btn.current {
    outline: 2.5px solid var(--gold-bright);
    outline-offset: 1px;
    font-weight: 800;
  }

  .q-palette-btn.answered {
    background: var(--cbt-green);
    color: #ffffff;
    border-color: #16a34a;
  }

  .q-palette-btn.not-answered {
    background: var(--cbt-red);
    color: #ffffff;
    border-color: #dc2626;
  }

  .q-palette-btn.marked-review {
    background: var(--cbt-purple);
    color: #ffffff;
    border-color: #7c3aed;
  }

  .q-palette-btn.ans-review {
    background: var(--cbt-purple);
    color: #ffffff;
    border-color: #7c3aed;
  }

  .q-palette-btn.ans-review::after {
    content: '';
    position: absolute;
    bottom: 3px;
    right: 3px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--cbt-green);
    border: 1.5px solid #ffffff;
  }

  /* Submit Area */
  .cbt-submit-wrap {
    padding: 14px 18px;
    background: #f8fafc;
    border-top: 1px solid var(--border-color);
  }

  .btn-submit-exam {
    width: 100%;
    background: linear-gradient(135deg, var(--gold-bright), var(--gold));
    color: var(--navy-dark);
    font-family: 'Poppins', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    padding: 13px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(201, 152, 42, 0.3);
    transition: all 0.2s ease;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .btn-submit-exam:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(201, 152, 42, 0.45);
    background: linear-gradient(135deg, #f0be50, #d9a632);
  }

  /* ---------- MODALS ---------- */
  .cbt-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 999;
    background: rgba(7, 19, 38, 0.7);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    opacity: 0;
    visibility: hidden;
    transition: all 0.25s ease;
  }

  .cbt-modal-backdrop.open {
    opacity: 1;
    visibility: visible;
  }

  .cbt-modal-box {
    background: #ffffff;
    border-radius: 16px;
    max-width: 650px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);
    padding: 30px;
    position: relative;
    border: 2px solid var(--gold-border);
  }

  .cbt-modal-title {
    font-family: 'Poppins', sans-serif;
    font-size: 1.35rem;
    font-weight: 800;
    color: var(--navy);
    margin-bottom: 12px;
  }

  /* Summary Table in Modal */
  .cbt-summary-table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    font-size: 0.88rem;
  }

  .cbt-summary-table th, .cbt-summary-table td {
    padding: 10px 14px;
    border: 1px solid var(--border-color);
    text-align: left;
  }

  .cbt-summary-table th {
    background: #f8fafc;
    font-weight: 700;
    color: var(--navy);
  }

  /* Scorecard Screen */
  .scorecard-banner {
    background: linear-gradient(135deg, var(--navy-dark), var(--navy));
    color: #ffffff;
    padding: 24px;
    border-radius: 12px;
    text-align: center;
    margin-bottom: 24px;
    border: 2px solid var(--gold);
  }

  .score-number {
    font-family: 'Poppins', sans-serif;
    font-weight: 900;
    font-size: 3rem;
    color: var(--gold-bright);
    line-height: 1.1;
  }

  .scorecard-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
    margin-bottom: 24px;
  }

  .stat-card {
    background: #f8fafc;
    border: 1px solid var(--border-color);
    border-radius: 10px;
    padding: 14px;
    text-align: center;
  }

  .stat-card .val {
    font-family: 'JetBrains Mono', monospace;
    font-weight: 800;
    font-size: 1.5rem;
  }

  .stat-card.correct .val { color: var(--cbt-green-dark); }
  .stat-card.wrong .val { color: var(--cbt-red); }
  .stat-card.unatt .val { color: var(--text-muted); }

  /* Explanation / Solutions Card in Review Mode */
  .review-mode-box {
    margin-top: 20px;
    padding: 16px;
    background: #f8fafc;
    border-left: 4px solid var(--gold);
    border-radius: 8px;
  }

  .review-status-badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 4px;
    font-weight: 700;
    font-size: 0.76rem;
    margin-bottom: 8px;
    text-transform: uppercase;
  }

  .review-status-badge.correct { background: #dcfce7; color: #15803d; }
  .review-status-badge.wrong { background: #fee2e2; color: #b91c1c; }
  .review-status-badge.unattempted { background: #e2e8f0; color: #475569; }

  .review-exp-text {
    font-size: 0.9rem;
    line-height: 1.6;
    color: #1e293b;
    margin-top: 8px;
  }

  /* Candidate Student Details Inputs */
  .cbt-form-input {
    width: 100%;
    padding: 11px 14px;
    border: 1.5px solid rgba(201, 152, 42, 0.4);
    border-radius: 8px;
    font-size: 0.92rem;
    font-family: inherit;
    color: var(--navy);
    background: #ffffff;
    transition: all 0.25s ease;
    outline: none;
    box-sizing: border-box;
  }
  .cbt-form-input:focus {
    border-color: var(--gold);
    box-shadow: 0 0 0 3px rgba(201, 152, 42, 0.2);
    background: #fffdf9;
  }
  .cbt-form-input.input-error {
    border-color: #ef4444 !important;
    background: #fef2f2 !important;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2) !important;
  }
</style>
</head>
<body>

<!-- TOP NAVBAR -->
<header class="cbt-topbar">
  <div class="cbt-topbar-brand">
    <span class="badge-mark">S</span>
    <div class="cbt-topbar-info">
      <h1>NEET (UG) 2024 — Botany CBT Examination</h1>
      <small>National Eligibility Cum Entrance Test · Simulated Portal</small>
    </div>
  </div>

  <div class="cbt-topbar-center">
    <div class="cbt-timer-wrap">
      <span class="cbt-timer-label">Time Left:</span>
      <span class="cbt-timer-display" id="timerDisplay">01:00:00</span>
    </div>
  </div>

  <div class="cbt-topbar-actions">
    <button type="button" class="topbar-btn" id="btnViewInstructions">ℹ️ Instructions</button>
    <button type="button" class="topbar-btn" id="btnQuestionPaper">📄 Paper View</button>
    <a href="../sarvottam-hero.html" class="topbar-btn btn-return-home btn-return-home-action" id="btnTopReturnHome" title="Return to Homepage"><span>🏠</span> Return to Homepage</a>
  </div>
</header>

<!-- CANDIDATE METADATA BAR -->
<div class="cbt-candidate-bar">
  <div class="candidate-info-left">
    <div class="candidate-avatar-chip">
      <span class="avatar-circle" id="candidateAvatar">A</span>
      <span>Aspirant: <strong id="candidateName">NEET Student (Sarvottam)</strong></span>
    </div>
    <div class="candidate-pill">Roll No: <strong id="candidateRollNo">NEET2024-BOT-0881</strong></div>
    <div class="candidate-pill" id="candidateAgePill" style="display:none;">Age/DOB: <strong id="candidateAge">--</strong></div>
    <div class="candidate-pill">System: <strong>CBT-NODE-14</strong></div>
    <div class="candidate-pill">Paper Code: <strong>NEET-2024-BOTANY-50</strong></div>
    <div class="candidate-pill" id="proctorStatusPill" style="background:#fef2f2;border:1.5px solid #fca5a5;color:#b91c1c;padding:3px 12px;border-radius:50px;font-weight:700;display:inline-flex;align-items:center;gap:8px;font-size:0.78rem;">
      <span style="width:8px;height:8px;border-radius:50%;background:#ef4444;display:inline-block;animation:cbtPulse 1.5s infinite;"></span>
      <span>AI Proctor: Active (<span id="violationCountBadge">0</span>/2 Warnings)</span>
    </div>
  </div>
  <div class="candidate-info-right">
    <span style="font-size:0.76rem;color:var(--text-muted);">View in: <strong>English</strong></span>
  </div>
</div>

<!-- SECTION TABS -->
<div class="cbt-section-tabs" id="sectionTabsContainer">
  <button type="button" class="section-tab-btn active" data-sec="all">
    All Botany Questions <span class="section-tab-badge" id="badge-all">50</span>
  </button>
  <button type="button" class="section-tab-btn" data-sec="botany-a">
    Botany Section A (Q1–Q35) <span class="section-tab-badge" id="badge-botany-a">35</span>
  </button>
  <button type="button" class="section-tab-btn" data-sec="botany-b">
    Botany Section B (Q36–Q50) <span class="section-tab-badge" id="badge-botany-b">15</span>
  </button>
</div>

<!-- WORKSPACE -->
<main class="cbt-workspace">

  <!-- LEFT PANE: ACTIVE QUESTION -->
  <section class="cbt-question-pane">
    <div class="cbt-q-header">
      <div class="cbt-q-num-wrap">
        <span class="cbt-q-num-badge" id="displayQNum">Question No. 1</span>
        <span class="cbt-q-topic-tag" id="displayQTopic">Biological Classification</span>
      </div>
      <div class="cbt-q-marks">
        <span class="mark-tag-correct">Correct: +4</span>
        <span class="mark-tag-wrong">Incorrect: -1</span>
      </div>
    </div>

    <!-- Scrollable Question Content -->
    <div class="cbt-q-scroll-body" id="qScrollArea">
      <div class="cbt-q-text" id="displayQText">Loading question...</div>

      <!-- Optional Diagram -->
      <div class="cbt-q-diagram-wrap" id="diagramContainer" style="display:none;">
        <img id="diagramImg" src="" alt="Question Diagram">
        <p class="cbt-q-diagram-caption">Figure for reference</p>
      </div>

      <!-- 4 MCQ Options -->
      <div class="cbt-options-list" id="optionsContainer">
        <!-- Option Cards generated by JS -->
      </div>

      <!-- Solutions Box (Displayed only in Review/Result Mode) -->
      <div class="review-mode-box" id="reviewBox" style="display:none;">
        <div id="reviewStatusBadge" class="review-status-badge">Correct</div>
        <div style="font-size:0.95rem;color:var(--navy);margin-bottom:8px;">
          <strong>Official Answer (Page 15):</strong> 
          <span style="color:#15803d;font-weight:700;">Option (<span id="reviewCorrectKey">D</span>):</span>
          <span id="reviewCorrectText"></span>
        </div>
        <div class="review-exp-text" id="reviewExpText"></div>
        <div id="reviewExpDiagramWrap" style="margin-top:14px;display:none;">
          <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:6px;font-weight:600;">Reference Diagram from Official Solution:</p>
          <img id="reviewExpDiagramImg" src="" style="max-width:100%;max-height:280px;border-radius:8px;border:1px solid #cbd5e1;" alt="Explanation Diagram">
        </div>
      </div>
    </div>

    <!-- Action Buttons Toolbar -->
    <div class="cbt-q-footer">
      <div class="cbt-action-group" id="examLiveActionGroup">
        <button type="button" class="cbt-btn btn-save-next" id="btnSaveNext">Save &amp; Next</button>
        <button type="button" class="cbt-btn btn-save-review" id="btnSaveReview">Save &amp; Mark for Review</button>
        <button type="button" class="cbt-btn btn-clear" id="btnClearResp">Clear Response</button>
        <button type="button" class="cbt-btn btn-review-next" id="btnReviewNext">Mark for Review &amp; Next</button>
      </div>
      <div class="cbt-action-group" id="examReviewActionGroup" style="display:none;">
        <button type="button" class="cbt-btn btn-return-home-action" id="btnFooterReturnHome" style="background:linear-gradient(135deg,#10b981,#059669);color:#ffffff;font-weight:700;padding:10px 22px;border:none;border-radius:6px;box-shadow:0 4px 14px rgba(16,185,129,0.35);">
          <span>🏠</span> Return to Homepage
        </button>
        <button type="button" class="cbt-btn" id="btnBackToScorecard" style="background:var(--navy-mid);color:#ffffff;font-weight:600;padding:10px 18px;border:none;border-radius:6px;">
          <span>📊</span> View Scorecard
        </button>
      </div>
      <div class="cbt-action-group">
        <button type="button" class="cbt-btn btn-nav-arrow" id="btnPrevQ">← Previous</button>
        <button type="button" class="cbt-btn btn-nav-arrow" id="btnNextQ">Next →</button>
      </div>
    </div>
  </section>

  <!-- RIGHT PANE: PALETTE & STATUS -->
  <aside class="cbt-palette-pane">
    <!-- Status Legend -->
    <div class="cbt-legend-box">
      <div class="legend-item">
        <span class="legend-badge bg-answered" id="countAnswered">0</span>
        <span>Answered</span>
      </div>
      <div class="legend-item">
        <span class="legend-badge bg-not-answered" id="countNotAnswered">1</span>
        <span>Not Answered</span>
      </div>
      <div class="legend-item">
        <span class="legend-badge bg-not-visited" id="countNotVisited">99</span>
        <span>Not Visited</span>
      </div>
      <div class="legend-item">
        <span class="legend-badge bg-marked-review" id="countMarkedReview">0</span>
        <span>Marked for Review</span>
      </div>
      <div class="legend-item" style="grid-column: span 2;">
        <span class="legend-badge bg-ans-review" id="countAnsReview">0</span>
        <span>Answered &amp; Marked for Review</span>
      </div>
    </div>

    <!-- Palette Header -->
    <div class="cbt-palette-head">
      <span>Question Palette (<span id="paletteFilteredCount">50</span>)</span>
      <small style="color:var(--gold-bright);cursor:pointer;" id="btnResetFilter">View All</small>
    </div>

    <!-- 100 Question Buttons Grid -->
    <div class="cbt-grid-scroll">
      <div class="cbt-questions-grid" id="paletteGrid">
        <!-- 100 buttons rendered by JS -->
      </div>
    </div>

    <!-- Submit Action -->
    <div class="cbt-submit-wrap" id="paletteSubmitWrap">
      <button type="button" class="btn-submit-exam" id="btnSubmitExam">Submit Test</button>
      <button type="button" class="btn-submit-exam btn-return-home-action" id="btnSidebarReturnHome" style="display:none;background:linear-gradient(135deg,var(--gold-bright),var(--gold));color:var(--navy-dark);font-weight:800;border:none;box-shadow:0 4px 16px rgba(201,152,42,0.4);">
        🏠 Return to Homepage
      </button>
    </div>
  </aside>

</main>

<!-- CONFIRM SUBMISSION MODAL -->
<div class="cbt-modal-backdrop" id="modalSubmitConfirm" role="dialog">
  <div class="cbt-modal-box">
    <h3 class="cbt-modal-title">Confirm Test Submission</h3>
    <p style="color:var(--text-muted);font-size:0.92rem;">Please review your attempt status before final submission. Once submitted, you cannot change your answers.</p>

    <table class="cbt-summary-table">
      <thead>
        <tr>
          <th>Category</th>
          <th>Number of Questions</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Total Questions</td><td><strong>50</strong></td></tr>
        <tr><td>Answered</td><td id="modalCountAns" style="color:var(--cbt-green-dark);font-weight:700;">0</td></tr>
        <tr><td>Not Answered</td><td id="modalCountNotAns" style="color:var(--cbt-red);font-weight:700;">0</td></tr>
        <tr><td>Marked for Review</td><td id="modalCountRev" style="color:var(--cbt-purple);font-weight:700;">0</td></tr>
        <tr><td>Not Visited</td><td id="modalCountNotVis">0</td></tr>
      </tbody>
    </table>

    <div style="display:flex;gap:12px;justify-content:flex-end;">
      <button type="button" class="cbt-btn btn-clear" id="btnResumeTest">← Resume Test</button>
      <button type="button" class="cbt-btn btn-save-next" id="btnFinalSubmit">Confirm &amp; Submit Final Test →</button>
    </div>
  </div>
</div>

<!-- SCORECARD / RESULT MODAL -->
<div class="cbt-modal-backdrop" id="modalScorecard" role="dialog">
  <div class="cbt-modal-box" style="max-width:720px;">
    <div class="scorecard-banner">
      <p style="font-size:0.85rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--gold-bright);margin-bottom:6px;">NEET 2024 Botany Mock Result</p>
      <div class="score-number"><span id="finalScore">0</span> <span style="font-size:1.4rem;color:#cbd5e1;">/ 200</span></div>
      <p id="finalPerformanceText" style="font-size:0.95rem;margin-top:8px;">Good effort! Review detailed solutions below.</p>
    </div>

    <div id="scorecardStudentStrip" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:10px 16px;margin:12px 0 16px;font-size:0.84rem;color:#334155;display:flex;justify-content:space-around;flex-wrap:wrap;gap:8px;">
      <div>Candidate: <strong id="scorecardStudentName" style="color:var(--navy);">NEET Student</strong></div>
      <div>Age/DOB: <strong id="scorecardStudentAge" style="color:var(--navy);">--</strong></div>
      <div>Email: <strong id="scorecardStudentEmail" style="color:var(--navy);">--</strong></div>
      <div>Phone: <strong id="scorecardStudentPhone" style="color:var(--navy);">--</strong></div>
    </div>

    <div class="scorecard-stats">
      <div class="stat-card correct">
        <div class="val" id="finalCorrect">0</div>
        <div style="font-size:0.75rem;color:#15803d;font-weight:700;">Correct (+4)</div>
      </div>
      <div class="stat-card wrong">
        <div class="val" id="finalWrong">0</div>
        <div style="font-size:0.75rem;color:#b91c1c;font-weight:700;">Incorrect (-1)</div>
      </div>
      <div class="stat-card unatt">
        <div class="val" id="finalUnatt">0</div>
        <div style="font-size:0.75rem;color:#475569;font-weight:700;">Unattempted (0)</div>
      </div>
    </div>

    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:20px;">
      <button type="button" class="cbt-btn btn-save-next" id="btnReviewSolutions">📖 Review Solutions &amp; Explanations</button>
      <button type="button" class="cbt-btn btn-save-review" id="btnRetakeTest">🔄 Re-attempt Test</button>
      <button type="button" class="cbt-btn btn-return-home-action" id="btnScorecardReturnHome" style="background:linear-gradient(135deg, #10b981, #059669);color:#ffffff;font-weight:700;padding:10px 24px;border:none;border-radius:6px;cursor:pointer;display:inline-flex;align-items:center;gap:8px;box-shadow:0 4px 14px rgba(16,185,129,0.35);">
        <span>🏠</span> Return to Homepage
      </button>
    </div>
  </div>
</div>

<!-- INSTRUCTIONS MODAL -->
<div class="cbt-modal-backdrop" id="modalInstructions" role="dialog">
  <div class="cbt-modal-box">
    <h3 class="cbt-modal-title">Exam Instructions &amp; Marking Scheme</h3>
    <ul style="font-size:0.9rem;line-height:1.7;color:#334155;padding-left:20px;margin-bottom:20px;">
      <li>The examination consists of <strong>50 Multiple Choice Questions</strong> from the official NEET 2024 Botany Paper.</li>
      <li><strong>Botany Section A:</strong> Questions 1 to 35 (Compulsory).</li>
      <li><strong>Botany Section B:</strong> Questions 36 to 50.</li>
      <li><strong>Marking Scheme:</strong> Each question carries <strong>4 marks</strong> for correct response. <strong>1 mark</strong> will be deducted for each incorrect answer. Unattempted questions yield 0 marks (Maximum Marks: 200).</li>
      <li><strong>Question Palette Symbols:</strong>
        <br>• Green: Answered
        <br>• Red: Not Answered
        <br>• Silver: Not Visited
        <br>• Purple: Marked for Review
        <br>• Purple with dot: Answered and Marked for Review
      </li>
      <li>Click on <strong>Save &amp; Next</strong> to save your chosen option and proceed.</li>
      <li>To change your response, select another option or click <strong>Clear Response</strong>.</li>
    </ul>
    <div style="text-align:right;">
      <button type="button" class="cbt-btn btn-save-next" id="btnCloseInstructions">Got it, Proceed to Test</button>
    </div>
  </div>
</div>

<!-- QUESTION PAPER VIEW MODAL -->
<div class="cbt-modal-backdrop" id="modalQuestionPaper" role="dialog">
  <div class="cbt-modal-box" style="max-width:850px;">
    <h3 class="cbt-modal-title">Full Question Paper View</h3>
    <div id="fullPaperContainer" style="max-height:60vh;overflow-y:auto;padding-right:10px;">
      <!-- Full paper generated by JS -->
    </div>
    <div style="text-align:right;margin-top:20px;">
      <button type="button" class="cbt-btn btn-save-next" id="btnClosePaperView">Close Paper View</button>
    </div>
  </div>
</div>

<!-- 1ST PROCTORING VIOLATION WARNING MODAL -->
<div class="cbt-modal-backdrop" id="modalViolationWarning" role="dialog" style="z-index: 10050; background: rgba(7, 19, 38, 0.94); backdrop-filter: blur(16px);">
  <div class="cbt-modal-box" style="border: 2.5px solid #f59e0b; box-shadow: 0 25px 60px rgba(245, 158, 11, 0.35); text-align: center; max-width: 560px;">
    <div style="width:68px;height:68px;border-radius:50%;background:#fef3c7;border:2.5px solid #f59e0b;color:#d97706;display:flex;align-items:center;justify-content:center;font-size:2.2rem;margin:0 auto 16px;">⚠️</div>
    <h3 class="cbt-modal-title" style="color:#b45309;font-size:1.45rem;">PROCTORING WARNING: TAB SWITCH DETECTED</h3>
    <p style="font-weight:800;color:#92400e;margin-bottom:14px;font-size:1.02rem;">First Warning Issued (Violation 1 of 2)</p>
    <div style="background:#fffbeb;border:1.5px solid #fde68a;border-radius:10px;padding:16px 18px;margin-bottom:22px;text-align:left;font-size:0.9rem;color:#78350f;line-height:1.65;">
      <p><strong>Detected Action:</strong> You navigated away from the active examination window (Tab switch or browser window unfocused).</p>
      <p style="margin-top:8px;"><strong>CBT Exam Rule:</strong> Candidates are strictly prohibited from leaving the active examination screen during live testing.</p>
      <p style="margin-top:10px;color:#b91c1c;font-weight:800;background:#fee2e2;padding:10px 14px;border-radius:6px;border:1px solid #fca5a5;">
        🚨 CRITICAL WARNING: If you switch tabs or lose window focus ONE MORE TIME (Violation 2), your test session will be TERMINATED IMMEDIATELY as "ABRUPT" with NO SCORE!
      </p>
    </div>
    <button type="button" class="cbt-btn btn-save-next" id="btnAckWarning" style="background:#d97706;padding:12px 32px;font-size:0.95rem;box-shadow:0 4px 14px rgba(217,119,6,0.35);">I Understand, Return to Test →</button>
  </div>
</div>

<!-- 2ND VIOLATION ABRUPT TERMINATION MODAL -->
<div class="cbt-modal-backdrop" id="modalAbruptTermination" role="dialog" style="z-index: 10060; background: rgba(15, 23, 42, 0.96); backdrop-filter: blur(16px);">
  <div class="cbt-modal-box" style="border: 3px solid #ef4444; box-shadow: 0 30px 80px rgba(239, 68, 68, 0.6); text-align: center; max-width: 600px;">
    <div style="width:76px;height:76px;border-radius:50%;background:#fee2e2;border:3px solid #ef4444;color:#b91c1c;display:flex;align-items:center;justify-content:center;font-size:2.6rem;margin:0 auto 16px;">🚫</div>
    <h3 class="cbt-modal-title" style="color:#b91c1c;font-size:1.6rem;text-transform:uppercase;letter-spacing:0.02em;">EXAMINATION TERMINATED ABRUPTLY</h3>
    <p style="font-weight:800;color:#7f1d1d;font-size:1.05rem;margin-bottom:16px;">Test Disqualified (Violation 2 of 2)</p>
    
    <div style="background:#fef2f2;border:1.5px solid #fca5a5;border-radius:10px;padding:20px;margin-bottom:24px;text-align:left;font-size:0.92rem;color:#7f1d1d;line-height:1.65;">
      <p><strong>Submission Status:</strong> <span style="background:#ef4444;color:#fff;padding:3px 10px;border-radius:4px;font-weight:800;font-size:0.85rem;letter-spacing:0.05em;">ABRUPT</span></p>
      <p style="margin-top:6px;"><strong>Candidate:</strong> <span id="abruptStudentName">NEET Student</span> (<span id="abruptStudentRoll">NEET2024-BOT-0881</span>)</p>
      <p style="margin-top:10px;"><strong>Official Score Awarded:</strong> <strong style="color:#b91c1c;font-size:1.2rem;">0 / 200 (NO SCORE RECORDED)</strong></p>
      <p style="margin-top:10px;"><strong>Disqualification Reason:</strong> Repeated unauthorized tab switching / window minimization detected by AI Proctoring Engine.</p>
      <p style="margin-top:10px;font-size:0.86rem;color:#991b1b;">Under official examination conduct regulations, this attempt has been auto-submitted as abrupt with zero score and flagged for administrative review.</p>
    </div>

    <div style="display:flex;gap:14px;justify-content:center;margin-top:22px;">
      <button type="button" class="btn-return-home-action" id="btnAbruptReturnHome" style="background:linear-gradient(135deg, #dc2626, #b91c1c);color:#ffffff;padding:14px 34px;font-size:1.02rem;font-weight:800;border:2px solid #f87171;border-radius:8px;cursor:pointer;box-shadow:0 6px 20px rgba(220,38,38,0.45);display:inline-flex;align-items:center;gap:10px;pointer-events:auto !important;opacity:1 !important;">
        <span style="font-size:1.2rem;">🏠</span> Return to Homepage
      </button>
    </div>
  </div>
</div>

<!-- PRE-EXAM STUDENT DETAILS MODAL -->
<div class="cbt-modal-backdrop" id="modalStudentDetails" role="dialog" aria-modal="true" style="z-index: 10005;">
  <div class="cbt-modal-box" style="max-width: 520px; text-align: left; padding: 32px 28px; border: 2px solid var(--gold); border-radius: 20px; box-shadow: 0 25px 70px rgba(15, 23, 42, 0.4);">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
      <div style="width:44px;height:44px;border-radius:12px;background:rgba(201,152,42,0.15);border:1.5px solid var(--gold);display:flex;align-items:center;justify-content:center;font-size:1.4rem;color:var(--navy);flex-shrink:0;">
        📋
      </div>
      <div>
        <span style="font-size:0.72rem;background:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.35);color:#047857;padding:3px 10px;border-radius:50px;font-weight:700;">
          NTA NEET UG 2024 · Verification
        </span>
        <h3 style="font-family:'Poppins',sans-serif;font-weight:800;font-size:1.35rem;color:var(--navy);margin:4px 0 0;">Student Candidate Details</h3>
      </div>
    </div>

    <p style="font-size:0.86rem;color:#64748b;line-height:1.5;margin-bottom:16px;">
      Please enter your authentic student details below before launching the CBT exam:
    </p>

    <div id="testStudentFormAlert" style="display:none;background:#fef2f2;border:1.5px solid #fca5a5;color:#991b1b;padding:10px 14px;border-radius:8px;font-size:0.84rem;margin-bottom:16px;font-weight:600;line-height:1.4;"></div>

    <form id="testStudentDetailsForm" onsubmit="return false;" novalidate>
      <div style="margin-bottom:14px;">
        <label for="testStudentFullName" style="display:flex;justify-content:space-between;font-size:0.82rem;font-weight:700;color:var(--navy);margin-bottom:6px;">
          <span>Student Full Name <span style="color:#ef4444;">*</span></span>
          <span style="font-weight:400;font-size:0.75rem;color:#64748b;">As per official ID</span>
        </label>
        <input type="text" id="testStudentFullName" class="cbt-form-input" placeholder="e.g. Aarav Sharma" required autocomplete="name">
      </div>

      <div style="margin-bottom:14px;">
        <label for="testStudentAge" style="display:flex;justify-content:space-between;font-size:0.82rem;font-weight:700;color:var(--navy);margin-bottom:6px;">
          <span>Age in DDMMYY <span style="color:#ef4444;">*</span></span>
          <span style="font-weight:400;font-size:0.75rem;color:#64748b;">DDMMYY format (e.g. 180506)</span>
        </label>
        <input type="text" id="testStudentAge" class="cbt-form-input" placeholder="DDMMYY (e.g. 180506 for 18 May 2006)" maxlength="10" required>
      </div>

      <div style="margin-bottom:14px;">
        <label for="testStudentEmail" style="display:flex;justify-content:space-between;font-size:0.82rem;font-weight:700;color:var(--navy);margin-bottom:6px;">
          <span>Email ID <span style="color:#ef4444;">*</span></span>
          <span style="font-weight:400;font-size:0.75rem;color:#64748b;">For scorecard dispatch</span>
        </label>
        <input type="email" id="testStudentEmail" class="cbt-form-input" placeholder="e.g. student@gmail.com" required autocomplete="email">
      </div>

      <div style="margin-bottom:22px;">
        <label for="testStudentPhone" style="display:flex;justify-content:space-between;font-size:0.82rem;font-weight:700;color:var(--navy);margin-bottom:6px;">
          <span>Phone Number <span style="color:#ef4444;">*</span></span>
          <span style="font-weight:400;font-size:0.75rem;color:#64748b;">10-digit mobile number</span>
        </label>
        <input type="tel" id="testStudentPhone" class="cbt-form-input" placeholder="e.g. 9876543210" maxlength="10" required autocomplete="tel">
      </div>

      <button type="button" class="cbt-btn btn-save-next" id="btnLaunchExamModal" style="width:100%;padding:14px;font-size:1.02rem;font-weight:800;display:flex;align-items:center;justify-content:center;gap:10px;border-radius:10px;box-shadow:0 4px 16px rgba(16,185,129,0.35);border:none;cursor:pointer;">
        <span>Launch Exam</span> →
      </button>
    </form>
  </div>
</div>

<!-- STRICT FULLSCREEN LOCK OVERLAY MODAL -->
<div class="cbt-modal-backdrop" id="modalFullscreenLock" role="dialog" aria-modal="true" style="z-index: 10010; background: rgba(7, 19, 38, 0.96); backdrop-filter: blur(18px);">
  <div class="cbt-modal-box" style="border: 2.5px solid var(--gold); box-shadow: 0 30px 80px rgba(0, 0, 0, 0.65); text-align: center; max-width: 580px; padding: 36px 30px; border-radius: 20px;">
    <div style="width: 76px; height: 76px; border-radius: 50%; background: rgba(201, 152, 42, 0.15); border: 2.5px solid var(--gold); color: var(--gold); display: flex; align-items: center; justify-content: center; font-size: 2.4rem; margin: 0 auto 16px; box-shadow: 0 0 25px rgba(201, 152, 42, 0.25);">
      🔒
    </div>
    <span style="display: inline-block; background: rgba(239, 68, 68, 0.12); border: 1.5px solid rgba(239, 68, 68, 0.4); color: #dc2626; padding: 4px 16px; border-radius: 50px; font-weight: 800; font-size: 0.78rem; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 8px;">
      Strict Full Screen Lock Active
    </span>
    <h3 style="font-family: 'Poppins', sans-serif; font-weight: 800; font-size: 1.45rem; color: var(--navy); margin: 6px 0 10px;">
      Examination Screen Locked
    </h3>
    <p style="font-size: 0.92rem; color: #64748b; line-height: 1.6; margin-bottom: 18px;">
      Official NTA NEET regulations mandate that this examination must be conducted in <strong>Full Screen Mode</strong>. The examination screen is locked for the <strong>1-Hour Duration</strong> or until final submission. The exam timer will start counting down once you click below.
    </p>

    <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; margin-bottom: 22px;">
      <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px 16px; font-size: 0.84rem; color: var(--navy);">
        Candidate: <strong id="lockStudentName">NEET Aspirant</strong>
      </div>
      <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 8px 16px; font-size: 0.84rem; color: #dc2626; font-weight: 700; display: inline-flex; align-items: center; gap: 6px;">
        <span>⏱️</span> Remaining: <span id="lockTimerDisplay" style="font-family: 'JetBrains Mono', monospace; font-size: 0.98rem;">01:00:00</span>
      </div>
    </div>

    <button type="button" class="cbt-btn btn-save-next" id="btnResumeFullscreen" style="width: 100%; padding: 15px 24px; font-size: 1.05rem; font-weight: 800; border-radius: 10px; box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4); display: flex; align-items: center; justify-content: center; gap: 10px; border: none; cursor: pointer; background: linear-gradient(135deg, #10b981, #059669);">
      <span>🖥️ Enter Full Screen &amp; Lock Exam</span> →
    </button>
    <p style="font-size: 0.76rem; color: #94a3b8; margin-top: 14px; line-height: 1.4;">
      The screen will automatically unlock once you complete and confirm test submission, or when 1 hour expires.
    </p>
  </div>
</div>

<!-- EMBEDDED DATASET & CBT APPLICATION LOGIC -->
<script>
const NEET_QUESTIONS = ''' + json_str + ''';

(function initCBTExam() {
  const STATE = {
    currentIndex: 0,
    userAnswers: {},     // qId -> 'a' | 'b' | 'c' | 'd'
    status: {},          // qId -> 'not-visited' | 'not-answered' | 'answered' | 'marked-review' | 'ans-review'
    isSubmitted: false,
    isAbruptTerminated: false,
    isTimerStarted: false,
    violationCount: 0,
    violations: 0,
    activeSection: 'all',
    timerSeconds: 60 * 60, // 60 minutes (NEET Botany duration)
    studentDetails: null
  };

  // Initialize status
  NEET_QUESTIONS.forEach((q, idx) => {
    STATE.status[q.id] = idx === 0 ? 'not-answered' : 'not-visited';
  });

  // DOM Elements - Exam Interface & Question Display
  const displayQNum = document.getElementById('displayQNum');
  const displayQTopic = document.getElementById('displayQTopic');
  const displayQText = document.getElementById('displayQText');
  const diagramContainer = document.getElementById('diagramContainer');
  const diagramImg = document.getElementById('diagramImg');
  const optionsContainer = document.getElementById('optionsContainer');
  const reviewBox = document.getElementById('reviewBox');
  const reviewStatusBadge = document.getElementById('reviewStatusBadge');
  const reviewCorrectKey = document.getElementById('reviewCorrectKey');
  const reviewExpText = document.getElementById('reviewExpText');
  const paletteGrid = document.getElementById('paletteGrid');

  // DOM Elements - Fullscreen Lock & Timer Display
  const timerDisplay = document.getElementById('timerDisplay');
  const modalFullscreenLock = document.getElementById('modalFullscreenLock');
  const btnResumeFullscreen = document.getElementById('btnResumeFullscreen');
  const lockTimerDisplay = document.getElementById('lockTimerDisplay');
  const lockStudentName = document.getElementById('lockStudentName');

  // DOM Elements - Student Details Verification Modal
  const modalStudentDetails = document.getElementById('modalStudentDetails');
  const btnLaunchExamModal = document.getElementById('btnLaunchExamModal');
  const testStudentAlert = document.getElementById('testStudentFormAlert');
  const inputTestName = document.getElementById('testStudentFullName');
  const inputTestAge = document.getElementById('testStudentAge');
  const inputTestEmail = document.getElementById('testStudentEmail');
  const inputTestPhone = document.getElementById('testStudentPhone');

  // DOM Elements - Modals & Overlays
  const modalSubmitConfirm = document.getElementById('modalSubmitConfirm');
  const modalScorecard = document.getElementById('modalScorecard');
  const modalInstructions = document.getElementById('modalInstructions');
  const modalQuestionPaper = document.getElementById('modalQuestionPaper');
  const modalViolationWarning = document.getElementById('modalViolationWarning');
  const modalAbruptTermination = document.getElementById('modalAbruptTermination');
  const btnAckWarning = document.getElementById('btnAckWarning');
  const violationCountBadge = document.getElementById('violationCountBadge');
  const proctorStatusPill = document.getElementById('proctorStatusPill');

  // Live Telemetry Dispatch to Antigravity Admin Portal
  function sendExamTelemetry(action, extra = {}) {
    try {
      const s = STATE.studentDetails;
      if (!s || !s.fullName) return;
      const cleanPhone = String(s.phone || '').replace(/[\+\-\s\(\)]/g, '');
      const rollNo = 'NEET2024-' + (s.age || '180506') + '-' + (cleanPhone.slice(-4) || '0881');
      const payload = {
        action: action,
        fullName: s.fullName,
        age: s.age,
        email: s.email,
        phone: cleanPhone,
        rollNo: rollNo,
        stream: 'NEET (UG) 2024',
        subject: 'Botany Mock (50 Qs)',
        proctorFlags: STATE.violationCount || 0,
        ...extra
      };

      let telemetryUrl = '/api/cbt/telemetry';
      if (typeof window !== 'undefined' && window.location) {
        if (window.location.protocol.startsWith('http')) {
          telemetryUrl = window.location.origin + '/api/cbt/telemetry';
        } else {
          telemetryUrl = 'http://localhost:3001/api/cbt/telemetry';
        }
      }

      fetch(telemetryUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(() => {
        if (telemetryUrl.includes('localhost')) {
          fetch('http://192.168.29.66:3001/api/cbt/telemetry', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            keepalive: true
          }).catch(() => {});
        }
      });
    } catch(e) {}
  }

  // Timer Display & Countdown Control
  let timerInterval = null;

  function updateTimerDisplays(timeInSec) {
    const h = String(Math.floor(timeInSec / 3600)).padStart(2, '0');
    const m = String(Math.floor((timeInSec % 3600) / 60)).padStart(2, '0');
    const s = String(timeInSec % 60).padStart(2, '0');
    const formatted = `${h}:${m}:${s}`;
    if (timerDisplay) timerDisplay.textContent = formatted;
    if (lockTimerDisplay) lockTimerDisplay.textContent = formatted;
    if (timeInSec < 600 && timerDisplay) {
      timerDisplay.classList.add('warning');
    }
  }

  // Ensure initial static displays show 01:00:00 without counting down until user clicks 'Enter Full Screen & Lock Exam'
  updateTimerDisplays(STATE.timerSeconds);

  function startExamCountdown() {
    if (!STATE.isTimerStarted && !STATE.isSubmitted && !STATE.isAbruptTerminated) {
      STATE.isTimerStarted = true;
      startTimer();
      sendExamTelemetry('start_exam', { status: 'LIVE_TESTING' });
    }
  }

  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (STATE.isSubmitted || STATE.isAbruptTerminated) {
        clearInterval(timerInterval);
        return;
      }
      if (STATE.timerSeconds > 0) {
        STATE.timerSeconds--;
        updateTimerDisplays(STATE.timerSeconds);
      } else {
        clearInterval(timerInterval);
        alert("1 Hour has elapsed! The examination session is concluded and your responses are being submitted automatically.");
        submitFinalTest();
      }
    }, 1000);
  }

  function isFullscreenActive() {
    return !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );
  }

  function enterExamFullscreen() {
    const elem = document.documentElement;
    const req = elem.requestFullscreen || elem.webkitRequestFullscreen || elem.mozRequestFullScreen || elem.msRequestFullscreen;
    if (req) {
      try {
        const p = req.call(elem);
        if (p && p.then) {
          p.then(() => {
            if (navigator.keyboard && navigator.keyboard.lock) {
              navigator.keyboard.lock(['Escape']).catch(() => {});
            }
            if (modalFullscreenLock) modalFullscreenLock.classList.remove('open');
          }).catch((err) => {
            console.warn("Fullscreen request:", err);
            if (modalFullscreenLock) modalFullscreenLock.classList.remove('open');
          });
        } else {
          if (modalFullscreenLock) modalFullscreenLock.classList.remove('open');
        }
      } catch(err) {
        console.warn("Fullscreen call error:", err);
        if (modalFullscreenLock) modalFullscreenLock.classList.remove('open');
      }
    } else {
      if (modalFullscreenLock) modalFullscreenLock.classList.remove('open');
    }
  }

  function exitExamFullscreen() {
    if (navigator.keyboard && navigator.keyboard.unlock) {
      try { navigator.keyboard.unlock(); } catch(e){}
    }
    if (isFullscreenActive()) {
      const exit = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
      if (exit) {
        try { exit.call(document).catch(() => {}); } catch(e){}
      }
    }
  }

  let lastFullscreenChangeTime = 0;

  function handleFullscreenChange() {
    lastFullscreenChangeTime = Date.now();
    if (STATE.isSubmitted || STATE.isAbruptTerminated) return;
    if (!isFullscreenActive()) {
      if (modalFullscreenLock) modalFullscreenLock.classList.add('open');
    } else {
      if (STATE.isTimerStarted && modalFullscreenLock) {
        modalFullscreenLock.classList.remove('open');
      }
    }
  }

  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.addEventListener('mozfullscreenchange', handleFullscreenChange);
  document.addEventListener('MSFullscreenChange', handleFullscreenChange);

  // Once candidate clicks 'Enter Full Screen & Lock Exam', start exam countdown!
  if (btnResumeFullscreen) {
    btnResumeFullscreen.addEventListener('click', (e) => {
      e.stopPropagation();
      enterExamFullscreen();
      startExamCountdown();
      if (modalFullscreenLock) modalFullscreenLock.classList.remove('open');
      if (STATE.violationCount === 1 && modalViolationWarning) {
        modalViolationWarning.classList.add('open');
      }
    });
  }

  // BeforeUnload Lock: Prevent accidental close or page reload during active 1-hour session
  window.addEventListener('beforeunload', (e) => {
    if (STATE.isTimerStarted && !STATE.isSubmitted && !STATE.isAbruptTerminated) {
      e.preventDefault();
      e.returnValue = "CBT Examination is active. Responses will be lost and test session terminated if you leave.";
      return e.returnValue;
    }
  });

  function applyStudentDetails(student) {
    if (!student) return;
    STATE.studentDetails = student;

    const candidateName = document.getElementById('candidateName');
    const candidateAvatar = document.getElementById('candidateAvatar');
    const candidateRollNo = document.getElementById('candidateRollNo');
    const candidateAgePill = document.getElementById('candidateAgePill');
    const candidateAge = document.getElementById('candidateAge');

    if (candidateName) candidateName.textContent = student.fullName;
    if (candidateAvatar) candidateAvatar.textContent = student.fullName.charAt(0).toUpperCase();
    if (candidateRollNo) candidateRollNo.textContent = 'NEET2024-' + student.age + '-' + (student.phone.slice(-4) || '0881');
    if (candidateAgePill && candidateAge) {
      candidateAge.textContent = student.age;
      candidateAgePill.style.display = 'inline-flex';
    }

    if (lockStudentName) lockStudentName.textContent = student.fullName;

    // Also update scorecard strip
    const sn = document.getElementById('scorecardStudentName');
    const sa = document.getElementById('scorecardStudentAge');
    const se = document.getElementById('scorecardStudentEmail');
    const sp = document.getElementById('scorecardStudentPhone');
    if (sn) sn.textContent = student.fullName;
    if (sa) sa.textContent = student.age;
    if (se) se.textContent = student.email;
    if (sp) sp.textContent = student.phone;

    // Update abrupt modal
    const an = document.getElementById('abruptStudentName');
    const ar = document.getElementById('abruptStudentRoll');
    if (an) an.textContent = student.fullName;
    if (ar) ar.textContent = 'NEET2024-' + student.age + '-' + (student.phone.slice(-4) || '0881');

    // Notify admin portal of candidate registration
    sendExamTelemetry('register', { status: 'LIVE_TESTING' });
  }

  function validateAgeDDMMYY(val) {
    if (!val) return false;
    const clean = val.replace(/[\/\-\s]/g, '');
    if (clean.length !== 6 && clean.length !== 8) return false;
    const d = parseInt(clean.slice(0, 2), 10);
    const m = parseInt(clean.slice(2, 4), 10);
    if (isNaN(d) || d < 1 || d > 31) return false;
    if (isNaN(m) || m < 1 || m > 12) return false;
    return true;
  }

  function showTestStudentError(msg, el) {
    if (testStudentAlert) {
      testStudentAlert.textContent = msg;
      testStudentAlert.style.display = 'block';
    }
    if (el) {
      el.classList.add('input-error');
      el.focus();
    }
  }

  // Check if student details exist from previous page
  let savedStudent = null;
  try {
    const raw = localStorage.getItem('sarvottam_cbt_student') || sessionStorage.getItem('sarvottam_cbt_student');
    if (raw) savedStudent = JSON.parse(raw);
  } catch(e){}

  if (savedStudent && savedStudent.fullName) {
    applyStudentDetails(savedStudent);
    // Display fullscreen lock overlay; countdown starts strictly when user clicks 'Enter Full Screen & Lock Exam'
    if (modalFullscreenLock) {
      modalFullscreenLock.classList.add('open');
    }
  } else {
    // Show student details modal before launching exam
    if (modalStudentDetails) {
      modalStudentDetails.classList.add('open');
    }
  }

  if (btnLaunchExamModal) {
    btnLaunchExamModal.addEventListener('click', () => {
      if (testStudentAlert) testStudentAlert.style.display = 'none';
      [inputTestName, inputTestAge, inputTestEmail, inputTestPhone].forEach(i => i && i.classList.remove('input-error'));

      const fn = inputTestName ? inputTestName.value.trim() : '';
      const ag = inputTestAge ? inputTestAge.value.trim() : '';
      const em = inputTestEmail ? inputTestEmail.value.trim() : '';
      const ph = inputTestPhone ? inputTestPhone.value.trim() : '';

      if (!fn || fn.length < 2) {
        showTestStudentError("Please enter the student's full name (minimum 2 characters).", inputTestName);
        return;
      }
      if (!validateAgeDDMMYY(ag)) {
        showTestStudentError('Please enter a valid age / DOB in DDMMYY format (e.g. 180506 for 18 May 2006).', inputTestAge);
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!em || !emailRegex.test(em)) {
        showTestStudentError('Please enter a valid email address.', inputTestEmail);
        return;
      }
      const cleanPhone = ph.replace(/[\+\-\s\(\)]/g, '');
      if (!cleanPhone || !/^\d{10}$/.test(cleanPhone)) {
        showTestStudentError('Please enter a valid 10-digit mobile phone number.', inputTestPhone);
        return;
      }

      const studentData = {
        fullName: fn,
        age: ag,
        email: em,
        phone: cleanPhone,
        registeredAt: new Date().toISOString()
      };

      try {
        localStorage.setItem('sarvottam_cbt_student', JSON.stringify(studentData));
        sessionStorage.setItem('sarvottam_cbt_student', JSON.stringify(studentData));
      } catch(e){}

      applyStudentDetails(studentData);
      if (modalStudentDetails) modalStudentDetails.classList.remove('open');
      // Show fullscreen lock overlay so candidate explicitly clicks 'Enter Full Screen & Lock Exam' to start countdown
      if (modalFullscreenLock) modalFullscreenLock.classList.add('open');
    });
  }

  // Render question
  function loadQuestion(index) {
    if (index < 0 || index >= NEET_QUESTIONS.length) return;
    STATE.currentIndex = index;
    const q = NEET_QUESTIONS[index];

    // Update status if it was not visited
    if (STATE.status[q.id] === 'not-visited' && !STATE.isSubmitted) {
      STATE.status[q.id] = 'not-answered';
    }

    displayQNum.textContent = `Question No. ${q.id} (${q.section})`;
    displayQTopic.textContent = q.topic;
    displayQText.textContent = q.question;

    // Diagram
    if (q.diagram) {
      diagramImg.src = q.diagram;
      diagramContainer.style.display = 'block';
    } else {
      diagramContainer.style.display = 'none';
    }

    // Options
    optionsContainer.innerHTML = '';
    const chosen = STATE.userAnswers[q.id];
    const correctChoice = q.correctAnswer ? q.correctAnswer.toLowerCase() : 'a';

    ['a', 'b', 'c', 'd'].forEach((optKey) => {
      const optText = q.options[optKey] || '';
      const card = document.createElement('div');
      card.className = 'cbt-option-card' + (chosen === optKey ? ' selected' : '');
      
      if (STATE.isSubmitted) {
        if (optKey === correctChoice) {
          card.classList.add('is-correct');
        }
        if (chosen === optKey && optKey !== correctChoice) {
          card.classList.add('is-incorrect');
        }
      }

      const letterLabel = `(${optKey.toUpperCase()})`;
      card.innerHTML = `
        <div class="cbt-radio-custom"></div>
        <span class="cbt-opt-key">${letterLabel}</span>
        <span class="cbt-opt-text">${optText}</span>
        ${STATE.isSubmitted && optKey === correctChoice ? '<span style="font-size:0.72rem;background:#16a34a;color:#fff;padding:2px 8px;border-radius:4px;font-weight:700;margin-left:auto;">CORRECT</span>' : ''}
        ${STATE.isSubmitted && chosen === optKey && optKey !== correctChoice ? '<span style="font-size:0.72rem;background:#ef4444;color:#fff;padding:2px 8px;border-radius:4px;font-weight:700;margin-left:auto;">YOUR CHOICE</span>' : ''}
      `;

      if (!STATE.isSubmitted) {
        card.addEventListener('click', () => {
          document.querySelectorAll('.cbt-option-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          STATE.userAnswers[q.id] = optKey;
        });
      }
      optionsContainer.appendChild(card);
    });

    // If review/result mode
    if (STATE.isSubmitted) {
      reviewBox.style.display = 'block';
      const userChoice = STATE.userAnswers[q.id];
      document.getElementById('reviewCorrectKey').textContent = correctChoice.toUpperCase();
      document.getElementById('reviewCorrectText').textContent = q.options[correctChoice] || '';
      reviewExpText.textContent = q.explanation || 'Refer to NCERT Biology textbook for detailed concepts.';

      const expDiagWrap = document.getElementById('reviewExpDiagramWrap');
      const expDiagImg = document.getElementById('reviewExpDiagramImg');
      if (q.expDiagram) {
        expDiagImg.src = q.expDiagram;
        expDiagWrap.style.display = 'block';
      } else {
        expDiagWrap.style.display = 'none';
      }

      if (!userChoice) {
        reviewStatusBadge.className = 'review-status-badge unattempted';
        reviewStatusBadge.textContent = 'NOT ATTEMPTED (0 Marks)';
      } else if (userChoice.toLowerCase() === correctChoice) {
        reviewStatusBadge.className = 'review-status-badge correct';
        reviewStatusBadge.textContent = 'CORRECT (+4 Marks)';
      } else {
        reviewStatusBadge.className = 'review-status-badge wrong';
        reviewStatusBadge.textContent = `INCORRECT (-1 Mark) — You Chose: (${userChoice.toUpperCase()})`;
      }
    } else {
      reviewBox.style.display = 'none';
    }

    updatePaletteUI();
    document.getElementById('qScrollArea').scrollTop = 0;
  }

  // Update Palette buttons and counters
  function updatePaletteUI() {
    let answered = 0, notAnswered = 0, notVisited = 0, markedReview = 0, ansReview = 0;

    NEET_QUESTIONS.forEach((q) => {
      const st = STATE.status[q.id];
      if (st === 'answered') answered++;
      else if (st === 'not-answered') notAnswered++;
      else if (st === 'not-visited') notVisited++;
      else if (st === 'marked-review') markedReview++;
      else if (st === 'ans-review') ansReview++;
    });

    document.getElementById('countAnswered').textContent = answered;
    document.getElementById('countNotAnswered').textContent = notAnswered;
    document.getElementById('countNotVisited').textContent = notVisited;
    document.getElementById('countMarkedReview').textContent = markedReview;
    document.getElementById('countAnsReview').textContent = ansReview;

    // Filtered questions
    paletteGrid.innerHTML = '';
    let visibleCount = 0;

    NEET_QUESTIONS.forEach((q, idx) => {
      let isVisible = true;
      if (STATE.activeSection === 'botany-a' && (q.id < 1 || q.id > 35)) isVisible = false;
      if (STATE.activeSection === 'botany-b' && (q.id < 36 || q.id > 50)) isVisible = false;

      if (isVisible) {
        visibleCount++;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `q-palette-btn ${STATE.status[q.id]}` + (STATE.currentIndex === idx ? ' current' : '');
        btn.textContent = q.id;
        btn.addEventListener('click', () => {
          const curQ = NEET_QUESTIONS[STATE.currentIndex];
          if (STATE.userAnswers[curQ.id] && !STATE.isSubmitted) {
            if (STATE.status[curQ.id] !== 'ans-review' && STATE.status[curQ.id] !== 'marked-review') {
              STATE.status[curQ.id] = 'answered';
            }
          }
          loadQuestion(idx);
        });
        paletteGrid.appendChild(btn);
      }
    });

    document.getElementById('paletteFilteredCount').textContent = visibleCount;
  }

  // Action Button Handlers
  document.getElementById('btnSaveNext').addEventListener('click', () => {
    const q = NEET_QUESTIONS[STATE.currentIndex];
    if (STATE.userAnswers[q.id]) {
      STATE.status[q.id] = 'answered';
    } else {
      STATE.status[q.id] = 'not-answered';
    }
    loadQuestion(STATE.currentIndex + 1);
  });

  document.getElementById('btnSaveReview').addEventListener('click', () => {
    const q = NEET_QUESTIONS[STATE.currentIndex];
    if (STATE.userAnswers[q.id]) {
      STATE.status[q.id] = 'ans-review';
    } else {
      STATE.status[q.id] = 'marked-review';
    }
    loadQuestion(STATE.currentIndex + 1);
  });

  document.getElementById('btnReviewNext').addEventListener('click', () => {
    const q = NEET_QUESTIONS[STATE.currentIndex];
    if (STATE.userAnswers[q.id]) {
      STATE.status[q.id] = 'ans-review';
    } else {
      STATE.status[q.id] = 'marked-review';
    }
    loadQuestion(STATE.currentIndex + 1);
  });

  document.getElementById('btnClearResp').addEventListener('click', () => {
    const q = NEET_QUESTIONS[STATE.currentIndex];
    delete STATE.userAnswers[q.id];
    STATE.status[q.id] = 'not-answered';
    loadQuestion(STATE.currentIndex);
  });

  document.getElementById('btnPrevQ').addEventListener('click', () => {
    if (STATE.currentIndex > 0) loadQuestion(STATE.currentIndex - 1);
  });

  document.getElementById('btnNextQ').addEventListener('click', () => {
    if (STATE.currentIndex < NEET_QUESTIONS.length - 1) loadQuestion(STATE.currentIndex + 1);
  });

  // Section Tab Click Handlers
  document.querySelectorAll('.section-tab-btn').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.section-tab-btn').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      STATE.activeSection = tab.dataset.sec;

      // Jump to first question in that section
      let jumpIndex = 0;
      if (STATE.activeSection === 'botany-b') jumpIndex = 35;
      
      loadQuestion(jumpIndex);
    });
  });

  document.getElementById('btnResetFilter').addEventListener('click', () => {
    document.querySelectorAll('.section-tab-btn').forEach(t => t.classList.remove('active'));
    document.querySelector('.section-tab-btn[data-sec="all"]').classList.add('active');
    STATE.activeSection = 'all';
    updatePaletteUI();
  });

  // Modals Management

  document.getElementById('btnSubmitExam').addEventListener('click', () => {
    let answered = 0, notAnswered = 0, notVisited = 0, markedReview = 0;
    NEET_QUESTIONS.forEach((q) => {
      const st = STATE.status[q.id];
      if (st === 'answered' || st === 'ans-review') answered++;
      else if (st === 'not-answered') notAnswered++;
      else if (st === 'not-visited') notVisited++;
      else if (st === 'marked-review') markedReview++;
    });

    document.getElementById('modalCountAns').textContent = answered;
    document.getElementById('modalCountNotAns').textContent = notAnswered;
    document.getElementById('modalCountRev').textContent = markedReview;
    document.getElementById('modalCountNotVis').textContent = notVisited;

    modalSubmitConfirm.classList.add('open');
  });

  document.getElementById('btnResumeTest').addEventListener('click', () => {
    modalSubmitConfirm.classList.remove('open');
  });

  document.getElementById('btnFinalSubmit').addEventListener('click', () => {
    modalSubmitConfirm.classList.remove('open');
    submitFinalTest();
  });

  function submitFinalTest() {
    STATE.isSubmitted = true;
    clearInterval(timerInterval);

    // Screen Unlock: release beforeunload lock, hide fullscreen lock overlay, exit fullscreen
    window.onbeforeunload = null;
    if (modalFullscreenLock) modalFullscreenLock.classList.remove('open');
    exitExamFullscreen();

    let correct = 0;
    let wrong = 0;
    let unattempted = 0;

    NEET_QUESTIONS.forEach((q) => {
      const userAns = STATE.userAnswers[q.id];
      if (!userAns) {
        unattempted++;
      } else if (userAns.toLowerCase() === q.correctAnswer.toLowerCase()) {
        correct++;
      } else {
        wrong++;
      }
    });

    const score = (correct * 4) - (wrong * 1);
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalCorrect').textContent = correct;
    document.getElementById('finalWrong').textContent = wrong;
    document.getElementById('finalUnatt').textContent = unattempted;

    let perf = 'Good performance! Review your incorrect answers to improve accuracy.';
    if (score >= 170) perf = '🌟 Phenomenal Score! Outstanding NEET Botany readiness!';
    else if (score >= 140) perf = '🎯 Great Score! Target weak chapters for top government medical colleges.';
    else if (score < 90) perf = '📚 Thorough revision of NCERT Botany concepts is recommended.';
    document.getElementById('finalPerformanceText').textContent = perf;

    modalScorecard.classList.add('open');
    activateReturnToHomepageUI(false);
    sendExamTelemetry('submit_exam', {
      status: 'COMPLETED',
      score: score,
      correct: correct,
      wrong: wrong,
      unattempted: unattempted
    });
  }

  document.getElementById('btnReviewSolutions').addEventListener('click', () => {
    modalScorecard.classList.remove('open');
    loadQuestion(0);
  });

  document.getElementById('btnRetakeTest').addEventListener('click', () => {
    if (confirm('Do you want to reset all answers and re-take the mock test?')) {
      location.reload();
    }
  });

  // Instructions Modal
  document.getElementById('btnViewInstructions').addEventListener('click', () => {
    modalInstructions.classList.add('open');
  });
  document.getElementById('btnCloseInstructions').addEventListener('click', () => {
    modalInstructions.classList.remove('open');
  });

  // Paper View Modal
  const fullPaperContainer = document.getElementById('fullPaperContainer');
  document.getElementById('btnQuestionPaper').addEventListener('click', () => {
    fullPaperContainer.innerHTML = '';
    NEET_QUESTIONS.forEach((q) => {
      const qBox = document.createElement('div');
      qBox.style.padding = '14px 0';
      qBox.style.borderBottom = '1px solid #e2e8f0';
      
      let optsHtml = '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-top:8px;font-size:0.86rem;color:#475569;">';
      ['a', 'b', 'c', 'd'].forEach(k => {
        const letterLabel = `(${k.toUpperCase()})`;
        optsHtml += `<div><strong>${letterLabel}</strong> ${q.options[k] || ''}</div>`;
      });
      optsHtml += '</div>';

      let diagHtml = '';
      if (q.diagram) {
        diagHtml = `<div style="margin:8px 0;"><img src="${q.diagram}" style="max-height:160px;border-radius:6px;border:1px solid #cbd5e1;"></div>`;
      }

      qBox.innerHTML = `
        <div style="font-weight:700;color:var(--navy);font-size:0.92rem;">Q${q.id}. [${q.section}] ${q.topic}</div>
        <div style="margin-top:6px;font-size:0.92rem;line-height:1.5;">${q.question}</div>
        ${diagHtml}
        ${optsHtml}
      `;
      fullPaperContainer.appendChild(qBox);
    });
    modalQuestionPaper.classList.add('open');
  });

  document.getElementById('btnClosePaperView').addEventListener('click', () => {
    modalQuestionPaper.classList.remove('open');
  });

  // Close modals on clicking backdrop (never close security modals on backdrop click)
  [modalSubmitConfirm, modalScorecard, modalInstructions, modalQuestionPaper].forEach(m => {
    m.addEventListener('click', (e) => {
      if (e.target === m && m !== modalScorecard) m.classList.remove('open');
    });
  });

  // Strict Anti-Cheating & Text-Selection Blocking
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  });

  document.addEventListener('copy', (e) => { e.preventDefault(); return false; });
  document.addEventListener('cut', (e) => { e.preventDefault(); return false; });
  document.addEventListener('paste', (e) => { e.preventDefault(); return false; });
  document.addEventListener('dragstart', (e) => { e.preventDefault(); return false; });

  document.addEventListener('keydown', (e) => {
    // If test is active, intercept navigation / keys to enforce 1-hour screen lock
    if (!STATE.isSubmitted && !STATE.isAbruptTerminated) {
      // F11: manage fullscreen cleanly
      if (e.key === 'F11') {
        e.preventDefault();
        enterExamFullscreen();
        return false;
      }
      // F5 or Ctrl+R (Reload)
      if (e.key === 'F5' || (e.ctrlKey && e.key.toLowerCase() === 'r')) {
        e.preventDefault();
        return false;
      }
      // Browser Back/Forward (Alt+Left, Alt+Right)
      if (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        return false;
      }
      // Backspace outside inputs
      if (e.key === 'Backspace' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        return false;
      }
      // Escape
      if (e.key === 'Escape') {
        e.preventDefault();
        return false;
      }
    }

    // Block common shortcuts for inspection / copying / printing / saving
    if (
      (e.ctrlKey && ['c', 'v', 'x', 's', 'u', 'p', 'a'].includes(e.key.toLowerCase())) ||
      (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase())) ||
      e.key === 'F12'
    ) {
      e.preventDefault();
      return false;
    }
    // Block Alt+Tab if trapped
    if (e.altKey && e.key === 'Tab') {
      e.preventDefault();
      return false;
    }
  });

  // AI PROCTORING & TAB-SWITCH MONITORING

  let lastViolationTime = 0;
  const VIOLATION_COOLDOWN_MS = 2500; // Cooldown to avoid duplicate triggers on same switch

  function registerViolation() {
    if (STATE.isSubmitted || STATE.isAbruptTerminated || !STATE.isTimerStarted) return;
    
    const now = Date.now();
    if (now - lastViolationTime < VIOLATION_COOLDOWN_MS) return;
    lastViolationTime = now;

    STATE.violationCount++;
    if (violationCountBadge) {
      violationCountBadge.textContent = STATE.violationCount;
    }

    if (STATE.violationCount === 1) {
      // 1st Violation: Warning Modal
      modalViolationWarning.classList.add('open');
      sendExamTelemetry('proctor_warning', { proctorFlags: 1, status: 'LIVE_TESTING' });
    } else if (STATE.violationCount >= 2) {
      // 2nd Violation: Immediate Auto-Submit as ABRUPT with NO SCORE
      triggerAbruptTermination();
    }
  }

  // Detect Visibility Change (switching tabs or minimizing window)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      registerViolation();
    } else {
      // Candidate returned to the exam tab!
      if (STATE.violationCount === 1 && !STATE.isSubmitted && !STATE.isAbruptTerminated) {
        if (modalViolationWarning) modalViolationWarning.classList.add('open');
      }
    }
  });

  // Detect window blur (minimizing, opening another browser, or alt-tabbing)
  window.addEventListener('blur', () => {
    // Ignore blur events caused by browser exiting fullscreen via Esc key transition
    if (Date.now() - lastFullscreenChangeTime < 1200) return;
    registerViolation();
  });

  // When window receives focus back, ensure active violation warning is displayed right in front
  window.addEventListener('focus', () => {
    if (STATE.violationCount === 1 && !STATE.isSubmitted && !STATE.isAbruptTerminated) {
      if (modalViolationWarning) modalViolationWarning.classList.add('open');
    }
  });

  if (btnAckWarning) {
    btnAckWarning.addEventListener('click', (e) => {
      e.stopPropagation();
      if (modalViolationWarning) modalViolationWarning.classList.remove('open');
      enterExamFullscreen();
      if (modalFullscreenLock) modalFullscreenLock.classList.remove('open');
    });
  }

  // Return to Homepage Navigation Handler
  function goToHomepage(e) {
    if (e) e.preventDefault();
    if (STATE.isTimerStarted && !STATE.isSubmitted && !STATE.isAbruptTerminated) {
      if (!confirm('Are you sure you want to leave the examination? Unsubmitted responses will be lost.')) {
        return;
      }
    }
    // Release screen lock and exit fullscreen cleanly
    window.onbeforeunload = null;
    exitExamFullscreen();

    const path = window.location.pathname.split('\\\\').join('/');
    let targetUrl = '../sarvottam-hero.html';
    if (path.includes('/test/index.html') || path.endsWith('/test/')) {
      targetUrl = '../../sarvottam-hero.html';
    } else if (path.includes('/paper/')) {
      targetUrl = '../sarvottam-hero.html';
    } else {
      targetUrl = 'sarvottam-hero.html';
    }
    window.location.href = targetUrl;
  }

  // Activate Return to Homepage UI Elements on Test Completion or Abrupt Disqualification
  function activateReturnToHomepageUI(isAbrupt = false) {
    // 1. Switch toolbar actions to review / return mode
    const liveActions = document.getElementById('examLiveActionGroup');
    const reviewActions = document.getElementById('examReviewActionGroup');
    if (liveActions) liveActions.style.display = 'none';
    if (reviewActions) reviewActions.style.display = 'flex';

    // 2. Switch sidebar submit button
    const submitBtn = document.getElementById('btnSubmitExam');
    const sideHomeBtn = document.getElementById('btnSidebarReturnHome');
    if (submitBtn) submitBtn.style.display = 'none';
    if (sideHomeBtn) sideHomeBtn.style.display = 'block';

    // 3. Highlight and activate topbar return home button
    const topHomeBtn = document.getElementById('btnTopReturnHome');
    if (topHomeBtn) {
      topHomeBtn.classList.add('highlight-active');
      if (isAbrupt) {
        topHomeBtn.style.background = '#dc2626';
        topHomeBtn.style.borderColor = '#f87171';
      }
    }

    // 4. Update candidate status badge if normal submit
    if (proctorStatusPill && !isAbrupt) {
      proctorStatusPill.style.background = '#ecfdf5';
      proctorStatusPill.style.borderColor = '#6ee7b7';
      proctorStatusPill.style.color = '#047857';
      proctorStatusPill.innerHTML = '<span style="width:8px;height:8px;border-radius:50%;background:#10b981;"></span> STATUS: TEST COMPLETED';
    }

    // 5. Ensure all return home buttons are completely active & clickable
    document.querySelectorAll('.btn-return-home-action, .btn-return-home').forEach(b => {
      b.disabled = false;
      b.style.pointerEvents = 'auto';
      b.style.opacity = '1';
      b.style.cursor = 'pointer';
    });
  }

  function triggerAbruptTermination() {
    STATE.isAbruptTerminated = true;
    STATE.isSubmitted = true;
    clearInterval(timerInterval);

    // Screen Unlock: release beforeunload lock, hide fullscreen lock overlay, exit fullscreen
    window.onbeforeunload = null;
    if (modalFullscreenLock) modalFullscreenLock.classList.remove('open');
    exitExamFullscreen();

    // Close any open dialogue
    if (modalViolationWarning) modalViolationWarning.classList.remove('open');
    if (modalSubmitConfirm) modalSubmitConfirm.classList.remove('open');
    if (modalScorecard) modalScorecard.classList.remove('open');
    if (modalInstructions) modalInstructions.classList.remove('open');
    if (modalQuestionPaper) modalQuestionPaper.classList.remove('open');

    // Disable all options and test controls EXCEPT Return to Homepage
    document.querySelectorAll('.cbt-option-card').forEach(c => {
      c.style.pointerEvents = 'none';
      c.style.opacity = '0.4';
    });
    document.querySelectorAll('.cbt-btn:not(.btn-return-home-action):not(.btn-return-home)').forEach(b => {
      b.disabled = true;
      b.style.pointerEvents = 'none';
      b.style.opacity = '0.4';
    });

    if (proctorStatusPill) {
      proctorStatusPill.style.background = '#450a0a';
      proctorStatusPill.style.borderColor = '#ef4444';
      proctorStatusPill.style.color = '#ffffff';
      proctorStatusPill.innerHTML = '<span style="width:8px;height:8px;border-radius:50%;background:#ef4444;"></span> STATUS: DISQUALIFIED (ABRUPT)';
    }

    timerDisplay.textContent = 'TERMINATED';
    timerDisplay.style.color = '#ef4444';

    // Activate Return to Homepage UI Elements
    activateReturnToHomepageUI(true);

    // Show Abrupt Termination modal permanently
    modalAbruptTermination.classList.add('open');
    sendExamTelemetry('abrupt_terminate', {
      status: 'DISQUALIFIED_ABRUPT',
      score: 0,
      proctorFlags: STATE.violationCount || 2
    });
  }

  // Wire Return to Homepage buttons
  document.querySelectorAll('.btn-return-home-action, .btn-return-home').forEach(btn => {
    btn.addEventListener('click', goToHomepage);
  });

  const btnBackToScorecard = document.getElementById('btnBackToScorecard');
  if (btnBackToScorecard) {
    btnBackToScorecard.addEventListener('click', () => {
      if (modalScorecard) modalScorecard.classList.add('open');
    });
  }

  // Initial load
  loadQuestion(0);
})();
</script>
</body>
</html>
'''

import os

out_paths = [
    'd:/sarvottam/paper/test.html',
    'd:/sarvottam/paper/index.html',
    'd:/sarvottam/admin page only/public/paper/test.html',
    'd:/sarvottam/admin page only/public/paper/index.html',
]

for p in out_paths:
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, 'w', encoding='utf-8') as f:
        f.write(html_content)

deep_html = html_content.replace('../sarvottam-hero.html', '../../sarvottam-hero.html')
deep_paths = [
    'd:/sarvottam/paper/test/index.html',
    'd:/sarvottam/admin page only/public/paper/test/index.html',
]
for dp in deep_paths:
    os.makedirs(os.path.dirname(dp), exist_ok=True)
    with open(dp, 'w', encoding='utf-8') as f:
        f.write(deep_html)

print('Generated test pages successfully across local and Next.js public routes! Size:', len(html_content))
