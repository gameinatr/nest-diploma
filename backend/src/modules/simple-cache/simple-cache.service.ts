import { Injectable } from "@nestjs/common";
import { Product } from "../products/entities/product.entity";

interface CacheItem {
  value: Product;
  expiry?: number;
}

@Injectable()
export class SimpleCacheService {
  private readonly cache = new Map<string, CacheItem>();
  private readonly defaultTtl = 30 * 60 * 1000; // 30 minutes in milliseconds

  constructor() {
    console.log("Simple Cache Service initialized");
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

    this.cache.set(key, { value, expiry });
    console.log(`Cache SET for key: ${key}, expires: ${expiry ? new Date(expiry).toISOString() : 'never'}`);
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
  getStats(): { size: number; keys: string[] } {
    const stats = {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
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