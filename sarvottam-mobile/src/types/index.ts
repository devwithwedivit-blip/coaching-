// Reused directly from Next.js Admin & CBT Backend
export interface CandidateRecord {
  id: string;
  rollNo: string;
  fullName: string;
  age: string; // DDMMYY format
  dobFormatted?: string;
  email: string;
  phone: string;
  stream: string;
  subject: string;
  registeredAt: string;
  lastActiveAt?: string;
  status: 'LIVE_TESTING' | 'COMPLETED' | 'DISQUALIFIED_ABRUPT';
  score: number | null;
  maxScore: number;
  correct: number | null;
  wrong: number | null;
  unattempted: number | null;
  proctorFlags: number;
}

export interface DashboardStats {
  totalRegistrations: number;
  activeLiveSessions: number;
  completedTests: number;
  disqualifiedAttempts: number;
  averageScore: number;
  botanySectionAAvg: number;
  botanySectionBAvg: number;
  proctorAlertsTotal: number;
}

// Student & User Types
export interface StudentUser {
  fullName: string;
  age: string;
  email: string;
  phone: string;
  rollNo: string;
  targetExam: string;
  registeredAt: string;
}

export interface AdminUser {
  name: string;
  email: string;
  role: 'super_admin';
  token?: string;
}

export type UserRole = 'student' | 'admin' | null;

// Courses & Academic Verticals
export interface CourseVertical {
  id: string;
  num: string;
  title: string;
  badge: string;
  subtitle: string;
  description: string;
  bannerImage: string;
  offerings: string[];
  features: string[];
  batchSchedule: string;
  facultyLead: string;
}

// Live Classes
export interface LiveClass {
  id: string;
  title: string;
  stream: string;
  subject: string;
  instructor: string;
  instructorTitle: string;
  status: 'LIVE_NOW' | 'UPCOMING' | 'COMPLETED';
  startTime: string;
  duration: string;
  attendeesCount: number;
  topic: string;
  roomLink: string;
}

// Video Lectures
export interface VideoLecture {
  id: string;
  title: string;
  stream: string;
  subject: string;
  chapter: string;
  duration: string;
  instructor: string;
  views: number;
  rating: number;
  thumbnail: string;
  videoUrl: string;
  keyTopics: string[];
}

// Study Materials & PDFs
export interface StudyMaterial {
  id: string;
  title: string;
  stream: string;
  subject: string;
  category: 'Formula Sheet' | 'Chapter Notes' | 'NCERT Summary' | 'PYQ Paper' | 'Mind Map';
  fileSize: string;
  pages: number;
  downloadCount: number;
  pdfUrl: string;
  description: string;
}

// Doubts Hub
export interface DoubtItem {
  id: string;
  studentName: string;
  rollNo: string;
  stream: string;
  subject: string;
  questionText: string;
  topic: string;
  createdAt: string;
  status: 'RESOLVED' | 'UNDER_REVIEW';
  answerText?: string;
  facultyName?: string;
  facultyDesignation?: string;
  resolvedAt?: string;
  votes: number;
}

// CBT Exam Engine Types
export interface CbtQuestion {
  id: number;
  subject: string;
  section: string; // e.g. "Botany Section A" or "Botany Section B"
  topic: string;
  question: string;
  diagram: string | null;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  correctAnswer: 'a' | 'b' | 'c' | 'd';
  explanation: string;
  expDiagram: string | null;
}

export type QuestionStatus = 'ANSWERED' | 'NOT_ANSWERED' | 'MARKED_REVIEW' | 'NOT_VISITED';

export interface UserAnswerRecord {
  questionId: number;
  selectedOption: 'a' | 'b' | 'c' | 'd' | null;
  isMarkedForReview: boolean;
  timeSpentSeconds: number;
  visited: boolean;
}

export interface CbtExamMeta {
  id: string;
  title: string;
  stream: string;
  totalQuestions: number;
  durationMinutes: number;
  maxMarks: number;
  markingScheme: {
    correct: number;
    incorrect: number;
    unattempted: number;
  };
  sections: {
    name: string;
    total: number;
    compulsory: number;
  }[];
}

export interface ExamResultSummary {
  candidateName: string;
  rollNo: string;
  examTitle: string;
  score: number;
  maxScore: number;
  percentage: number;
  accuracy: number;
  totalQuestions: number;
  attempted: number;
  correct: number;
  wrong: number;
  unattempted: number;
  airRankEstimated: number;
  percentile: number;
  sectionAScore: number;
  sectionBScore: number;
  answers: Record<number, 'a' | 'b' | 'c' | 'd' | null>;
  completedAt: string;
}

// Cloud Relay & Connection Layer Types
export interface RelayFile {
  id: string;
  account_id: string;
  file_type: 'video' | 'pdf';
  title: string;
  original_name: string;
  relative_path: string;
  file_size: number;
  file_size_formatted: string;
  duration?: string;
  mime_type?: string;
  category?: string;
  subject?: string;
  file_hash?: string;
  updated_at?: string;
}

export interface RelayDeviceStatus {
  pcOnline: boolean;
  lastSeen: string | null;
  deviceName: string;
  filesCount: number;
  videoCount?: number;
  pdfCount?: number;
}

