import { M3U8Download, HistoryItem } from '@/types';

export class HistoryManager {
  private readonly STORAGE_KEY = 'm3u8-download-history';
  private readonly MAX_HISTORY_ITEMS = 100;

  saveDownload(download: M3U8Download): void {
    try {
      const history = this.getHistory();
      const historyItem: HistoryItem = {
        ...download,
        downloadSpeed: 0, // Will be updated if available
        errorMessage: download.status === 'failed' ? 'Download failed' : undefined
      };

      // Remove existing item with same ID if exists
      const filteredHistory = history.filter(item => item.id !== download.id);

      // Add new item at the beginning
      filteredHistory.unshift(historyItem);

      // Keep only the latest MAX_HISTORY_ITEMS
      const trimmedHistory = filteredHistory.slice(0, this.MAX_HISTORY_ITEMS);

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmedHistory));
    } catch (error) {
      console.error('Failed to save download to history:', error);
    }
  }

  getHistory(): HistoryItem[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];

      const parsed = JSON.parse(stored);

      // Convert date strings back to Date objects
      return parsed.map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        completedAt: item.completedAt ? new Date(item.completedAt) : undefined
      }));
    } catch (error) {
      console.error('Failed to load download history:', error);
      return [];
    }
  }

  removeFromHistory(downloadId: string): void {
    try {
      const history = this.getHistory();
      const filteredHistory = history.filter(item => item.id !== downloadId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredHistory));
    } catch (error) {
      console.error('Failed to remove item from history:', error);
    }
  }

  clearHistory(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  }

  getHistoryStats(): {
    totalDownloads: number;
    completedDownloads: number;
    failedDownloads: number;
    totalSize: number;
  } {
    const history = this.getHistory();

    return {
      totalDownloads: history.length,
      completedDownloads: history.filter(item => item.status === 'completed').length,
      failedDownloads: history.filter(item => item.status === 'failed').length,
      totalSize: history
        .filter(item => item.fileSize)
        .reduce((sum, item) => sum + (item.fileSize || 0), 0)
    };
  }

  exportHistory(): string {
    const history = this.getHistory();
    return JSON.stringify(history, null, 2);
  }

  importHistory(jsonData: string): boolean {
    try {
      const imported = JSON.parse(jsonData);

      if (!Array.isArray(imported)) {
        throw new Error('Invalid history format');
      }

      // Validate each item has required fields
      const validItems = imported.filter(item =>
        item.id &&
        item.url &&
        item.title &&
        item.status &&
        typeof item.progress === 'number' &&
        typeof item.totalSegments === 'number' &&
        typeof item.downloadedSegments === 'number'
      );

      // Convert date strings to Date objects
      const processedItems = validItems.map(item => ({
        ...item,
        createdAt: new Date(item.createdAt),
        completedAt: item.completedAt ? new Date(item.completedAt) : undefined
      }));

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(processedItems));
      return true;
    } catch (error) {
      console.error('Failed to import history:', error);
      return false;
    }
  }

  searchHistory(query: string): HistoryItem[] {
    const history = this.getHistory();
    const lowercaseQuery = query.toLowerCase();

    return history.filter(item =>
      item.title.toLowerCase().includes(lowercaseQuery) ||
      item.url.toLowerCase().includes(lowercaseQuery)
    );
  }

  getHistoryByStatus(status: M3U8Download['status']): HistoryItem[] {
    return this.getHistory().filter(item => item.status === status);
  }

  updateDownloadInHistory(downloadId: string, updates: Partial<M3U8Download>): void {
    try {
      const history = this.getHistory();
      const itemIndex = history.findIndex(item => item.id === downloadId);

      if (itemIndex !== -1) {
        history[itemIndex] = { ...history[itemIndex], ...updates };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
      }
    } catch (error) {
      console.error('Failed to update download in history:', error);
    }
  }
}

// Singleton instance
export const historyManager = new HistoryManager();
