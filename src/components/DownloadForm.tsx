'use client';

import { useState } from 'react';
import { useDownload } from '@/contexts/DownloadContext';
import { M3U8Parser } from '@/lib/m3u8-parser';
import { Download, AlertCircle, Settings } from 'lucide-react';

export function DownloadForm() {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [maxConcurrency, setMaxConcurrency] = useState(4);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [validationError, setValidationError] = useState('');

  const { startDownload, isDownloading, error } = useDownload();

  const validateUrl = (inputUrl: string): boolean => {
    if (!inputUrl.trim()) {
      setValidationError('Please enter a URL');
      return false;
    }

    if (!M3U8Parser.validateM3U8Url(inputUrl)) {
      setValidationError('Please enter a valid HTTP/HTTPS URL');
      return false;
    }

    if (!inputUrl.toLowerCase().includes('.m3u8')) {
      setValidationError('URL should point to an M3U8 playlist file');
      return false;
    }

    setValidationError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateUrl(url)) {
      return;
    }

    try {
      await startDownload(url, title || undefined, maxConcurrency);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);

    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError('');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">M3U8 Video Downloader</h2>
        <p className="text-gray-600">Enter an M3U8 playlist URL to download the video</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="url" className="block text-sm font-semibold text-gray-800 mb-3">
            M3U8 Playlist URL *
          </label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={handleUrlChange}
            placeholder="Enter M3U8 URL (e.g., https://example.com/stream/playlist.m3u8)"
            className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-black"
            disabled={isDownloading}
            required
          />
          {validationError && (
            <div className="mt-3 flex items-center text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-2">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{validationError}</span>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Video Title (Optional)
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a custom title for the video"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
            disabled={isDownloading}
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center text-sm text-gray-600 hover:text-gray-800"
            disabled={isDownloading}
          >
            <Settings className="w-4 h-4 mr-1" />
            Advanced Settings
          </button>
        </div>

        {showAdvanced && (
          <div className="p-4 bg-gray-50 rounded-md">
            <div>
              <label htmlFor="concurrency" className="block text-sm font-medium text-gray-700 mb-2">
                Max Concurrent Downloads: {maxConcurrency}
              </label>
              <input
                type="range"
                id="concurrency"
                min="1"
                max="8"
                value={maxConcurrency}
                onChange={(e) => setMaxConcurrency(parseInt(e.target.value))}
                className="w-full"
                disabled={isDownloading}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1 (Slower)</span>
                <span>8 (Faster)</span>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Higher values download faster but may be blocked by some servers
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center text-red-800">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isDownloading || !url.trim()}
          className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4 mr-2" />
          {isDownloading ? 'Starting Download...' : 'Start Download'}
        </button>
      </form>
    </div>
  );
}
