import { CacheManager } from '../cache';

describe('CacheManager', () => {
  let cacheManager: CacheManager;

  beforeEach(() => {
    localStorage.clear();
    // Clear singleton instance
    (CacheManager as any).instance = null;
    cacheManager = CacheManager.getInstance();
  });

  test('should store and retrieve data', () => {
    const testData = { test: 'data' };
    cacheManager.set('test-key', testData);
    
    const retrieved = cacheManager.get<typeof testData>('test-key');
    expect(retrieved).toEqual(testData);
  });

  test('should handle expired entries', () => {
    const testData = { test: 'data' };
    // Set data with 1ms expiration
    cacheManager.set('test-key', testData, 1);
    
    // Wait for expiration
    jest.advanceTimersByTime(2);
    
    const retrieved = cacheManager.get('test-key');
    expect(retrieved).toBeNull();
  });

  test('should enforce maximum entries limit', () => {
    // Add more than max entries
    for (let i = 0; i < 55; i++) {
      cacheManager.set(`key-${i}`, { data: i });
    }

    const stats = cacheManager.getStats();
    expect(stats.totalEntries).toBe(50); // Max entries limit
  });

  test('should persist cache in localStorage', () => {
    const testData = { test: 'data' };
    cacheManager.set('test-key', testData);
    
    // Create new instance (should load from localStorage)
    (CacheManager as any).instance = null;
    const newCacheManager = CacheManager.getInstance();
    
    const retrieved = newCacheManager.get<typeof testData>('test-key');
    expect(retrieved).toEqual(testData);
  });

  test('should provide accurate stats', () => {
    const testData = { test: 'data' };
    cacheManager.set('test-key', testData);
    
    const stats = cacheManager.getStats();
    expect(stats.totalEntries).toBe(1);
    expect(stats.oldestEntry).toBeInstanceOf(Date);
    expect(stats.newestEntry).toBeInstanceOf(Date);
    expect(stats.totalSize).toBeGreaterThan(0);
  });

  test('should remove entries correctly', () => {
    const testData = { test: 'data' };
    cacheManager.set('test-key', testData);
    
    cacheManager.remove('test-key');
    const retrieved = cacheManager.get('test-key');
    expect(retrieved).toBeNull();
  });

  test('should clear all entries', () => {
    cacheManager.set('key1', 'data1');
    cacheManager.set('key2', 'data2');
    
    cacheManager.clear();
    
    const stats = cacheManager.getStats();
    expect(stats.totalEntries).toBe(0);
  });
});
