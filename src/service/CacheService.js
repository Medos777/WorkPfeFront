class CacheService {
    constructor() {
        this.cache = new Map();
        this.timeouts = new Map();
    }

    // Set cache with expiration
    set(key, value, expirationInMinutes = 5) {
        if (this.timeouts.has(key)) {
            clearTimeout(this.timeouts.get(key));
        }

        this.cache.set(key, value);
        
        const timeout = setTimeout(() => {
            this.cache.delete(key);
            this.timeouts.delete(key);
        }, expirationInMinutes * 60 * 1000);

        this.timeouts.set(key, timeout);
    }

    // Get cached value
    get(key) {
        return this.cache.get(key);
    }

    // Check if key exists in cache
    has(key) {
        return this.cache.has(key);
    }

    // Remove item from cache
    remove(key) {
        if (this.timeouts.has(key)) {
            clearTimeout(this.timeouts.get(key));
            this.timeouts.delete(key);
        }
        this.cache.delete(key);
    }

    // Clear entire cache
    clear() {
        this.timeouts.forEach(timeout => clearTimeout(timeout));
        this.cache.clear();
        this.timeouts.clear();
    }

    // Get cache size
    size() {
        return this.cache.size;
    }
}

// Create singleton instance
const cacheService = new CacheService();
export default cacheService;
