'use client';

import { useDownload } from '@/contexts/DownloadContext';
import { formatBytes, formatTime } from '@/lib/utils';
import { Download, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export function ProgressTracker() {
  const { currentDownload, progress, isDownloading, cancelDownload, resetDownload } = useDownload();

  if (!currentDownload && !progress) {
    return null;
  }

  const getStatusIcon = () => {
    switch (currentDownload?.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'downloading':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Download className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    if (progress?.error) {
      return `Error: ${progress.error}`;
    }

    switch (currentDownload?.status) {
      case 'pending':
        return 'Preparing download...';
      case 'downloading':
        return `Downloading segment ${progress?.currentSegment || 0} of ${progress?.totalSegments || 0}`;
      case 'completed':
        return 'Download completed successfully!';
      case 'failed':
        return 'Download failed';
      default:
        return 'Unknown status';
    }
  };

  const progressPercentage = progress?.progress || 0;

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg border-l-4 border-blue-500">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <h3 className="font-semibold text-gray-900">{currentDownload?.title || 'Unknown Video'}</h3>
            <p className="text-sm text-gray-600 break-all">{currentDownload?.url}</p>
          </div>
        </div>

        <div className="flex space-x-2">
          {isDownloading && (
            <button
              onClick={cancelDownload}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              title="Cancel Download"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {!isDownloading && (
            <button
              onClick={resetDownload}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Clear"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm text-gray-600">
          <span>{getStatusText()}</span>
          <span>{progressPercentage}%</span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${currentDownload?.status === 'completed'
              ? 'bg-green-500'
              : currentDownload?.status === 'failed'
                ? 'bg-red-500'
                : 'bg-blue-500'
              }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {progress && (
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Speed:</span>{' '}
              {progress.downloadSpeed > 0 ? formatBytes(progress.downloadSpeed) + '/s' : 'Calculating...'}
            </div>
            <div>
              <span className="font-medium">ETA:</span>{' '}
              {progress.eta > 0 ? formatTime(progress.eta) : 'Calculating...'}
            </div>
            <div>
              <span className="font-medium">Segments:</span>{' '}
              {progress.currentSegment} / {progress.totalSegments}
            </div>
            <div>
              <span className="font-medium">Status:</span>{' '}
              <span className={`capitalize ${currentDownload?.status === 'completed' ? 'text-green-600' :
                currentDownload?.status === 'failed' ? 'text-red-600' :
                  'text-blue-600'
                }`}>
                {currentDownload?.status || 'Unknown'}
              </span>
            </div>
          </div>
        )}

        {currentDownload?.status === 'completed' && (
          <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
            <div className="flex items-center text-green-800 mb-3">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              <span className="text-base font-semibold">
                🎉 Download Completed Successfully!
              </span>
            </div>
            {currentDownload.fileSize && (
              <div className="text-sm text-green-700 mb-3">
                <strong>File size:</strong> {formatBytes(currentDownload.fileSize)}
              </div>
            )}
            <div className="text-sm text-green-700 bg-green-100 p-3 rounded-md border border-green-300">
              <div className="mb-2">
                <strong>📁 Download Location:</strong> The file has been saved to your browser's default Downloads folder
              </div>
              <div className="mb-2">
                <strong>📄 Filename:</strong> {currentDownload.title}.mp4
              </div>
              <div className="text-xs text-green-600 mt-2">
                <strong>Tip:</strong> You can change your browser's download location in your browser settings.
              </div>
            </div>
            <div className="mt-3 flex justify-center">
              <button
                onClick={resetDownload}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
              >
                Download Another Video
              </button>
            </div>
          </div>
        )}

        {currentDownload?.status === 'failed' && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center text-red-800">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span className="text-sm">
                {progress?.error || 'Download failed. Please try again.'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
