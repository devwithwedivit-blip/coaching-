import { CbtExamMeta } from '../types';

export const EXAMS_CATALOG: CbtExamMeta[] = [
  {
    id: 'neet-botany-2024',
    title: 'NEET (UG) 2024 — Botany Official Mock Examination',
    stream: 'NEET',
    totalQuestions: 50,
    durationMinutes: 45,
    maxMarks: 200,
    markingScheme: {
      correct: 4,
      incorrect: -1,
      unattempted: 0,
    },
    sections: [
      { name: 'Botany Section A (Q1–35)', total: 35, compulsory: 35 },
      { name: 'Botany Section B (Q36–50)', total: 15, compulsory: 10 },
    ],
  },
  {
    id: 'jee-mains-physics',
    title: 'IIT-JEE Mains 2026 — Physics Full-Length Mock Test 01',
    stream: 'IIT-JEE',
    totalQuestions: 30,
    durationMinutes: 60,
    maxMarks: 100,
    markingScheme: {
      correct: 4,
      incorrect: -1,
      unattempted: 0,
    },
    sections: [
      { name: 'Section A: Single Choice (Q1–20)', total: 20, compulsory: 20 },
      { name: 'Section B: Numerical Value (Q21–30)', total: 10, compulsory: 5 },
    ],
  },
  {
    id: 'defense-nda-mock',
    title: 'NDA & NA General Ability & Mathematics CBT Drill',
    stream: 'Defense',
    totalQuestions: 50,
    durationMinutes: 60,
    maxMarks: 200,
    markingScheme: {
      correct: 4,
      incorrect: -1.33,
      unattempted: 0,
    },
    sections: [
      { name: 'Part A: English & Comprehension', total: 25, compulsory: 25 },
      { name: 'Part B: General Knowledge & Physics', total: 25, compulsory: 25 },
    ],
  },
  {
    id: 'upsc-csat-mock',
    title: 'UPSC Civil Services Preliminary Examination: GS Paper II (CSAT)',
    stream: 'UPSC',
    totalQuestions: 40,
    durationMinutes: 60,
    maxMarks: 100,
    markingScheme: {
      correct: 2.5,
      incorrect: -0.83,
      unattempted: 0,
    },
    sections: [
      { name: 'Reading Comprehension', total: 20, compulsory: 20 },
      { name: 'Quantitative Aptitude & Logical Reasoning', total: 20, compulsory: 20 },
    ],
  },
  {
    id: 'ca-foundation-mock',
    title: 'CA Foundation: Principles & Practice of Accounting Mock',
    stream: 'Commerce',
    totalQuestions: 40,
    durationMinutes: 60,
    maxMarks: 100,
    markingScheme: {
      correct: 2.5,
      incorrect: -0.625,
      unattempted: 0,
    },
    sections: [
      { name: 'Accounting Standards & Concepts', total: 20, compulsory: 20 },
      { name: 'Partnership & Company Accounts', total: 20, compulsory: 20 },
    ],
  },
];
