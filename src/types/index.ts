// Core Data Types
export interface TranscriptItem {
  text: string;
  offset: number;
  duration: number;
}

export interface TranscriptResponse {
  transcript: TranscriptItem[];
  videoTitle: string;
  fromCache: boolean;
  quotaRemaining?: number;
}

export interface ApiResponse<T> {
  data: T;
  fromCache: boolean;
  quotaRemaining?: number;
  error?: string;
}

// Rate Limiting Types
export interface RateLimitConfig {
  openai: {
    maxRequests: number;  // 50 per day
    resetPeriod: number;  // 24 hours in ms
  };
  youtube: {
    maxQuota: number;    // 100 units per day
    resetTime: string;   // "00:00" UTC
  };
}

export interface RateLimitStore {
  counter: number;
  lastReset: number;
  quotaUsed: number;
}

// Cache Types
export interface CacheConfig {
  maxItems: number;      // 50 items
  expiryTime: number;    // 7 days in ms
  storageKey: string;    // "sara_cache"
}

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface CacheStore {
  [key: string]: CacheItem<any>;
}

// Error Types
export interface AppError extends Error {
  code: string;
  status: number;
  details?: any;
}

export enum ErrorCode {
  RATE_LIMIT = 'RATE_LIMIT',
  INVALID_INPUT = 'INVALID_INPUT',
  API_ERROR = 'API_ERROR',
  CACHE_ERROR = 'CACHE_ERROR',
}

export interface ErrorResponse {
  error: string;
  code: ErrorCode;
  status: number;
  details?: any;
}

// Component Props Types
export interface VideoTranscriptProps {
  videoId: string;
  initialData?: {
    transcript?: TranscriptResponse;
    enhanced?: string;
    tldr?: string;
  };
}

export interface EnhancedArticleProps {
  transcript: TranscriptItem[];
  videoId: string;
  cachedArticle?: string;
  onArticleGenerated?: (article: string) => void;
}

export interface TLDRSummaryProps {
  transcript: TranscriptItem[];
  videoId: string;
  cachedSummary?: string;
  onSummaryGenerated?: (summary: string) => void;
}

// API Route Types
export interface TranscriptRequest {
  videoId: string;
}

export interface EnhanceRequest {
  transcript: TranscriptItem[];
  videoId: string;
}

export interface TLDRRequest {
  transcript: TranscriptItem[];
  videoId: string;
}

// Cache Keys
export const cacheKeys = {
  transcript: (videoId: string) => `transcript_${videoId}`,
  enhanced: (videoId: string) => `enhanced_${videoId}`,
  tldr: (videoId: string) => `tldr_${videoId}`,
} as const;
