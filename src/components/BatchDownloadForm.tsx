'use client';

import { useState } from 'react';
import { useDownload } from '@/contexts/DownloadContext';
import { M3U8Parser } from '@/lib/m3u8-parser';
import { Download, Plus, X, AlertCircle, Settings, List } from 'lucide-react';

interface UrlInput {
  id: string;
  url: string;
  title: string;
  error?: string;
}

export function BatchDownloadForm() {
  const [urlInputs, setUrlInputs] = useState<UrlInput[]>([
    { id: '1', url: '', title: '' }
  ]);
  const [queueName, setQueueName] = useState('');
  const [maxConcurrency, setMaxConcurrency] = useState(2);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const { startBatchDownload, error } = useDownload();

  const addUrlInput = () => {
    const newId = (urlInputs.length + 1).toString();
    setUrlInputs([...urlInputs, { id: newId, url: '', title: '' }]);
  };

  const removeUrlInput = (id: string) => {
    if (urlInputs.length > 1) {
      setUrlInputs(urlInputs.filter(input => input.id !== id));
    }
  };

  const updateUrlInput = (id: string, field: 'url' | 'title', value: string) => {
    setUrlInputs(urlInputs.map(input =>
      input.id === id ? { ...input, [field]: value, error: undefined } : input
    ));

    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const validateInputs = (): boolean => {
    const errors: string[] = [];
    const updatedInputs = [...urlInputs];

    urlInputs.forEach((input, index) => {
      if (!input.url.trim()) {
        updatedInputs[index].error = 'URL is required';
        errors.push(`URL ${index + 1}: URL is required`);
        return;
      }

      if (!M3U8Parser.validateM3U8Url(input.url)) {
        updatedInputs[index].error = 'Invalid URL format';
        errors.push(`URL ${index + 1}: Invalid URL format`);
        return;
      }

      if (!input.url.toLowerCase().includes('.m3u8')) {
        updatedInputs[index].error = 'URL should point to an M3U8 file';
        errors.push(`URL ${index + 1}: URL should point to an M3U8 file`);
        return;
      }
    });

    setUrlInputs(updatedInputs);
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateInputs()) {
      return;
    }

    const validUrls = urlInputs.filter(input => input.url.trim());

    if (validUrls.length === 0) {
      setValidationErrors(['At least one URL is required']);
      return;
    }

    try {
      const request = {
        urls: validUrls.map(input => input.url.trim()),
        titles: validUrls.map(input => input.title.trim()).filter(title => title !== ''),
        maxConcurrency,
        queueName: queueName.trim() || undefined
      };

      await startBatchDownload(request);

      // Reset form on success
      setUrlInputs([{ id: '1', url: '', title: '' }]);
      setQueueName('');
      setValidationErrors([]);

    } catch (err) {
      console.error('Batch download failed:', err);
    }
  };

  const isSubmitting = false; // We'll track this later if needed

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
          <List className="w-6 h-6 mr-2" />
          Batch M3U8 Download
        </h2>
        <p className="text-gray-600">Download multiple M3U8 videos simultaneously</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Queue Name */}
        <div>
          <label htmlFor="queueName" className="block text-sm font-medium text-gray-700 mb-2">
            Queue Name (Optional)
          </label>
          <input
            type="text"
            id="queueName"
            value={queueName}
            onChange={(e) => setQueueName(e.target.value)}
            placeholder="Enter a name for this download queue"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
            disabled={isSubmitting}
          />
        </div>

        {/* URL Inputs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-gray-800">
              M3U8 URLs *
            </label>
            <button
              type="button"
              onClick={addUrlInput}
              className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add URL
            </button>
          </div>

          {urlInputs.map((input, index) => (
            <div key={input.id} className="flex gap-3 items-start">
              <div className="flex-1 space-y-2">
                <div>
                  <input
                    type="url"
                    value={input.url}
                    onChange={(e) => updateUrlInput(input.id, 'url', e.target.value)}
                    placeholder={`M3U8 URL ${index + 1}`}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
                      input.error ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                    }`}
                    disabled={isSubmitting}
                    required
                  />
                  {input.error && (
                    <div className="mt-1 flex items-center text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span>{input.error}</span>
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  value={input.title}
                  onChange={(e) => updateUrlInput(input.id, 'title', e.target.value)}
                  placeholder={`Title ${index + 1} (optional)`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  disabled={isSubmitting}
                />
              </div>

              {urlInputs.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeUrlInput(input.id)}
                  className="mt-2 p-2 text-red-600 hover:text-red-800 focus:outline-none"
                  disabled={isSubmitting}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Advanced Settings */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center text-sm text-gray-600 hover:text-gray-800"
            disabled={isSubmitting}
          >
            <Settings className="w-4 h-4 mr-1" />
            Advanced Settings
          </button>
        </div>

        {showAdvanced && (
          <div className="p-4 bg-gray-50 rounded-md">
            <div>
              <label htmlFor="batchConcurrency" className="block text-sm font-medium text-gray-700 mb-2">
                Max Concurrent Downloads: {maxConcurrency}
              </label>
              <input
                type="range"
                id="batchConcurrency"
                min="1"
                max="5"
                value={maxConcurrency}
                onChange={(e) => setMaxConcurrency(parseInt(e.target.value))}
                className="w-full"
                disabled={isSubmitting}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1 (Sequential)</span>
                <span>5 (Max Parallel)</span>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Number of videos to download simultaneously. Lower values are more stable.
              </p>
            </div>
          </div>
        )}

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-start text-red-800">
              <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium mb-1">Please fix the following errors:</p>
                <ul className="text-sm list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Global Error */}
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
          disabled={isSubmitting || urlInputs.every(input => !input.url.trim())}
          className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4 mr-2" />
          {isSubmitting ? 'Starting Batch Download...' : 'Start Batch Download'}
        </button>
      </form>
    </div>
  );
}
