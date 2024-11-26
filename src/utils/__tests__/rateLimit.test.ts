import { RateLimiter } from '../rateLimit';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Clear singleton instance
    (RateLimiter as any).instance = null;
    rateLimiter = RateLimiter.getInstance();
  });

  test('should initialize with correct default values', () => {
    const openaiQuota = rateLimiter.getQuotaInfo('openai');
    const youtubeQuota = rateLimiter.getQuotaInfo('youtube');

    expect(openaiQuota.remaining).toBe(50);
    expect(youtubeQuota.remaining).toBe(100);
  });

  test('should track API calls correctly', async () => {
    // Make some API calls
    await rateLimiter.incrementCounter('openai');
    await rateLimiter.incrementCounter('openai');
    await rateLimiter.incrementCounter('youtube');

    const openaiQuota = rateLimiter.getQuotaInfo('openai');
    const youtubeQuota = rateLimiter.getQuotaInfo('youtube');

    expect(openaiQuota.remaining).toBe(48); // 50 - 2
    expect(youtubeQuota.remaining).toBe(99); // 100 - 1
  });

  test('should persist state in localStorage', async () => {
    // Make API calls
    await rateLimiter.incrementCounter('openai');
    
    // Clear singleton instance to force reload from localStorage
    (RateLimiter as any).instance = null;
    
    // Get a new instance (should load from localStorage)
    const newRateLimiter = RateLimiter.getInstance();
    const openaiQuota = newRateLimiter.getQuotaInfo('openai');

    expect(openaiQuota.remaining).toBe(49); // 50 - 1
  });

  test('should reset counters after 24 hours', async () => {
    // Make API calls
    await rateLimiter.incrementCounter('openai');
    
    // Simulate time passing (24 hours + 1 minute)
    const mockDate = new Date();
    mockDate.setHours(mockDate.getHours() + 24, mockDate.getMinutes() + 1);
    jest.spyOn(global.Date, 'now').mockImplementation(() => mockDate.getTime());

    const openaiQuota = rateLimiter.getQuotaInfo('openai');
    expect(openaiQuota.remaining).toBe(50); // Should be reset to max

    // Restore Date.now
    jest.spyOn(global.Date, 'now').mockRestore();
  });

  test('should prevent exceeding limits', async () => {
    // Try to exceed OpenAI limit
    for (let i = 0; i < 51; i++) {
      if (i < 50) {
        const canProceed = await rateLimiter.checkLimit('openai');
        expect(canProceed).toBe(true);
        await rateLimiter.incrementCounter('openai');
      } else {
        const canProceed = await rateLimiter.checkLimit('openai');
        expect(canProceed).toBe(false);
      }
    }
  });
});
