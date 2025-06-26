'use client';

import { useDownload } from '@/contexts/DownloadContext';
import { DownloadQueue, QueueProgress } from '@/types';
import { Play, Pause, X, Clock, Download, CheckCircle, XCircle } from 'lucide-react';

interface QueueProgressTrackerProps {
  queue: DownloadQueue;
  progress?: QueueProgress;
}

function QueueProgressTracker({ queue, progress }: QueueProgressTrackerProps) {
  const { pauseQueue, resumeQueue, cancelQueue, removeQueue } = useDownload();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Play className="w-4 h-4 text-blue-600" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-yellow-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatSpeed = (bytesPerSecond: number): string => {
    if (bytesPerSecond === 0) return '0 B/s';

    const units = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
    let size = bytesPerSecond;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const formatTime = (seconds: number): string => {
    if (seconds === 0 || !isFinite(seconds)) return '--';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const overallProgress = progress?.overallProgress || 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          {getStatusIcon(queue.status)}
          <div>
            <h3 className="font-semibold text-gray-900">{queue.name}</h3>
            <p className="text-sm text-gray-600">
              {queue.totalItems} items • {queue.completedItems} completed • {queue.failedItems} failed
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(queue.status)}`}>
            {queue.status.charAt(0).toUpperCase() + queue.status.slice(1)}
          </span>

          {queue.status === 'running' && (
            <button
              onClick={() => pauseQueue(queue.id)}
              className="p-1 text-yellow-600 hover:text-yellow-800 focus:outline-none"
              title="Pause Queue"
            >
              <Pause className="w-4 h-4" />
            </button>
          )}

          {queue.status === 'paused' && (
            <button
              onClick={() => resumeQueue(queue.id)}
              className="p-1 text-blue-600 hover:text-blue-800 focus:outline-none"
              title="Resume Queue"
            >
              <Play className="w-4 h-4" />
            </button>
          )}

          {(queue.status === 'running' || queue.status === 'paused') && (
            <button
              onClick={() => cancelQueue(queue.id)}
              className="p-1 text-red-600 hover:text-red-800 focus:outline-none"
              title="Cancel Queue"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {(queue.status === 'completed' || queue.status === 'failed') && (
            <button
              onClick={() => removeQueue(queue.id)}
              className="p-1 text-gray-600 hover:text-gray-800 focus:outline-none"
              title="Remove Queue"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Overall Progress</span>
          <span>{overallProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      {progress && queue.status === 'running' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Download className="w-4 h-4 text-blue-600" />
            <div>
              <p className="text-gray-600">Active</p>
              <p className="font-medium">{progress.activeItems}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-600 rounded" />
            <div>
              <p className="text-gray-600">Speed</p>
              <p className="font-medium">{formatSpeed(progress.totalSpeed)}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-600" />
            <div>
              <p className="text-gray-600">ETA</p>
              <p className="font-medium">{formatTime(progress.estimatedTimeRemaining)}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <div>
              <p className="text-gray-600">Completed</p>
              <p className="font-medium">{queue.completedItems}/{queue.totalItems}</p>
            </div>
          </div>
        </div>
      )}

      {/* Individual Items */}
      {queue.items.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Items</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {queue.items.map((item, index) => (
              <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  {item.status === 'completed' && <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />}
                  {item.status === 'failed' && <XCircle className="w-3 h-3 text-red-600 flex-shrink-0" />}
                  {item.status === 'downloading' && <Download className="w-3 h-3 text-blue-600 flex-shrink-0" />}
                  {item.status === 'pending' && <Clock className="w-3 h-3 text-gray-600 flex-shrink-0" />}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.title || `Video ${index + 1}`}
                    </p>
                    {item.status === 'downloading' && (
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                        <div
                          className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-xs text-gray-500 ml-2">
                  {item.status === 'downloading' && `${item.progress}%`}
                  {item.status === 'failed' && item.retryCount > 0 && `Retry ${item.retryCount}/${item.maxRetries}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function QueueProgressList() {
  const { activeQueues, queueProgress } = useDownload();

  if (activeQueues.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Download Queues</h2>
      {activeQueues.map((queue) => (
        <QueueProgressTracker
          key={queue.id}
          queue={queue}
          progress={queueProgress.get(queue.id)}
        />
      ))}
    </div>
  );
}

export default QueueProgressTracker;
