import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function POST(request: NextRequest) {
  try {
    const { illustrationId } = await request.json();
    console.log('Download API called for illustration ID:', illustrationId);
    
    if (!illustrationId) {
      console.log('Error: Illustration ID is required');
      return NextResponse.json({ error: 'Illustration ID is required' }, { status: 400 });
    }

    // Vercel KVから現在のダウンロード数を取得
    const currentCount = await kv.get(`downloads:${illustrationId}`) || 0;
    const newCount = Number(currentCount) + 1;
    
    // Vercel KVに新しいダウンロード数を保存
    await kv.set(`downloads:${illustrationId}`, newCount);
    
    console.log(`Updating download count for ID ${illustrationId}: ${currentCount} → ${newCount}`);

    const response = NextResponse.json({
      success: true,
      illustrationId: illustrationId,
      newDownloadCount: newCount,
      previousCount: Number(currentCount)
    });

    // CORSヘッダーを追加
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

    return response;
  } catch (error) {
    console.error('Error updating download count:', error);
    return NextResponse.json({ error: 'Failed to update download count' }, { status: 500 });
  }
}

export async function GET() {
  try {
    console.log('GET /api/downloads called');
    
    // 全イラストのダウンロード数を取得（ID 1-13）
    const downloads: Record<string, number> = {};
    for (let id = 1; id <= 13; id++) {
      const count = await kv.get(`downloads:${id}`) || 0;
      downloads[id.toString()] = Number(count);
    }
    
    console.log('Returning download counts:', downloads);
    
    const response = NextResponse.json({ success: true, downloads });
    
    // CORSヘッダーを追加
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    
    return response;
  } catch (error) {
    console.error('Error reading download counts:', error);
    return NextResponse.json({ error: 'Failed to read download counts' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
