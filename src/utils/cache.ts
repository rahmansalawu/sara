import { CacheConfig, CacheItem, CacheStore } from '@/types';
import { CacheError } from './errors';

export class CacheManager {
  private static instance: CacheManager;
  private cache: Map<string, CacheItem<any>>;
  private config: CacheConfig;

  private constructor() {
    this.config = {
      maxItems: 50,
      expiryTime: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
      storageKey: 'sara_cache',
    };
    this.cache = this.loadCache();
    this.cleanExpiredItems();
  }

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  private loadCache(): Map<string, CacheItem<any>> {
    if (typeof window === 'undefined') return new Map();

    const savedCache = localStorage.getItem(this.config.storageKey);
    if (!savedCache) return new Map();

    try {
      const parsed = JSON.parse(savedCache) as CacheStore;
      return new Map(Object.entries(parsed));
    } catch (error) {
      console.error('Failed to load cache:', error);
      return new Map();
    }
  }

  private saveCache(): void {
    if (typeof window === 'undefined') return;

    try {
      const obj = Object.fromEntries(this.cache);
      localStorage.setItem(this.config.storageKey, JSON.stringify(obj));
    } catch (error) {
      throw new CacheError('Failed to save cache', { error });
    }
  }

  private cleanExpiredItems(): void {
    const now = Date.now();
    let hasExpired = false;

    for (const [key, item] of this.cache.entries()) {
      if (now >= item.expiresAt) {
        this.cache.delete(key);
        hasExpired = true;
      }
    }

    if (hasExpired) {
      this.saveCache();
    }
  }

  private enforceMaxItems(): void {
    if (this.cache.size <= this.config.maxItems) return;

    // Convert to array for sorting
    const entries = Array.from(this.cache.entries());
    
    // Sort by timestamp (oldest first)
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // Remove oldest entries until we're under the limit
    const entriesToRemove = entries.slice(0, entries.length - this.config.maxItems);
    
    for (const [key] of entriesToRemove) {
      this.cache.delete(key);
    }

    this.saveCache();
  }

  public get<T>(key: string): T | null {
    this.cleanExpiredItems();

    const item = this.cache.get(key);
    if (!item) {
      this._misses++;
      return null;
    }

    // Update timestamp to mark as recently used
    item.timestamp = Date.now();
    this._hits++;
    this.saveCache();

    return item.data as T;
  }

  public set<T>(key: string, data: T, expiryTime: number = this.config.expiryTime): void {
    this.cleanExpiredItems();

    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + expiryTime,
    };

    this.cache.set(key, item);
    this.enforceMaxItems();
    this.saveCache();
  }

  public remove(key: string): void {
    this.cache.delete(key);
    this.saveCache();
  }

  public clear(): void {
    this.cache.clear();
    this.saveCache();
  }

  public getStats(): {
    totalItems: number;
    oldestItem: Date | null;
    newestItem: Date | null;
    totalSize: number;
    hitRate: number;
    missRate: number;
  } {
    let oldestTimestamp = Infinity;
    let newestTimestamp = 0;
    let totalSize = 0;

    for (const item of this.cache.values()) {
      oldestTimestamp = Math.min(oldestTimestamp, item.timestamp);
      newestTimestamp = Math.max(newestTimestamp, item.timestamp);
      totalSize += JSON.stringify(item.data).length;
    }

    const stats = {
      totalItems: this.cache.size,
      oldestItem: this.cache.size ? new Date(oldestTimestamp) : null,
      newestItem: this.cache.size ? new Date(newestTimestamp) : null,
      totalSize,
      hitRate: this._hitRate,
      missRate: this._missRate,
    };

    return stats;
  }

  // Cache hit/miss tracking
  private _hits: number = 0;
  private _misses: number = 0;

  private get _hitRate(): number {
    const total = this._hits + this._misses;
    return total > 0 ? this._hits / total : 0;
  }

  private get _missRate(): number {
    const total = this._hits + this._misses;
    return total > 0 ? this._misses / total : 0;
  }
}
