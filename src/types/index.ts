export interface M3U8Download {
  id: string;
  url: string;
  title: string;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  progress: number;
  totalSegments: number;
  downloadedSegments: number;
  createdAt: Date;
  completedAt?: Date;
  filePath?: string;
  fileSize?: number;
}

export interface DownloadProgress {
  downloadId: string;
  progress: number;
  currentSegment: number;
  totalSegments: number;
  downloadSpeed: number;
  eta: number;
  status: string;
  error?: string;
}

export interface M3U8Playlist {
  url: string;
  segments: string[];
  duration: number;
  title?: string;
  baseUrl: string;
}

export interface M3U8Segment {
  url: string;
  duration: number;
  index: number;
}

export interface DownloadRequest {
  url: string;
  title?: string;
  maxConcurrency?: number;
}

export interface DownloadResponse {
  success: boolean;
  downloadId?: string;
  error?: string;
}

export interface HistoryItem extends M3U8Download {
  downloadSpeed?: number;
  errorMessage?: string;
}

// Batch download types
export interface DownloadQueue {
  id: string;
  name: string;
  items: QueueItem[];
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed';
  maxConcurrent: number;
  createdAt: Date;
  completedAt?: Date;
  totalItems: number;
  completedItems: number;
  failedItems: number;
}

export interface QueueItem extends M3U8Download {
  queueId: string;
  priority: number;
  retryCount: number;
  maxRetries: number;
  addedAt: Date;
}

export interface BatchDownloadRequest {
  urls: string[];
  titles?: string[];
  maxConcurrency?: number;
  queueName?: string;
}

export interface QueueProgress {
  queueId: string;
  totalItems: number;
  completedItems: number;
  failedItems: number;
  activeItems: number;
  overallProgress: number;
  totalSpeed: number;
  estimatedTimeRemaining: number;
  status: string;
}

export interface BatchDownloadResponse {
  success: boolean;
  queueId?: string;
  error?: string;
  addedCount?: number;
}
