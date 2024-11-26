# Sara - YouTube Transcript Reader Features PRD

## 1. Infrastructure Layer

### 1.1 External API Integration
**Purpose:** Handle communication with external services

#### Requirements:
- [x] YouTube API Integration
  ```typescript
  interface YouTubeConfig {
    apiKey: string;
    quotaUnits: {
      videoDetails: number;
      transcriptList: number;
    };
  }
  ```
- [ ] OpenAI API Integration
  ```typescript
  interface OpenAIConfig {
    apiKey: string;
    model: string;
    maxTokens: number;
    temperature: number;
  }
  ```

### 1.2 Data Types and Interfaces
**Purpose:** Ensure consistent data flow throughout the application

#### Requirements:
- [x] Core Data Types
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

### 1.3 Rate Limiting & Cost Control
**Purpose:** Protect personal usage from excessive API costs and rate limits

#### Requirements:
- [x] Rate Limiter Class Implementation
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
- [x] Rate Limit Storage
  ```typescript
  interface RateLimitStore {
    counter: number;
    lastReset: number;
    quotaUsed: number;
  }
  ```
- [x] Rate Limit Error Handling
  - Implemented RateLimitError class
  - Return specific error codes (429 for rate limit)
  - Include reset time in error response

### 1.4 Caching System
**Purpose:** Optimize performance and reduce unnecessary API calls

#### Requirements:
- [x] Cache Manager Implementation
  ```typescript
  interface CacheConfig {
    maxItems: number;      // 50 items
    expiryTime: number;    // 7 days in ms
    storageKey: string;    // "sara_cache"
  }
  ```
- [x] Cache Operations
  - Implemented get, set, delete, clear methods
  - Added cache hit/miss tracking
  - Auto-cleanup of expired items
  - LRU eviction when max items reached

### 1.5 Error Handling
**Purpose:** Provide consistent error handling across the application

#### Requirements:
- [x] Error Types
  ```typescript
  interface AppError extends Error {
    code: string;
    status: number;
    details?: any;
  }
  ```
- [x] Error Codes
  ```typescript
  enum ErrorCode {
    RATE_LIMIT = 'RATE_LIMIT',
    INVALID_INPUT = 'INVALID_INPUT',
    API_ERROR = 'API_ERROR',
    CACHE_ERROR = 'CACHE_ERROR',
  }
  ```

## 2. Core Features

### 2.1 Video Transcript Component
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
- [ ] Component Implementation
  - Video metadata display
  - Transcript rendering
  - Loading states
  - Error handling
  - Progress tracking

### 2.2 Content Enhancement
**Purpose:** Transform transcripts into readable articles

#### Requirements:
- [ ] Enhancement Service
  ```typescript
  interface EnhancementConfig {
    maxLength: number;
    style: 'academic' | 'casual' | 'professional';
    format: 'markdown' | 'html';
  }
  ```
- [ ] TLDR Generation
  ```typescript
  interface TLDRConfig {
    maxLength: number;
    bulletPoints: boolean;
  }
  ```

### 2.3 Reading History
**Purpose:** Track and manage user's reading history

#### Requirements:
- [x] History Manager Implementation
  ```typescript
  interface HistoryEntry {
    videoId: string;
    title: string;
    viewedAt: Date;
    readingProgress: number;
    favorite: boolean;
  }
  ```
- [x] Storage Operations
  - Add/update entries
  - Track reading progress
  - Mark favorites
  - Export functionality

## 3. API Routes

### 3.1 Transcript Route
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

### 3.2 Enhancement Routes
**Purpose:** Generate enhanced content from transcripts

#### Requirements:
- [ ] Enhance Route
  ```typescript
  interface EnhanceRequest {
    transcript: TranscriptItem[];
    videoId: string;
    config?: EnhancementConfig;
  }
  ```
- [ ] TLDR Route
  ```typescript
  interface TLDRRequest {
    transcript: TranscriptItem[];
    videoId: string;
    config?: TLDRConfig;
  }
  ```

## 4. User Experience Features

### 4.1 Quick Wins - Phase 1
**Purpose:** Enhance content discovery and navigation

#### Requirements:
- [ ] Trending Videos Feed
  - Top 10 trending videos
  - Filtering options
  - Auto-refresh
- [ ] Basic Swipe Interface
  - Video navigation
  - Content view modes
  - Touch & mouse support

### 4.2 Quick Wins - Phase 2
**Purpose:** Improve personal content management

#### Requirements:
- [ ] Personal Preferences
  - Theme selection
  - Text size adjustment
  - Default view mode
  - Language preference
- [ ] Sharing Features
  - Link sharing
  - Text export
  - PDF export
  - Social media integration

## Technical Specifications

### Storage Limits
- localStorage: Max 5MB
- Cache entry size: Max 100KB per video
- History: Maximum 50 entries
- Preferences: Maximum 1KB

### Performance Targets
- Initial load: < 2 seconds
- Cache retrieval: < 50ms
- Article generation: < 10 seconds

### Performance Monitoring
- [ ] Client-Side Metrics
  ```typescript
  interface PerformanceMetrics {
    pageLoadTime: number;
    timeToInteractive: number;
    apiLatency: Record<string, number>;
    cacheHitRate: number;
  }
  ```
- [ ] Error Tracking
  ```typescript
  interface ErrorMetrics {
    apiFailureRate: number;    // Target: < 1%
    cacheMissRate: number;     // Target: < 5%
    rateLimitHitRate: number;  // Target: < 2%
  }
  ```
- [ ] Usage Analytics
  ```typescript
  interface UsageMetrics {
    dailyActiveUsers: number;
    averageSessionDuration: number;
    mostViewedCategories: string[];
    featureUsage: Record<string, number>;
  }
  ```

### Browser Support
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

## Implementation Priority
1. Infrastructure Layer
   - External API Integration
   - Rate Limiting
   - Caching System
   - Error Handling
2. Core Features
   - Video Transcript Component
   - Content Enhancement
   - Reading History
3. API Routes
   - Transcript Route
   - Enhancement Routes
4. User Experience
   - Quick Wins Phase 1
   - Quick Wins Phase 2

---
Note: This PRD is a living document and will be updated as requirements evolve.
Last Updated: [Current Date]
