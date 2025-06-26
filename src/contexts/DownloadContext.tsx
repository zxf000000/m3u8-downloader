'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { downloadManager } from '@/lib/download-manager';
import { historyManager } from '@/lib/history-manager';
import { DownloadProgress, M3U8Download } from '@/types';

interface DownloadContextType {
  isDownloading: boolean;
  currentDownload: M3U8Download | null;
  progress: DownloadProgress | null;
  error: string | null;
  startDownload: (url: string, title?: string, maxConcurrency?: number) => Promise<void>;
  cancelDownload: () => void;
  resetDownload: () => void;
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

  const value: DownloadContextType = {
    isDownloading,
    currentDownload,
    progress,
    error,
    startDownload,
    cancelDownload,
    resetDownload
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
