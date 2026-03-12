import AsyncStorage from '@react-native-async-storage/async-storage';

interface CachedScan {
  id: string;
  imageUrl: string;
  imageUri: string; // Local URI for offline access
  timestamp: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: any;
}

const CACHE_KEY = '@scan_cache';
const MAX_CACHE_SIZE = 50;

export const OfflineCache = {
  /**
   * Save scan to offline cache
   */
  async saveScan(scan: Omit<CachedScan, 'timestamp' | 'status'> & { status?: CachedScan['status'] }) {
    try {
      const cache = await this.getCache();
      const newScan: CachedScan = {
        ...scan,
        timestamp: Date.now(),
        status: scan.status || 'pending',
      };
      
      // Add to beginning of array (newest first)
      cache.unshift(newScan);
      
      // Limit cache size
      if (cache.length > MAX_CACHE_SIZE) {
        cache.splice(MAX_CACHE_SIZE);
      }
      
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      return newScan;
    } catch (error) {
      console.error('Error saving to offline cache:', error);
      return null;
    }
  },

  /**
   * Get all cached scans
   */
  async getCache(): Promise<CachedScan[]> {
    try {
      const data = await AsyncStorage.getItem(CACHE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting cache:', error);
      return [];
    }
  },

  /**
   * Get pending scans (not yet processed)
   */
  async getPendingScans(): Promise<CachedScan[]> {
    const cache = await this.getCache();
    return cache.filter(scan => scan.status === 'pending');
  },

  /**
   * Update scan status
   */
  async updateScanStatus(id: string, status: CachedScan['status'], result?: any) {
    try {
      const cache = await this.getCache();
      const index = cache.findIndex(scan => scan.id === id);
      
      if (index !== -1) {
        cache[index] = {
          ...cache[index],
          status,
          result: result || cache[index].result,
        };
        
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating scan status:', error);
      return false;
    }
  },

  /**
   * Remove scan from cache
   */
  async removeScan(id: string) {
    try {
      const cache = await this.getCache();
      const filtered = cache.filter(scan => scan.id !== id);
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error removing scan:', error);
      return false;
    }
  },

  /**
   * Clear all cached scans
   */
  async clear() {
    try {
      await AsyncStorage.removeItem(CACHE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing cache:', error);
      return false;
    }
  },

  /**
   * Get cache size
   */
  async getSize(): Promise<number> {
    const cache = await this.getCache();
    return cache.length;
  },
};
