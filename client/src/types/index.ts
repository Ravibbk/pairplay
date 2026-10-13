export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  partnerCode: string;
  interests?: string[];
  loveLanguage?: string | null;
  createdAt?: string;
  partner?: {
    id: string;
    displayName: string;
    avatarUrl?: string | null;
    email?: string;
    partnerCode?: string;
  } | null;
  coupleId?: string | null;
}

export interface Room {
  id: string;
  code: string;
  hostId: string;
  partnerId?: string | null;
  status: 'WAITING' | 'IN_GAME' | 'FINISHED' | 'ABANDONED';
  category: string;
  createdAt: string;
  host: {
    id: string;
    displayName: string;
    avatarUrl?: string | null;
    partnerCode?: string;
  };
  partner?: {
    id: string;
    displayName: string;
    avatarUrl?: string | null;
    partnerCode?: string;
  } | null;
}

export interface GameAnswer {
  id: string;
  userId: string;
  answerText: string;
  reaction?: string | null;
  submittedAt: string;
  user?: {
    id: string;
    displayName: string;
    avatarUrl?: string | null;
  };
}

export interface GameQuestion {
  id: string;
  orderIndex: number;
  questionText: string;
  category: string;
  userHasAnswered: boolean;
  partnerHasAnswered: boolean;
  isRevealed: boolean;
  answers: GameAnswer[];
}

export interface GameSession {
  id: string;
  roomId: string;
  roomCode: string;
  category: string;
  status: 'PREPARING' | 'IN_PROGRESS' | 'REVEALING' | 'COMPLETED' | 'CANCELLED';
  currentQuestionIndex: number;
  totalQuestions: number;
  startedAt: string;
  completedAt?: string | null;
  players: {
    host: { id: string; displayName: string; avatarUrl?: string | null };
    partner?: { id: string; displayName: string; avatarUrl?: string | null } | null;
  };
  currentQuestion: GameQuestion | null;
  questions: GameQuestion[];
}

export interface DailySpark {
  id: string;
  date: string;
  questionText: string;
  category: string;
  isAiGenerated: boolean;
}

export interface AnalyticsKPIs {
  totalUsers: number;
  roomsCreated: number;
  gamesStarted: number;
  gamesCompleted: number;
  totalQuestionsAnswered: number;
  roomToGameConversion: string;
  gameCompletionRate: string;
  avgQuestionsPerGame: string;
  aiFailureRate: string;
  reconnectRecoveryCount: number;
  invitationsAccepted: number;
}
