'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { downloadManager } from '@/lib/download-manager';
import { historyManager } from '@/lib/history-manager';
import { DownloadProgress, M3U8Download, DownloadQueue, QueueProgress, BatchDownloadRequest } from '@/types';

interface DownloadContextType {
  // Single download
  isDownloading: boolean;
  currentDownload: M3U8Download | null;
  progress: DownloadProgress | null;
  error: string | null;
  startDownload: (url: string, title?: string, maxConcurrency?: number) => Promise<void>;
  cancelDownload: () => void;
  resetDownload: () => void;

  // Batch download
  activeQueues: DownloadQueue[];
  queueProgress: Map<string, QueueProgress>;
  startBatchDownload: (request: BatchDownloadRequest) => Promise<string | null>;
  cancelQueue: (queueId: string) => void;
  pauseQueue: (queueId: string) => void;
  resumeQueue: (queueId: string) => void;
  removeQueue: (queueId: string) => void;
}

const DownloadContext = createContext<DownloadContextType | undefined>(undefined);

interface DownloadProviderProps {
  children: ReactNode;
}

export function DownloadProvider({ children }: DownloadProviderProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [currentDownload, setCurrentDownload] = useState<M3U8Download | null>(null);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Batch download state
  const [activeQueues, setActiveQueues] = useState<DownloadQueue[]>([]);
  const [queueProgress, setQueueProgress] = useState<Map<string, QueueProgress>>(new Map());

  const startDownload = useCallback(async (
    url: string,
    title?: string,
    maxConcurrency: number = 4
  ) => {
    try {
      setIsDownloading(true);
      setError(null);
      setProgress(null);
      setCurrentDownload(null);

      const downloadId = await downloadManager.startDownload(
        url,
        title,
        maxConcurrency,
        (progressData) => {
          // Update progress data
          setProgress(progressData);

          // Get the latest download info after progress update
          const download = downloadManager.getDownload(progressData.downloadId);
          if (download) {
            setCurrentDownload({ ...download }); // Create a new object to trigger re-render

            // Handle completion states
            if (progressData.status === 'completed' || progressData.status === 'failed') {
              historyManager.saveDownload(download);
              setIsDownloading(false);
            }
          }
        }
      );

      // Set initial download state
      const initialDownload = downloadManager.getDownload(downloadId);
      if (initialDownload) {
        setCurrentDownload({ ...initialDownload });
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
      setIsDownloading(false);
      setCurrentDownload(null);
    }
  }, []);

  const cancelDownload = useCallback(() => {
    if (currentDownload) {
      downloadManager.cancelDownload(currentDownload.id);
      setIsDownloading(false);
      setCurrentDownload(null);
      setProgress(null);
    }
  }, [currentDownload]);

  const resetDownload = useCallback(() => {
    setCurrentDownload(null);
    setProgress(null);
    setError(null);
    setIsDownloading(false);
  }, []);

  // Batch download methods
  const startBatchDownload = useCallback(async (request: BatchDownloadRequest): Promise<string | null> => {
    try {
      setError(null);

      const response = await downloadManager.startBatchDownload(
        request,
        (queueProgressData) => {
          // Update queue progress
          setQueueProgress(prev => {
            const newMap = new Map(prev);
            newMap.set(queueProgressData.queueId, queueProgressData);
            return newMap;
          });

          // Update active queues list
          const queue = downloadManager.getQueue(queueProgressData.queueId);
          if (queue) {
            setActiveQueues(prev => {
              const filtered = prev.filter(q => q.id !== queue.id);
              return [...filtered, { ...queue }];
            });
          }
        }
      );

      if (response.success && response.queueId) {
        // Add to active queues
        const queue = downloadManager.getQueue(response.queueId);
        if (queue) {
          setActiveQueues(prev => [...prev, { ...queue }]);
        }
        return response.queueId;
      } else {
        setError(response.error || 'Failed to start batch download');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Batch download failed');
      return null;
    }
  }, []);

  const cancelQueue = useCallback((queueId: string) => {
    downloadManager.cancelQueue(queueId);

    // Update local state
    setActiveQueues(prev => prev.filter(q => q.id !== queueId));
    setQueueProgress(prev => {
      const newMap = new Map(prev);
      newMap.delete(queueId);
      return newMap;
    });
  }, []);

  const pauseQueue = useCallback((queueId: string) => {
    downloadManager.pauseQueue(queueId);

    // Update local state
    const queue = downloadManager.getQueue(queueId);
    if (queue) {
      setActiveQueues(prev => {
        const filtered = prev.filter(q => q.id !== queueId);
        return [...filtered, { ...queue }];
      });
    }
  }, []);

  const resumeQueue = useCallback((queueId: string) => {
    downloadManager.resumeQueue(queueId);

    // Update local state
    const queue = downloadManager.getQueue(queueId);
    if (queue) {
      setActiveQueues(prev => {
        const filtered = prev.filter(q => q.id !== queueId);
        return [...filtered, { ...queue }];
      });
    }
  }, []);

  const removeQueue = useCallback((queueId: string) => {
    // Cancel first, then remove from UI
    downloadManager.cancelQueue(queueId);

    setActiveQueues(prev => prev.filter(q => q.id !== queueId));
    setQueueProgress(prev => {
      const newMap = new Map(prev);
      newMap.delete(queueId);
      return newMap;
    });
  }, []);

  const value: DownloadContextType = {
    // Single download
    isDownloading,
    currentDownload,
    progress,
    error,
    startDownload,
    cancelDownload,
    resetDownload,

    // Batch download
    activeQueues,
    queueProgress,
    startBatchDownload,
    cancelQueue,
    pauseQueue,
    resumeQueue,
    removeQueue
  };

  return (
    <DownloadContext.Provider value={value}>
      {children}
    </DownloadContext.Provider>
  );
}

export function useDownload(): DownloadContextType {
  const context = useContext(DownloadContext);
  if (context === undefined) {
    throw new Error('useDownload must be used within a DownloadProvider');
  }
  return context;
}
