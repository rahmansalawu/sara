# Sara - YouTube Transcript Reader Features PRD

## Core Infrastructure Improvements

### 1. Basic Rate Limiting & Cost Control
**Purpose:** Protect personal usage from excessive API costs and rate limits

#### Requirements:
- [ ] Implement daily request tracking for OpenAI API
  - Maximum 50 requests per day
  - Track tokens used per request
  - Reset counter at midnight UTC
  - Store counts in localStorage

- [ ] YouTube API quota management
  - Track daily API quota usage
  - Maximum 100 requests per day
  - Store and reset quota usage daily
  - Warning when reaching 80% of limit

- [ ] Error handling
  - Clear error messages when limits reached
  - Graceful degradation of features
  - Option to reset limits manually
  - Countdown timer until limit reset

### 2. Simple Caching System
**Purpose:** Optimize performance and reduce unnecessary API calls

#### Requirements:
- [ ] localStorage-based caching
  - Cache structure:
    ```typescript
    interface VideoCache {
      videoId: string;
      transcript: string;
      enhancedArticle: string;
      tldrSummary: string;
      timestamp: number;
      expiresIn: number;
    }
    ```
  - Cache duration: 7 days
  - Maximum cache size: 50 videos
  - LRU (Least Recently Used) cache eviction

- [ ] Cache management
  - Auto-cleanup of expired entries
  - Manual cache clear option
  - Cache hit/miss tracking
  - Cache status indicator

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
