import { logger } from '@/utils/logger';

const DB_NAME = 'flu-legendarium-cache';
const DB_VERSION = 1;
const STORE_NAME = 'api-cache';

interface CacheEntry<T = unknown> {
  key: string;
  data: T;
  timestamp: number;
  ttl: number;
}

class IndexedDBCache {
  private db: IDBDatabase | null = null;
  private dbReady: Promise<boolean>;

  constructor() {
    this.dbReady = this.initDB();
  }

  private async initDB(): Promise<boolean> {
    return new Promise((resolve) => {
      if (typeof indexedDB === 'undefined') {
        logger.warn('IndexedDB não disponível', 'CACHE');
        resolve(false);
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        logger.error('Erro ao abrir IndexedDB', 'CACHE');
        resolve(false);
      };

      request.onsuccess = () => {
        this.db = request.result;
        logger.info('IndexedDB inicializado', 'CACHE');
        resolve(true);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const ready = await this.dbReady;
    if (!ready || !this.db) return null;

    return new Promise((resolve) => {
      try {
        const transaction = this.db!.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);

        request.onsuccess = () => {
          const entry = request.result as CacheEntry<T> | undefined;
          if (!entry) {
            resolve(null);
            return;
          }

          // Check if expired
          const now = Date.now();
          if (now - entry.timestamp > entry.ttl) {
            this.delete(key); // Clean up expired entry
            resolve(null);
            return;
          }

          logger.debug(`IndexedDB HIT: ${key}`, 'CACHE');
          resolve(entry.data);
        };

        request.onerror = () => {
          logger.error(`Erro ao ler do IndexedDB: ${key}`, 'CACHE');
          resolve(null);
        };
      } catch (err) {
        logger.error('Exceção ao ler IndexedDB', 'CACHE', err);
        resolve(null);
      }
    });
  }

  async set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): Promise<void> {
    const ready = await this.dbReady;
    if (!ready || !this.db) return;

    return new Promise((resolve) => {
      try {
        const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        const entry: CacheEntry<T> = {
          key,
          data,
          timestamp: Date.now(),
          ttl
        };

        const request = store.put(entry);

        request.onsuccess = () => {
          logger.debug(`IndexedDB SET: ${key}`, 'CACHE');
          resolve();
        };

        request.onerror = () => {
          logger.error(`Erro ao escrever no IndexedDB: ${key}`, 'CACHE');
          resolve();
        };
      } catch (err) {
        logger.error('Exceção ao escrever IndexedDB', 'CACHE', err);
        resolve();
      }
    });
  }

  async delete(key: string): Promise<void> {
    const ready = await this.dbReady;
    if (!ready || !this.db) return;

    return new Promise((resolve) => {
      try {
        const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        store.delete(key);
        resolve();
      } catch (err) {
        logger.error('Exceção ao deletar IndexedDB', 'CACHE', err);
        resolve();
      }
    });
  }

  async clear(): Promise<void> {
    const ready = await this.dbReady;
    if (!ready || !this.db) return;

    return new Promise((resolve) => {
      try {
        const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        store.clear();
        logger.info('IndexedDB limpo', 'CACHE');
        resolve();
      } catch (err) {
        logger.error('Exceção ao limpar IndexedDB', 'CACHE', err);
        resolve();
      }
    });
  }

  async cleanup(): Promise<void> {
    const ready = await this.dbReady;
    if (!ready || !this.db) return;

    return new Promise((resolve) => {
      try {
        const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const now = Date.now();
        let cleaned = 0;

        const request = store.openCursor();
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor) {
            const entry = cursor.value as CacheEntry;
            if (now - entry.timestamp > entry.ttl) {
              cursor.delete();
              cleaned++;
            }
            cursor.continue();
          } else {
            if (cleaned > 0) {
              logger.info(`IndexedDB cleanup: ${cleaned} entradas removidas`, 'CACHE');
            }
            resolve();
          }
        };
      } catch (err) {
        logger.error('Exceção ao limpar IndexedDB', 'CACHE', err);
        resolve();
      }
    });
  }
}

export const indexedDBCache = new IndexedDBCache();
