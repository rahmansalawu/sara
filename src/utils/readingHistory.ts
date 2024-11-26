import { HistoryEntry, ReadingHistoryStore } from '../types';

export class ReadingHistoryManager {
  private static instance: ReadingHistoryManager;
  private readonly storageKey = 'sara_reading_history';
  private readonly maxEntries = 50;

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): ReadingHistoryManager {
    if (!ReadingHistoryManager.instance) {
      ReadingHistoryManager.instance = new ReadingHistoryManager();
    }
    return ReadingHistoryManager.instance;
  }

  private getStore(): ReadingHistoryStore {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) {
        return { entries: [], lastUpdated: new Date() };
      }
      const parsed = JSON.parse(stored);
      // Convert string dates back to Date objects
      return {
        entries: parsed.entries.map((entry: any) => ({
          ...entry,
          viewedAt: new Date(entry.viewedAt)
        })),
        lastUpdated: new Date(parsed.lastUpdated)
      };
    } catch (error) {
      console.error('Error reading history store:', error);
      return { entries: [], lastUpdated: new Date() };
    }
  }

  private saveStore(store: ReadingHistoryStore): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(store));
    } catch (error) {
      console.error('Error saving history store:', error);
      throw new Error('Failed to save reading history');
    }
  }

  public addEntry(videoId: string, title: string): HistoryEntry {
    const store = this.getStore();
    
    // Remove existing entry if present
    const filteredEntries = store.entries.filter(entry => entry.videoId !== videoId);
    
    // Create new entry
    const newEntry: HistoryEntry = {
      videoId,
      title,
      viewedAt: new Date(),
      readingProgress: 0,
      favorite: false
    };

    // Add to start of array and limit size
    const newEntries = [newEntry, ...filteredEntries].slice(0, this.maxEntries);

    // Save updated store
    this.saveStore({
      entries: newEntries,
      lastUpdated: new Date()
    });

    return newEntry;
  }

  public updateProgress(videoId: string, progress: number): void {
    const store = this.getStore();
    const entryIndex = store.entries.findIndex(entry => entry.videoId === videoId);
    
    if (entryIndex === -1) return;

    store.entries[entryIndex].readingProgress = Math.min(Math.max(progress, 0), 100);
    store.lastUpdated = new Date();
    
    this.saveStore(store);
  }

  public toggleFavorite(videoId: string): boolean {
    const store = this.getStore();
    const entryIndex = store.entries.findIndex(entry => entry.videoId === videoId);
    
    if (entryIndex === -1) return false;

    store.entries[entryIndex].favorite = !store.entries[entryIndex].favorite;
    store.lastUpdated = new Date();
    
    this.saveStore(store);
    return store.entries[entryIndex].favorite;
  }

  public getEntries(): HistoryEntry[] {
    return this.getStore().entries;
  }

  public getFavorites(): HistoryEntry[] {
    return this.getStore().entries.filter(entry => entry.favorite);
  }

  public clearHistory(): void {
    this.saveStore({ entries: [], lastUpdated: new Date() });
  }

  public exportHistory(): string {
    const store = this.getStore();
    return JSON.stringify(store, null, 2);
  }
}

export default ReadingHistoryManager.getInstance();
