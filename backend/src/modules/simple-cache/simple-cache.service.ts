import { Injectable } from "@nestjs/common";
import { Product } from "../products/entities/product.entity";

interface CacheItem {
  value: Product;
  expiry?: number;
  lastAccessed: number;
}

@Injectable()
export class SimpleCacheService {
  private readonly cache = new Map<string, CacheItem>();
  private readonly defaultTtl = 30 * 60 * 1000; // 30 minutes in milliseconds
  private readonly maxCacheSize = 50; // Maximum number of products to cache

  constructor() {
    console.log("Simple Cache Service initialized with LRU cache (max 50 products)");
  }

  async get(id: number): Promise<Product | null> {
    const key = String(id);
    const item = this.cache.get(key);
    
    if (!item) {
      console.log(`Cache MISS for key: ${key}`);
      return null;
    }

    // Check if item has expired
    if (item.expiry && Date.now() > item.expiry) {
      console.log(`Cache EXPIRED for key: ${key}`);
      this.cache.delete(key);
      return null;
    }

    // Update last accessed time for LRU tracking
    item.lastAccessed = Date.now();
    
    // Re-insert to move to end of Map (most recently used)
    this.cache.delete(key);
    this.cache.set(key, item);

    console.log(`Cache HIT for key: ${key}`);
    return item.value;
  }

  async set(id: number, value: Product, ttl?: number | string): Promise<void> {
    const key = String(id);
    let expiry: number | undefined;

    if (ttl) {
      if (typeof ttl === 'string') {
        // Parse string TTL (e.g., "30m", "1h")
        const match = ttl.match(/^(\d+)([mh])$/);
        if (match) {
          const amount = parseInt(match[1]);
          const unit = match[2];
          const multiplier = unit === 'm' ? 60 * 1000 : 60 * 60 * 1000;
          expiry = Date.now() + (amount * multiplier);
        }
      } else {
        expiry = Date.now() + (ttl * 1000);
      }
    } else {
      expiry = Date.now() + this.defaultTtl;
    }

    const now = Date.now();
    
    // If key already exists, remove it first to update position
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    
    // Check if we need to evict items to stay within limit
    while (this.cache.size >= this.maxCacheSize) {
      this.evictLeastRecentlyUsed();
    }

    // Add the new item
    this.cache.set(key, { value, expiry, lastAccessed: now });
    console.log(`Cache SET for key: ${key}, expires: ${expiry ? new Date(expiry).toISOString() : 'never'}, cache size: ${this.cache.size}`);
  }

  private evictLeastRecentlyUsed(): void {
    // Map maintains insertion order, so first entry is least recently used
    const firstKey = this.cache.keys().next().value;
    if (firstKey) {
      this.cache.delete(firstKey);
      console.log(`Cache EVICTED LRU key: ${firstKey}`);
    }
  }

  async delete(id: number): Promise<void> {
    const key = String(id);
    const deleted = this.cache.delete(key);
    console.log(`Cache DELETE for key: ${key}, success: ${deleted}`);
  }

  async clear(): Promise<void> {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`Cache CLEARED, removed ${size} items`);
  }

  // Additional utility methods
  getStats(): { size: number; maxSize: number; keys: string[]; oldestKey?: string; newestKey?: string } {
    const keys = Array.from(this.cache.keys());
    const stats = {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      keys,
      oldestKey: keys.length > 0 ? keys[0] : undefined,
      newestKey: keys.length > 0 ? keys[keys.length - 1] : undefined
    };
    console.log(`Cache STATS:`, stats);
    return stats;
  }

  // Clean up expired items
  cleanup(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (item.expiry && now > item.expiry) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`Cache CLEANUP: removed ${cleaned} expired items`);
    }
  }
}