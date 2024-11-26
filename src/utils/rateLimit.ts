interface RateLimitConfig {
  maxRequests: number;  // Maximum requests per day
  resetInterval: number;  // Reset interval in milliseconds (86400000 = 24 hours)
}

interface RateLimitState {
  requests: number;
  lastReset: number;
}

export class RateLimiter {
  private static instance: RateLimiter;
  private state: {
    openai: RateLimitState;
    youtube: RateLimitState;
  };
  private config: {
    openai: RateLimitConfig;
    youtube: RateLimitConfig;
  };

  private constructor() {
    // Initialize with defaults from localStorage or new values
    const savedState = this.loadState();
    
    this.state = savedState || {
      openai: { requests: 0, lastReset: Date.now() },
      youtube: { requests: 0, lastReset: Date.now() }
    };

    this.config = {
      openai: {
        maxRequests: 50,  // 50 requests per day
        resetInterval: 86400000  // 24 hours
      },
      youtube: {
        maxRequests: 100,  // 100 requests per day
        resetInterval: 86400000  // 24 hours
      }
    };
  }

  public static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  private loadState(): typeof this.state | null {
    if (typeof window === 'undefined') return null;
    
    const savedState = localStorage.getItem('rateLimitState');
    if (!savedState) return null;

    try {
      return JSON.parse(savedState);
    } catch {
      return null;
    }
  }

  private saveState(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('rateLimitState', JSON.stringify(this.state));
  }

  private checkAndResetLimit(service: 'openai' | 'youtube'): void {
    const now = Date.now();
    const { lastReset } = this.state[service];
    const { resetInterval } = this.config[service];

    if (now - lastReset >= resetInterval) {
      this.state[service] = {
        requests: 0,
        lastReset: now
      };
      this.saveState();
    }
  }

  public async checkLimit(service: 'openai' | 'youtube'): Promise<boolean> {
    this.checkAndResetLimit(service);
    
    const { requests } = this.state[service];
    const { maxRequests } = this.config[service];

    return requests < maxRequests;
  }

  public async incrementCounter(service: 'openai' | 'youtube'): Promise<void> {
    this.state[service].requests++;
    this.saveState();
  }

  public getQuotaInfo(service: 'openai' | 'youtube'): {
    remaining: number;
    resetIn: number;
    total: number;
  } {
    this.checkAndResetLimit(service);
    
    const { requests, lastReset } = this.state[service];
    const { maxRequests, resetInterval } = this.config[service];
    
    return {
      remaining: maxRequests - requests,
      resetIn: resetInterval - (Date.now() - lastReset),
      total: maxRequests
    };
  }

  public getRemainingQuota(service: 'openai' | 'youtube'): number {
    return this.getQuotaInfo(service).remaining;
  }

  public getResetTime(service: 'openai' | 'youtube'): Date {
    const { lastReset } = this.state[service];
    const { resetInterval } = this.config[service];
    return new Date(lastReset + resetInterval);
  }
}
