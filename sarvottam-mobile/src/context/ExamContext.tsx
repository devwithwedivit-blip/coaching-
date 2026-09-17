import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { CbtQuestion, CbtExamMeta, ExamResultSummary, QuestionStatus } from '../types';
import { NEET_BOTANY_QUESTIONS } from '../data/questionsNeetBotany';
import { EXAMS_CATALOG } from '../data/examsCatalogData';
import { useAuth } from './AuthContext';
import { apiService } from '../services/api';
import { storage } from '../services/storage';

interface ExamContextType {
  activeExam: CbtExamMeta;
  questions: CbtQuestion[];
  currentIndex: number;
  currentQuestion: CbtQuestion | null;
  answers: Record<number, 'a' | 'b' | 'c' | 'd' | null>;
  markedForReview: Record<number, boolean>;
  visited: Record<number, boolean>;
  timeRemainingSeconds: number;
  isExamActive: boolean;
  isSubmitted: boolean;
  latestResult: ExamResultSummary | null;
  startExam: (examId?: string) => void;
  selectOption: (option: 'a' | 'b' | 'c' | 'd') => void;
  clearOption: () => void;
  toggleMarkForReview: () => void;
  goToQuestion: (index: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  submitExam: () => void;
  resetExam: () => void;
  getQuestionStatus: (qId: number) => QuestionStatus;
  getSummaryCounts: () => {
    answered: number;
    notAnswered: number;
    markedReview: number;
    notVisited: number;
  };
}

const ExamContext = createContext<ExamContextType>({} as ExamContextType);

export const ExamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { student } = useAuth();
  const [activeExam, setActiveExam] = useState<CbtExamMeta>(EXAMS_CATALOG[0]);
  const [questions, setQuestions] = useState<CbtQuestion[]>(NEET_BOTANY_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, 'a' | 'b' | 'c' | 'd' | null>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [visited, setVisited] = useState<Record<number, boolean>>({ 1: true });
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(45 * 60);
  const [isExamActive, setIsExamActive] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [latestResult, setLatestResult] = useState<ExamResultSummary | null>(null);

  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isExamActive && timeRemainingSeconds > 0 && !isSubmitted) {
      timerRef.current = setInterval(() => {
        setTimeRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            submitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isExamActive, isSubmitted]);

  const startExam = (examId?: string) => {
    const selectedExam = EXAMS_CATALOG.find((e) => e.id === examId) || EXAMS_CATALOG[0];
    setActiveExam(selectedExam);
    setQuestions(NEET_BOTANY_QUESTIONS);
    setCurrentIndex(0);
    setAnswers({});
    setMarkedForReview({});
    setVisited({ 1: true });
    setTimeRemainingSeconds(selectedExam.durationMinutes * 60);
    setIsExamActive(true);
    setIsSubmitted(false);

    if (student) {
      apiService.sendCbtTelemetry({
        action: 'start_exam',
        fullName: student.fullName,
        age: student.age,
        email: student.email,
        phone: student.phone,
        rollNo: student.rollNo,
        stream: selectedExam.stream,
        subject: selectedExam.title,
        status: 'LIVE_TESTING',
      }).catch(() => {});
    }
  };

  const currentQuestion = questions[currentIndex] || null;

  const selectOption = (option: 'a' | 'b' | 'c' | 'd') => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: option,
    }));
  };

  const clearOption = () => {
    if (!currentQuestion) return;
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[currentQuestion.id];
      return next;
    });
  };

  const toggleMarkForReview = () => {
    if (!currentQuestion) return;
    setMarkedForReview((prev) => ({
      ...prev,
      [currentQuestion.id]: !prev[currentQuestion.id],
    }));
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentIndex(index);
      const targetQ = questions[index];
      if (targetQ) {
        setVisited((prev) => ({ ...prev, [targetQ.id]: true }));
      }
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      goToQuestion(currentIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      goToQuestion(currentIndex - 1);
    }
  };

  const getQuestionStatus = (qId: number): QuestionStatus => {
    const isAns = answers[qId] !== undefined && answers[qId] !== null;
    const isRev = !!markedForReview[qId];
    const isVis = !!visited[qId];

    if (isRev) return 'MARKED_REVIEW';
    if (isAns) return 'ANSWERED';
    if (isVis) return 'NOT_ANSWERED';
    return 'NOT_VISITED';
  };

  const getSummaryCounts = () => {
    let answered = 0;
    let notAnswered = 0;
    let markedReview = 0;
    let notVisited = 0;

    questions.forEach((q) => {
      const status = getQuestionStatus(q.id);
      if (status === 'ANSWERED') answered++;
      else if (status === 'MARKED_REVIEW') markedReview++;
      else if (status === 'NOT_ANSWERED') notAnswered++;
      else notVisited++;
    });

    return { answered, notAnswered, markedReview, notVisited };
  };

  const submitExam = () => {
    setIsExamActive(false);
    setIsSubmitted(true);
    if (timerRef.current) clearInterval(timerRef.current);

    // Official NEET Scoring Algorithm:
    // Section A (Q1–35): 35 compulsory questions
    // Section B (Q36–50): 15 questions, first 10 attempted count
    let totalScore = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let unattemptedCount = 0;
    let sectionAScore = 0;
    let sectionBScore = 0;
    let secBAttempted = 0;

    questions.forEach((q) => {
      const selected = answers[q.id];
      const isSecB = q.section.includes('Section B');

      if (isSecB) {
        if (selected) {
          secBAttempted++;
          if (secBAttempted <= 10) {
            if (selected.toLowerCase() === q.correctAnswer.toLowerCase()) {
              totalScore += 4;
              sectionBScore += 4;
              correctCount++;
            } else {
              totalScore -= 1;
              sectionBScore -= 1;
              wrongCount++;
            }
          }
        } else {
          unattemptedCount++;
        }
      } else {
        // Section A
        if (selected) {
          if (selected.toLowerCase() === q.correctAnswer.toLowerCase()) {
            totalScore += 4;
            sectionAScore += 4;
            correctCount++;
          } else {
            totalScore -= 1;
            sectionAScore -= 1;
            wrongCount++;
          }
        } else {
          unattemptedCount++;
        }
      }
    });

    const attemptedCount = correctCount + wrongCount;
    const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;
    const maxScore = 200; // 45 * 4 = 180 or 50 questions
    const percentage = Math.max(0, Math.round((totalScore / maxScore) * 100));
    const percentile = Math.min(99.9, Math.max(10, Math.round((percentage * 0.95 + 15) * 10) / 10));
    const airRankEstimated = Math.max(1, Math.round((100 - percentile) * 230 + 12));

    const result: ExamResultSummary = {
      candidateName: student ? student.fullName : 'Student Candidate',
      rollNo: student ? student.rollNo : 'NEET2024-MOCK-0881',
      examTitle: activeExam.title,
      score: totalScore,
      maxScore: maxScore,
      percentage,
      accuracy,
      totalQuestions: questions.length,
      attempted: attemptedCount,
      correct: correctCount,
      wrong: wrongCount,
      unattempted: unattemptedCount,
      airRankEstimated,
      percentile,
      sectionAScore,
      sectionBScore,
      answers,
      completedAt: new Date().toISOString(),
    };

    setLatestResult(result);
    storage.setJson('sarvottam_latest_cbt_result', result);

    // Send final submission telemetry to admin server
    if (student) {
      apiService.sendCbtTelemetry({
        action: 'submit_exam',
        fullName: student.fullName,
        age: student.age,
        email: student.email,
        phone: student.phone,
        rollNo: student.rollNo,
        stream: activeExam.stream,
        subject: activeExam.title,
        status: 'COMPLETED',
        score: totalScore,
        correct: correctCount,
        wrong: wrongCount,
        unattempted: unattemptedCount,
      }).catch(() => {});
    }
  };

  const resetExam = () => {
    setIsExamActive(false);
    setIsSubmitted(false);
    setCurrentIndex(0);
    setAnswers({});
    setMarkedForReview({});
    setVisited({ 1: true });
    setLatestResult(null);
  };

  return (
    <ExamContext.Provider
      value={{
        activeExam,
        questions,
        currentIndex,
        currentQuestion,
        answers,
        markedForReview,
        visited,
        timeRemainingSeconds,
        isExamActive,
        isSubmitted,
        latestResult,
        startExam,
        selectOption,
        clearOption,
        toggleMarkForReview,
        goToQuestion,
        nextQuestion,
        prevQuestion,
        submitExam,
        resetExam,
        getQuestionStatus,
        getSummaryCounts,
      }}
    >
      {children}
    </ExamContext.Provider>
  );
};

export const useExam = () => useContext(ExamContext);
