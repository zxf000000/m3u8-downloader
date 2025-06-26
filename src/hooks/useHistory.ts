import { useState, useEffect, useCallback } from 'react';
import { historyManager } from '@/lib/history-manager';
import { HistoryItem } from '@/types';

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<HistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'failed' | 'pending'>('all');
  const [isLoading, setIsLoading] = useState(true);

  const loadHistory = useCallback(() => {
    setIsLoading(true);
    try {
      const historyData = historyManager.getHistory();
      setHistory(historyData);
      setFilteredHistory(historyData);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filterHistory = useCallback(() => {
    let filtered = history;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = historyManager.searchHistory(searchQuery);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    setFilteredHistory(filtered);
  }, [history, searchQuery, statusFilter]);

  const removeFromHistory = useCallback((downloadId: string) => {
    historyManager.removeFromHistory(downloadId);
    loadHistory();
  }, [loadHistory]);

  const clearHistory = useCallback(() => {
    historyManager.clearHistory();
    loadHistory();
  }, [loadHistory]);

  const exportHistory = useCallback(() => {
    try {
      const exportData = historyManager.exportHistory();
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `m3u8-download-history-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('Failed to export history:', error);
      return false;
    }
  }, []);

  const importHistory = useCallback((file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const success = historyManager.importHistory(content);
          if (success) {
            loadHistory();
          }
          resolve(success);
        } catch (error) {
          console.error('Failed to import history:', error);
          resolve(false);
        }
      };
      reader.onerror = () => resolve(false);
      reader.readAsText(file);
    });
  }, [loadHistory]);

  const getHistoryStats = useCallback(() => {
    return historyManager.getHistoryStats();
  }, []);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Apply filters when dependencies change
  useEffect(() => {
    filterHistory();
  }, [filterHistory]);

  return {
    history: filteredHistory,
    allHistory: history,
    isLoading,
    searchQuery,
    statusFilter,
    setSearchQuery,
    setStatusFilter,
    loadHistory,
    removeFromHistory,
    clearHistory,
    exportHistory,
    importHistory,
    getHistoryStats
  };
}
