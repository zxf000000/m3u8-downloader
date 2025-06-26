import { M3U8Playlist, M3U8Segment } from '@/types';

export class M3U8Parser {
  static async parsePlaylist(url: string): Promise<M3U8Playlist> {
    try {
      // Use our API route to fetch M3U8 content (bypasses CORS)
      const response = await fetch('/api/m3u8', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch M3U8: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseM3U8Content(data.content, url);
    } catch (error) {
      throw new Error(`Error parsing M3U8: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static parseM3U8Content(content: string, baseUrl: string): M3U8Playlist {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line);

    if (!lines[0]?.startsWith('#EXTM3U')) {
      throw new Error('Invalid M3U8 file format');
    }

    const segments: string[] = [];
    let totalDuration = 0;
    let currentDuration = 0;

    // Extract base URL for relative paths
    const urlParts = baseUrl.split('/');
    urlParts.pop(); // Remove filename
    const baseUrlPath = urlParts.join('/');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith('#EXTINF:')) {
        // Extract duration from #EXTINF line
        const durationMatch = line.match(/#EXTINF:([\d.]+)/);
        if (durationMatch) {
          currentDuration = parseFloat(durationMatch[1]);
          totalDuration += currentDuration;
        }
      } else if (line.startsWith('#EXT-X-ENDLIST')) {
        // End of playlist
        break;
      } else if (!line.startsWith('#') && line.length > 0) {
        // This is a segment URL
        let segmentUrl = line;

        // Handle relative URLs
        if (!segmentUrl.startsWith('http')) {
          if (segmentUrl.startsWith('/')) {
            // Absolute path
            const urlObj = new URL(baseUrl);
            segmentUrl = `${urlObj.protocol}//${urlObj.host}${segmentUrl}`;
          } else {
            // Relative path
            segmentUrl = `${baseUrlPath}/${segmentUrl}`;
          }
        }

        segments.push(segmentUrl);
      }
    }

    if (segments.length === 0) {
      throw new Error('No video segments found in M3U8 playlist');
    }

    // Extract title from URL or use default
    const title = this.extractTitleFromUrl(baseUrl);

    return {
      url: baseUrl,
      segments,
      duration: totalDuration,
      title,
      baseUrl: baseUrlPath
    };
  }

  static extractTitleFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const filename = pathname.split('/').pop() || 'video';
      return filename.replace(/\.[^/.]+$/, ''); // Remove extension
    } catch {
      return 'video';
    }
  }

  static getSegments(playlist: M3U8Playlist): M3U8Segment[] {
    return playlist.segments.map((url, index) => ({
      url,
      duration: playlist.duration / playlist.segments.length, // Approximate duration per segment
      index
    }));
  }

  static validateM3U8Url(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }
}
