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
