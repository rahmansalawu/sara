# Sara - YouTube Transcript Reader Features PRD

## Core Infrastructure Improvements

### 1. Data Types and Interfaces
**Purpose:** Ensure consistent data flow throughout the application

#### Requirements:
- [ ] Core Data Types
  ```typescript
  interface TranscriptItem {
    text: string;
    offset: number;
    duration: number;
  }

  interface TranscriptResponse {
    transcript: TranscriptItem[];
    videoTitle: string;
    fromCache: boolean;
    quotaRemaining?: number;
  }

  interface ApiResponse<T> {
    data: T;
    fromCache: boolean;
    quotaRemaining?: number;
    error?: string;
  }
  ```

### 2. Rate Limiting & Cost Control
**Purpose:** Protect personal usage from excessive API costs and rate limits

#### Requirements:
- [ ] Rate Limiter Class Implementation
  ```typescript
  interface RateLimitConfig {
    openai: {
      maxRequests: number;  // 50 per day
      resetPeriod: number;  // 24 hours in ms
    };
    youtube: {
      maxQuota: number;    // 100 units per day
      resetTime: string;   // "00:00" UTC
    };
  }
  ```
- [ ] Rate Limit Storage
  ```typescript
  interface RateLimitStore {
    counter: number;
    lastReset: number;
    quotaUsed: number;
  }
  ```
- [ ] Rate Limit Error Handling
  - Implement RateLimitError class
  - Return specific error codes (429 for rate limit)
  - Include reset time in error response

### 3. Caching System
**Purpose:** Optimize performance and reduce unnecessary API calls

#### Requirements:
- [ ] Cache Manager Implementation
  ```typescript
  interface CacheConfig {
    maxItems: number;      // 50 items
    expiryTime: number;    // 7 days in ms
    storageKey: string;    // "sara_cache"
  }

  interface CacheItem<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
  }

  interface CacheStore {
    [key: string]: CacheItem<any>;
  }
  ```
- [ ] Cache Keys Format
  ```typescript
  const cacheKeys = {
    transcript: (videoId: string) => `transcript_${videoId}`,
    enhanced: (videoId: string) => `enhanced_${videoId}`,
    tldr: (videoId: string) => `tldr_${videoId}`,
  };
  ```
- [ ] Cache Operations
  - Implement get, set, delete, clear methods
  - Add cache hit/miss tracking
  - Auto-cleanup of expired items
  - LRU eviction when max items reached

### 4. Error Handling
**Purpose:** Provide consistent error handling across the application

#### Requirements:
- [ ] Error Types
  ```typescript
  interface AppError extends Error {
    code: string;
    status: number;
    details?: any;
  }
  ```
- [ ] Error Codes
  ```typescript
  enum ErrorCode {
    RATE_LIMIT = 'RATE_LIMIT',
    INVALID_INPUT = 'INVALID_INPUT',
    API_ERROR = 'API_ERROR',
    CACHE_ERROR = 'CACHE_ERROR',
  }
  ```
- [ ] Error Responses
  ```typescript
  interface ErrorResponse {
    error: string;
    code: ErrorCode;
    status: number;
    details?: any;
  }
  ```

### 5. Testing Infrastructure
**Purpose:** Ensure reliability and catch regressions

#### Requirements:
- [ ] Unit Tests
  - RateLimiter class
  - CacheManager class
  - Error handling utilities
  - Data transformation functions

- [ ] Integration Tests
  - API routes with mocked external services
  - Component rendering with different props
  - Error boundary behavior

- [ ] Test Utilities
  ```typescript
  interface MockConfig {
    rateLimits?: Partial<RateLimitConfig>;
    cache?: Partial<CacheConfig>;
    apis?: {
      youtube?: boolean;
      openai?: boolean;
    };
  }
  ```

## Component Requirements

### 1. VideoTranscript Component
**Purpose:** Main component for displaying video transcript and enhanced content

#### Requirements:
- [ ] Props Interface
  ```typescript
  interface VideoTranscriptProps {
    videoId: string;
    initialData?: {
      transcript?: TranscriptResponse;
      enhanced?: string;
      tldr?: string;
    };
  }
  ```
- [ ] State Management
  ```typescript
  interface VideoTranscriptState {
    loading: boolean;
    error: Error | null;
    transcript: TranscriptItem[];
    videoTitle: string;
    thumbnailUrl: string;
    showOriginal: boolean;
  }
  ```
