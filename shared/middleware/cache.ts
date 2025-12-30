import type { Request, Response, NextFunction } from 'express';

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

class InMemoryCache {
  private cache = new Map<string, CacheEntry>();
  
  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  set(key: string, data: any, ttlMs: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  size(): number {
    return this.cache.size;
  }
}

export const cache = new InMemoryCache();

export const cacheMiddleware = (ttlMinutes: number = 5) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') {
      return next();
    }
    
    const key = `${req.path}${req.url}`;
    const cachedData = cache.get(key);
    
    if (cachedData) {
      res.set('X-Cache', 'HIT');
      return res.json(cachedData);
    }
    
    const originalSend = res.json;
    res.json = function(data: any) {
      if (res.statusCode === 200) {
        cache.set(key, data, ttlMinutes * 60 * 1000);
      }
      res.set('X-Cache', 'MISS');
      return originalSend.call(this, data);
    };
    
    next();
  };
};