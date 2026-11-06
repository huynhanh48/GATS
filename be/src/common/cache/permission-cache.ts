import { createCache, type Cache } from 'cache-manager';

import { PERMISSION_CACHE_TTL_MS } from '@src/models/Authorization.model';

export class PermissionCache {
  private readonly cache: Cache;

  constructor(cache?: Cache) {
    this.cache = cache ?? createCache({ ttl: PERMISSION_CACHE_TTL_MS });
  }

  async get(key: string): Promise<boolean | undefined> {
    const value = await this.cache.get<boolean>(key);
    return value === undefined ? undefined : value;
  }

  async set(
    key: string,
    allowed: boolean,
    ttlMs: number = PERMISSION_CACHE_TTL_MS,
  ): Promise<void> {
    await this.cache.set(key, allowed, ttlMs);
  }

  async delete(key: string): Promise<void> {
    await this.cache.del(key);
  }

  async deleteByPrefix(prefix: string): Promise<void> {
    const store = this.cache.stores[0];
    if (!store?.iterator) {
      return;
    }

    const keysToDelete: string[] = [];
    for await (const [key] of store.iterator({})) {
      if (typeof key === 'string' && key.startsWith(prefix)) {
        keysToDelete.push(key);
      }
    }

    await Promise.all(keysToDelete.map((key) => this.cache.del(key)));
  }
}

export const permissionCache = new PermissionCache();
