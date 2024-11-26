export class RateLimitError extends Error {
  constructor(
    public service: 'openai' | 'youtube',
    public resetTime: Date,
    public remaining: number,
    public total: number
  ) {
    super(`Rate limit exceeded for ${service}. Resets at ${resetTime.toLocaleString()}`);
    this.name = 'RateLimitError';
  }
}
