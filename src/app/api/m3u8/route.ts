import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Fetch the M3U8 file from the server side (bypasses CORS)
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch M3U8: ${response.statusText}` },
        { status: response.status }
      );
    }

    const content = await response.text();

    // Basic validation that this is an M3U8 file
    if (!content.includes('#EXTM3U')) {
      return NextResponse.json(
        { error: 'Invalid M3U8 file format' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      content,
      url,
      success: true
    });

  } catch (error) {
    console.error('Error fetching M3U8:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