- [ ] Error States
  - Loading skeleton
  - Error message display
  - Retry mechanism

### 2. EnhancedArticle Component
**Purpose:** Display AI-enhanced version of transcript

#### Requirements:
- [ ] Props Interface
  ```typescript
  interface EnhancedArticleProps {
    transcript: TranscriptItem[];
    videoId: string;
    cachedArticle?: string;
    onArticleGenerated?: (article: string) => void;
  }
  ```
- [ ] Error Handling
  - Loading state
  - Error display
  - Cache status indicator

### 3. TLDRSummary Component
**Purpose:** Display concise summary of video content

#### Requirements:
- [ ] Props Interface
  ```typescript
  interface TLDRSummaryProps {
    transcript: TranscriptItem[];
    videoId: string;
    cachedSummary?: string;
    onSummaryGenerated?: (summary: string) => void;
  }
  ```
- [ ] Error States
  - Loading skeleton
  - Error message
  - Cache indicator

## API Routes

### 1. Transcript Route
**Purpose:** Fetch and return video transcript

#### Requirements:
- [ ] Input Validation
  ```typescript
  interface TranscriptRequest {
    videoId: string;
  }
  ```
- [ ] Response Format
  ```typescript
  interface TranscriptRouteResponse {
    transcript: TranscriptItem[];
    videoTitle: string;
    fromCache: boolean;
    quotaRemaining?: number;
  }
  ```

### 2. Enhance Route
**Purpose:** Generate enhanced article from transcript

#### Requirements:
- [ ] Input Validation
  ```typescript
  interface EnhanceRequest {
    transcript: TranscriptItem[];
    videoId: string;
  }
  ```
- [ ] Response Format
  ```typescript
  interface EnhanceRouteResponse {
    article: string;
    fromCache: boolean;
    quotaRemaining?: number;
  }
  ```

### 3. TLDR Route
**Purpose:** Generate concise summary from transcript

#### Requirements:
- [ ] Input Validation
  ```typescript
  interface TLDRRequest {
    transcript: TranscriptItem[];
    videoId: string;
  }
  ```
- [ ] Response Format
  ```typescript
  interface TLDRRouteResponse {
    summary: string;
    fromCache: boolean;
    quotaRemaining?: number;
  }
  ```

## User Experience Features

### 1. Quick Wins - Phase 1
**Purpose:** Enhance content discovery and navigation

#### Requirements:
- [ ] Trending Videos Feed
  - Fetch top 10 trending videos
  - Filter by:
    - Language
    - Duration (short/medium/long)
    - Category (Education, Tech, etc.)
  - Auto-refresh every 6 hours
  - Save preferences locally

- [ ] Basic Swipe Interface
  - Swipe left/right between videos
  - Swipe up for full article
  - Swipe down to minimize
  - Touch & mouse support
  - Smooth animations
  - Preload next video data

### 2. Quick Wins - Phase 2
**Purpose:** Improve personal content management

#### Requirements:
- [ ] Reading History
  - Track last 50 viewed videos
  - Store locally:
    ```typescript
    interface HistoryEntry {
      videoId: string;
      title: string;
      viewedAt: Date;
      readingProgress: number;
      favorite: boolean;
    }
    ```
  - Clear history option
  - Export history functionality

- [ ] Personal Preferences
  - Theme selection (light/dark)
  - Text size adjustment
  - Reading progress tracking
  - Default view mode (enhanced/original)
  - Preferred language
  - Save preferences locally

- [ ] Sharing Features
  - Share as link
  - Copy article text
  - Export as PDF
  - Social media sharing
  - Share with reading progress

## Technical Specifications

### Storage Limits
- localStorage: Max 5MB
- Cache entry size: Max 100KB per video
- History: Maximum 50 entries
- Preferences: Maximum 1KB

### Performance Targets
- Initial load: < 2 seconds
- Swipe response: < 100ms
- Cache retrieval: < 50ms
- Article generation: < 10 seconds

### Browser Support
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

### Error Rates
- API failures: < 1%
- Cache misses: < 5%
- Rate limit hits: < 2%

## Implementation Priority
1. Basic Rate Limiting
2. Simple Caching
3. Reading History
4. Trending Videos
5. Swipe Interface
6. Personal Preferences
7. Sharing Features

## Future Considerations
- Offline support
- Multiple language support
- Browser extension
- Mobile app version
- Data sync across devices

---
Note: This PRD is focused on personal use and will be updated as requirements evolve.
