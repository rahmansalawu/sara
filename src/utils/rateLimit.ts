import { RateLimitConfig, RateLimitStore } from '@/types';
import { RateLimitError } from './errors';

export class RateLimiter {
  private static instance: RateLimiter;
  private store: Map<string, RateLimitStore>;
  private config: RateLimitConfig;

  private constructor() {
    this.store = this.loadStore();
    this.config = {
      openai: {
        maxRequests: 50,
        resetPeriod: 24 * 60 * 60 * 1000, // 24 hours in ms
      },
      youtube: {
        maxQuota: 100,
        resetTime: "00:00", // UTC
      },
    };
  }

  public static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  private loadStore(): Map<string, RateLimitStore> {
    if (typeof window === 'undefined') return new Map();

    const savedStore = localStorage.getItem('sara_rate_limits');
    if (!savedStore) return new Map();

    try {
      const parsed = JSON.parse(savedStore);
      return new Map(Object.entries(parsed));
    } catch (error) {
      console.error('Failed to load rate limit store:', error);
      return new Map();
    }
  }

  private saveStore(): void {
    if (typeof window === 'undefined') return;

    const obj = Object.fromEntries(this.store);
    localStorage.setItem('sara_rate_limits', JSON.stringify(obj));
  }

  private getStore(service: string): RateLimitStore {
    let store = this.store.get(service);
    
    if (!store) {
      store = {
        counter: 0,
        lastReset: Date.now(),
        quotaUsed: 0,
      };
      this.store.set(service, store);
    }

    return store;
  }

  private shouldReset(service: string): boolean {
    const store = this.getStore(service);
    const now = Date.now();

    if (service === 'openai') {
      return now - store.lastReset >= this.config.openai.resetPeriod;
    } else if (service === 'youtube') {
      const resetTime = new Date();
      const [hours, minutes] = this.config.youtube.resetTime.split(':').map(Number);
      resetTime.setUTCHours(hours, minutes, 0, 0);
      
      if (resetTime.getTime() <= store.lastReset) {
        resetTime.setDate(resetTime.getDate() + 1);
      }

      return now >= resetTime.getTime();
    }

    return false;
  }

  private reset(service: string): void {
    const store = this.getStore(service);
    store.counter = 0;
    store.quotaUsed = 0;
    store.lastReset = Date.now();
    this.saveStore();
  }

  public async checkLimit(service: string): Promise<boolean> {
    if (this.shouldReset(service)) {
      this.reset(service);
    }

    const store = this.getStore(service);
    
    if (service === 'openai') {
      const config = this.config.openai;
      if (store.counter >= config.maxRequests) {
        const resetTime = new Date(store.lastReset + config.resetPeriod);
        throw new RateLimitError(service, resetTime, config.maxRequests - store.counter, config.maxRequests);
      }
    } else if (service === 'youtube') {
      const config = this.config.youtube;
      if (store.quotaUsed >= config.maxQuota) {
        const [hours, minutes] = config.resetTime.split(':').map(Number);
        const resetTime = new Date();
        resetTime.setUTCHours(hours, minutes, 0, 0);
        if (resetTime.getTime() <= Date.now()) {
          resetTime.setDate(resetTime.getDate() + 1);
        }
        throw new RateLimitError(service, resetTime, config.maxQuota - store.quotaUsed, config.maxQuota);
      }
    }

    return true;
  }

  public async incrementCounter(service: string, quotaCost: number = 1): Promise<void> {
    const store = this.getStore(service);
    store.counter++;
    store.quotaUsed += quotaCost;
    this.saveStore();
  }

  public getRemainingQuota(service: string): number {
    if (this.shouldReset(service)) {
      this.reset(service);
    }

    const store = this.getStore(service);
    
    if (service === 'openai') {
      return this.config.openai.maxRequests - store.counter;
    } else if (service === 'youtube') {
      return this.config.youtube.maxQuota - store.quotaUsed;
    }

    return 0;
  }

  public getQuotaInfo(service: string): { used: number; remaining: number; total: number } {
    if (this.shouldReset(service)) {
      this.reset(service);
    }

    const store = this.getStore(service);
    
    if (service === 'openai') {
      const config = this.config.openai;
      return {
        used: store.counter,
        remaining: config.maxRequests - store.counter,
        total: config.maxRequests,
      };
    } else if (service === 'youtube') {
      const config = this.config.youtube;
      return {
        used: store.quotaUsed,
        remaining: config.maxQuota - store.quotaUsed,
        total: config.maxQuota,
      };
    }

    return { used: 0, remaining: 0, total: 0 };
  }

  public getResetTime(service: string): Date {
    const store = this.getStore(service);

    if (service === 'openai') {
      return new Date(store.lastReset + this.config.openai.resetPeriod);
    } else if (service === 'youtube') {
      const [hours, minutes] = this.config.youtube.resetTime.split(':').map(Number);
      const resetTime = new Date();
      resetTime.setUTCHours(hours, minutes, 0, 0);
      if (resetTime.getTime() <= Date.now()) {
        resetTime.setDate(resetTime.getDate() + 1);
      }
      return resetTime;
    }

    return new Date();
  }
}
