"use client";

import { useState } from 'react';
import { DownloadForm } from '@/components/DownloadForm';
import { BatchDownloadForm } from '@/components/BatchDownloadForm';
import { ProgressTracker } from '@/components/ProgressTracker';
import { QueueProgressList } from '@/components/QueueProgressTracker';
import { HistoryPanel } from '@/components/HistoryPanel';
import { DownloadProvider } from '@/contexts/DownloadContext';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <img
                src="/logo.svg"
                alt="M3U8 Video Downloader"
                className="h-16 w-auto"
              />
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Download videos from M3U8 playlists with multi-threaded downloading,
              progress tracking, and download history management.
            </p>
          </div>

          {/* Main Content */}
          <DownloadProvider>
            <div className="space-y-6">
              {/* Tab Navigation */}
              <div className="bg-white rounded-lg shadow-lg p-1">
                <div className="flex space-x-1">
                  <button
                    onClick={() => setActiveTab('single')}
                    className={`flex-1 py-3 px-4 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'single'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    Single Download
                  </button>
                  <button
                    onClick={() => setActiveTab('batch')}
                    className={`flex-1 py-3 px-4 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'batch'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    Batch Download
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === 'single' ? (
                <div className="space-y-6">
                  <DownloadForm />
                  <ProgressTracker />
                </div>
              ) : (
                <div className="space-y-6">
                  <BatchDownloadForm />
                  <QueueProgressList />
                </div>
              )}
            </div>
          </DownloadProvider>

          {/* Features Section */}
          <div className="bg-white rounded-lg shadow-lg p-6 mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Features</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Easy Download</h3>
                <p className="text-sm text-gray-600">Simply paste your M3U8 URL and start downloading</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Multi-threaded</h3>
                <p className="text-sm text-gray-600">Fast downloads with configurable concurrency</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Progress Tracking</h3>
                <p className="text-sm text-gray-600">Real-time progress with speed and ETA</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Download History</h3>
                <p className="text-sm text-gray-600">Keep track of all your downloads</p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Use</h3>

            {/* Single Download Instructions */}
            <div className="mb-4">
              <h4 className="font-semibold text-blue-900 mb-2">📱 Single Download</h4>
              <ol className="list-decimal list-inside space-y-1 text-blue-800 text-sm">
                <li>Switch to the "Single Download" tab</li>
                <li>Paste your M3U8 playlist URL in the input field</li>
                <li>Optionally, enter a custom title for your video</li>
                <li>Adjust advanced settings if needed (concurrent downloads)</li>
                <li>Click "Start Download" to begin the process</li>
              </ol>
            </div>

            {/* Batch Download Instructions */}
            <div className="mb-4">
              <h4 className="font-semibold text-blue-900 mb-2">📚 Batch Download</h4>
              <ol className="list-decimal list-inside space-y-1 text-blue-800 text-sm">
                <li>Switch to the "Batch Download" tab</li>
                <li>Enter multiple M3U8 URLs (click "Add URL" for more)</li>
                <li>Optionally, provide custom titles for each video</li>
                <li>Set a queue name to organize your downloads</li>
                <li>Adjust max concurrent downloads (1-5 simultaneous videos)</li>
                <li>Click "Start Batch Download" to process all URLs</li>
                <li>Use pause/resume/cancel controls to manage the queue</li>
              </ol>
            </div>

            <p className="text-blue-800 text-sm">
              💡 <strong>Tip:</strong> Monitor progress in real-time and access your download history below.
            </p>

            <div className="bg-blue-100 border border-blue-300 rounded p-3 mt-4">
              <h4 className="font-semibold text-blue-900 mb-2">📁 Download Location</h4>
              <p className="text-sm text-blue-800">
                Downloaded videos will be saved to your browser's default Downloads folder:
              </p>
              <ul className="text-sm text-blue-700 mt-1 ml-4">
                <li>• <strong>Windows:</strong> C:\Users\[Username]\Downloads</li>
                <li>• <strong>macOS:</strong> ~/Downloads</li>
                <li>• <strong>Linux:</strong> ~/Downloads</li>
              </ul>
              <p className="text-xs text-blue-600 mt-2">
                You can change your browser's download location in your browser settings.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* History Panel */}
      <HistoryPanel />
    </div>
  );
}
