import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

const QUEUE_STORAGE_KEY = 'cinetrip_offline_sync_queue';
const LAST_SYNC_KEY = 'cinetrip_last_sync_timestamp';

class SyncQueueManager {
  constructor() {
    this.queue = [];
    this.isSyncing = false;
    this.listeners = new Set();
    this.lastSyncedAt = null;
    this.init();
  }

  async init() {
    try {
      const stored = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
      const lastSync = await AsyncStorage.getItem(LAST_SYNC_KEY);
      if (lastSync) {
        this.lastSyncedAt = new Date(lastSync);
      }
      this.notify();
    } catch (e) {
      console.warn('SyncQueue init error:', e.message);
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.getStatus());
    return () => this.listeners.delete(listener);
  }

  notify() {
    const status = this.getStatus();
    this.listeners.forEach((fn) => {
      try {
        fn(status);
      } catch {}
    });
  }

  getStatus() {
    return {
      pendingCount: this.queue.length,
      isSyncing: this.isSyncing,
      lastSyncedAt: this.lastSyncedAt,
      items: this.queue,
    };
  }

  async persistQueue() {
    try {
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
      this.notify();
    } catch (e) {
      console.warn('Persist queue error:', e.message);
    }
  }

  /**
   * Enqueue an action when device is offline or request fails.
   * @param {'CREATE_PLAN' | 'UPDATE_PLAN' | 'DELETE_PLAN' | 'CREATE_MEMORY' | 'UPDATE_MEMORY' | 'DELETE_MEMORY'} action
   * @param {Object} payload
   */
  async enqueue(action, payload) {
    const item = {
      id: `queue_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      action,
      payload,
      createdAt: new Date().toISOString(),
      retryCount: 0,
    };
    this.queue.push(item);
    await this.persistQueue();
    return item;
  }

  /**
   * Remove item from queue
   */
  async remove(queueId) {
    this.queue = this.queue.filter((item) => item.id !== queueId);
    await this.persistQueue();
  }

  /**
   * Process all queued offline actions against the backend.
   */
  async processQueue() {
    if (this.isSyncing || this.queue.length === 0) {
      return { success: true, processed: 0, remaining: this.queue.length };
    }

    this.isSyncing = true;
    this.notify();

    let processedCount = 0;
    const errors = [];
    const remainingQueue = [];

    for (const item of [...this.queue]) {
      try {
        switch (item.action) {
          case 'CREATE_PLAN': {
            const { _id, ...cleanPayload } = item.payload;
            await api.post('/api/plans', cleanPayload);
            processedCount++;
            break;
          }
          case 'UPDATE_PLAN': {
            const { id, updates } = item.payload;
            if (id && !String(id).startsWith('plan-local-')) {
              await api.put(`/api/plans/${id}`, updates);
            }
            processedCount++;
            break;
          }
          case 'DELETE_PLAN': {
            const { id } = item.payload;
            if (id && !String(id).startsWith('plan-local-')) {
              await api.delete(`/api/plans/${id}`);
            }
            processedCount++;
            break;
          }
          case 'CREATE_MEMORY': {
            const { _id, ...cleanPayload } = item.payload;
            await api.post('/api/memories', cleanPayload);
            processedCount++;
            break;
          }
          case 'UPDATE_MEMORY': {
            const { id, updates } = item.payload;
            if (id && !String(id).startsWith('mem-local-')) {
              await api.put(`/api/memories/${id}`, updates);
            }
            processedCount++;
            break;
          }
          case 'DELETE_MEMORY': {
            const { id } = item.payload;
            if (id && !String(id).startsWith('mem-local-')) {
              await api.delete(`/api/memories/${id}`);
            }
            processedCount++;
            break;
          }
          default:
            processedCount++;
        }
      } catch (err) {
        // If network error, retain in queue for future retry
        if (err.isNetworkError || err.statusCode === 0) {
          item.retryCount = (item.retryCount || 0) + 1;
          remainingQueue.push(item);
        } else {
          // If server explicitly rejected with 4xx, discard corrupted action
          console.warn(`Sync item ${item.id} rejected by server:`, err.message);
          errors.push({ id: item.id, error: err.message });
        }
      }
    }

    this.queue = remainingQueue;
    this.isSyncing = false;
    this.lastSyncedAt = new Date();
    await AsyncStorage.setItem(LAST_SYNC_KEY, this.lastSyncedAt.toISOString());
    await this.persistQueue();

    return {
      success: errors.length === 0,
      processed: processedCount,
      remaining: this.queue.length,
      errors,
    };
  }
}

export const syncQueue = new SyncQueueManager();
export default syncQueue;
