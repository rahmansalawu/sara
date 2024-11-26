import { ReadingHistoryManager } from '../readingHistory';

describe('ReadingHistoryManager', () => {
  let manager: ReadingHistoryManager;
  let localStorageMock: { [key: string]: string };

  beforeEach(() => {
    localStorageMock = {};
    
    // Mock localStorage
    global.localStorage = {
      getItem: (key: string) => localStorageMock[key] || null,
      setItem: (key: string, value: string) => { localStorageMock[key] = value; },
      removeItem: (key: string) => { delete localStorageMock[key]; },
      clear: () => { localStorageMock = {}; },
      length: 0,
      key: (index: number) => '',
    };

    // Reset singleton instance
    (ReadingHistoryManager as any).instance = null;
    manager = ReadingHistoryManager.getInstance();
  });

  test('should add new entry', () => {
    const entry = manager.addEntry('video123', 'Test Video');
    expect(entry.videoId).toBe('video123');
    expect(entry.title).toBe('Test Video');
    expect(entry.readingProgress).toBe(0);
    expect(entry.favorite).toBe(false);
  });

  test('should update reading progress', () => {
    manager.addEntry('video123', 'Test Video');
    manager.updateProgress('video123', 50);
    const entries = manager.getEntries();
    expect(entries[0].readingProgress).toBe(50);
  });

  test('should toggle favorite status', () => {
    manager.addEntry('video123', 'Test Video');
    const isFavorite = manager.toggleFavorite('video123');
    expect(isFavorite).toBe(true);
    
    const entries = manager.getEntries();
    expect(entries[0].favorite).toBe(true);
  });

  test('should maintain max entries limit', () => {
    // Add more than max entries
    for (let i = 0; i < 55; i++) {
      manager.addEntry(`video${i}`, `Test Video ${i}`);
    }
    
    const entries = manager.getEntries();
    expect(entries.length).toBe(50);
    expect(entries[0].videoId).toBe('video54');
    expect(entries[49].videoId).toBe('video5');
  });

  test('should clear history', () => {
    manager.addEntry('video123', 'Test Video');
    manager.clearHistory();
    const entries = manager.getEntries();
    expect(entries.length).toBe(0);
  });

  test('should export history', () => {
    manager.addEntry('video123', 'Test Video');
    const exported = manager.exportHistory();
    const parsed = JSON.parse(exported);
    expect(parsed.entries[0].videoId).toBe('video123');
  });

  test('should handle duplicate entries', () => {
    manager.addEntry('video123', 'Test Video 1');
    manager.addEntry('video123', 'Test Video 2');
    const entries = manager.getEntries();
    expect(entries.length).toBe(1);
    expect(entries[0].title).toBe('Test Video 2');
  });

  test('should get favorites only', () => {
    manager.addEntry('video1', 'Test Video 1');
    manager.addEntry('video2', 'Test Video 2');
    manager.toggleFavorite('video1');
    
    const favorites = manager.getFavorites();
    expect(favorites.length).toBe(1);
    expect(favorites[0].videoId).toBe('video1');
  });
});
