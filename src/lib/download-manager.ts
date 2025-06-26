import { M3U8Playlist, M3U8Download, DownloadProgress } from '@/types';
import { M3U8Parser } from './m3u8-parser';

export class DownloadManager {
  private downloads: Map<string, M3U8Download> = new Map();
  private progressCallbacks: Map<string, (progress: DownloadProgress) => void> = new Map();
  private abortControllers: Map<string, AbortController> = new Map();
  private downloadStats: Map<string, {
    startTime: number;
    totalBytes: number;
    completedSegments: number;
  }> = new Map();

  async startDownload(
    url: string,
    title?: string,
    maxConcurrency: number = 4,
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<string> {
    const downloadId = this.generateId();

    try {
      // Parse M3U8 playlist
      const playlist = await M3U8Parser.parsePlaylist(url);

      // Create download record
      const download: M3U8Download = {
        id: downloadId,
        url,
        title: title || playlist.title || 'Unknown',
        status: 'pending',
        progress: 0,
        totalSegments: playlist.segments.length,
        downloadedSegments: 0,
        createdAt: new Date(),
      };

      this.downloads.set(downloadId, download);

      if (onProgress) {
        this.progressCallbacks.set(downloadId, onProgress);
      }

      // Start downloading segments (don't await to return immediately)
      this.downloadSegments(downloadId, playlist, maxConcurrency).catch(error => {
        console.error('Download failed:', error);
        download.status = 'failed';
        this.updateProgress(downloadId, error instanceof Error ? error.message : 'Download failed');
      });

      return downloadId;
    } catch (error) {
      throw new Error(`Failed to start download: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async downloadSegments(
    downloadId: string,
    playlist: M3U8Playlist,
    maxConcurrency: number
  ): Promise<void> {
    const download = this.downloads.get(downloadId);
    if (!download) return;

    const abortController = new AbortController();
    this.abortControllers.set(downloadId, abortController);

    // Initialize download stats
    this.downloadStats.set(downloadId, {
      startTime: Date.now(),
      totalBytes: 0,
      completedSegments: 0
    });

    try {
      download.status = 'downloading';

      const segments = playlist.segments;
      const downloadedSegments: ArrayBuffer[] = new Array(segments.length);
      let hasError = false;

      // Send initial progress update
      this.updateProgress(downloadId);

      // Create a semaphore to limit concurrent downloads
      const semaphore = new Semaphore(maxConcurrency);

      const downloadPromises = segments.map(async (segmentUrl, index) => {
        if (hasError || abortController.signal.aborted) return;

        await semaphore.acquire();

        try {
          if (hasError || abortController.signal.aborted) return;

          const response = await fetch('/api/download-segment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: segmentUrl }),
            signal: abortController.signal
          });

          if (!response.ok) {
            throw new Error(`Failed to download segment ${index}: ${response.statusText}`);
          }

          const arrayBuffer = await response.arrayBuffer();
          downloadedSegments[index] = arrayBuffer;

          // Update stats atomically
          const stats = this.downloadStats.get(downloadId);
          if (stats) {
            stats.completedSegments++;
            stats.totalBytes += arrayBuffer.byteLength;

            // Update download record
            download.downloadedSegments = stats.completedSegments;
            download.progress = Math.round((stats.completedSegments / segments.length) * 100);

            // Update progress with current stats
            this.updateProgress(downloadId);
          }

        } catch (error) {
          if (!abortController.signal.aborted) {
            console.error(`Error downloading segment ${index}:`, error);
            hasError = true;
            download.status = 'failed';
            this.updateProgress(downloadId, error instanceof Error ? error.message : 'Download failed');
          }
        } finally {
          semaphore.release();
        }
      });

      await Promise.all(downloadPromises);

      if (hasError || abortController.signal.aborted) {
        return;
      }

      // Merge segments into a single file
      await this.mergeSegments(downloadId, downloadedSegments, download.title);

      download.status = 'completed';
      download.completedAt = new Date();
      download.progress = 100;
      this.updateProgress(downloadId);

    } catch (error) {
      download.status = 'failed';
      this.updateProgress(downloadId, error instanceof Error ? error.message : 'Download failed');
    } finally {
      this.abortControllers.delete(downloadId);
      this.downloadStats.delete(downloadId);
    }
  }

  private async mergeSegments(
    downloadId: string,
    segments: ArrayBuffer[],
    title: string
  ): Promise<void> {
    try {
      // Calculate total size
      const totalSize = segments.reduce((sum, segment) => sum + segment.byteLength, 0);

      // Create blob directly from segments without merging into a single buffer
      // This is much more memory efficient for large videos
      const segmentBlobs = segments.map(segment => new Blob([segment]));
      const blob = new Blob(segmentBlobs, { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);

      // Update download record
      const download = this.downloads.get(downloadId);
      if (download) {
        download.filePath = url;
        download.fileSize = totalSize;
      }

      // Trigger browser download
      this.triggerBrowserDownload(url, `${title}.mp4`);

    } catch (error) {
      throw new Error(`Failed to merge segments: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private triggerBrowserDownload(url: string, filename: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL after a delay
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  }

  private updateProgress(downloadId: string, error?: string): void {
    const download = this.downloads.get(downloadId);
    const callback = this.progressCallbacks.get(downloadId);
    const stats = this.downloadStats.get(downloadId);

    if (!download || !callback) return;

    // Calculate speed and ETA based on accumulated stats
    let downloadSpeed = 0;
    let eta = 0;

    if (stats && stats.completedSegments > 0) {
      const elapsedTime = (Date.now() - stats.startTime) / 1000; // seconds
      downloadSpeed = stats.totalBytes / elapsedTime; // bytes per second

      if (downloadSpeed > 0 && download.status === 'downloading') {
        const remainingSegments = download.totalSegments - stats.completedSegments;
        const avgBytesPerSegment = stats.totalBytes / stats.completedSegments;
        const remainingBytes = remainingSegments * avgBytesPerSegment;
        eta = Math.round(remainingBytes / downloadSpeed);
      }
    }

    const progress: DownloadProgress = {
      downloadId,
      progress: download.progress,
      currentSegment: download.downloadedSegments,
      totalSegments: download.totalSegments,
      downloadSpeed,
      eta,
      status: download.status,
      error
    };

    callback(progress);
  }

  cancelDownload(downloadId: string): void {
    const abortController = this.abortControllers.get(downloadId);
    if (abortController) {
      abortController.abort();
    }

    const download = this.downloads.get(downloadId);
    if (download) {
      download.status = 'failed';
      this.updateProgress(downloadId, 'Download cancelled');
    }
  }

  getDownload(downloadId: string): M3U8Download | undefined {
    return this.downloads.get(downloadId);
  }

  getAllDownloads(): M3U8Download[] {
    return Array.from(this.downloads.values());
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

// Semaphore class to limit concurrent operations
class Semaphore {
  private permits: number;
  private waitQueue: (() => void)[] = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      this.waitQueue.push(resolve);
    });
  }

  release(): void {
    this.permits++;
    if (this.waitQueue.length > 0) {
      const resolve = this.waitQueue.shift();
      if (resolve) {
        this.permits--;
        resolve();
      }
    }
  }
}

// Singleton instance
export const downloadManager = new DownloadManager();
