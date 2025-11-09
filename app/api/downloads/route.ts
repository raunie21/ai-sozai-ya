import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// Upstash Redis クライアント（環境変数から自動読み込み）
const redis = Redis.fromEnv();

export async function POST(request: NextRequest) {
  try {
    const { illustrationId } = await request.json();
    console.log('Download API called for illustration ID:', illustrationId);
    
    if (!illustrationId) {
      console.log('Error: Illustration ID is required');
      return NextResponse.json({ error: 'Illustration ID is required' }, { status: 400 });
    }

    // 原子的にカウントアップ（存在しなければ1から）
    const newCount = await redis.incr(`downloads:${illustrationId}`);
    const currentCount = newCount - 1;
    
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
    // keys/scan を避け、next_id から1..next_id の範囲で取得
    const nextIdRaw = await redis.get('illustration:next_id');
    const nextId = Number(nextIdRaw || 0);
    const downloads: Record<string, number> = {};
    if (Number.isFinite(nextId) && nextId > 0) {
      const CHUNK = 300;
      for (let start = 1; start <= nextId; start += CHUNK) {
        const end = Math.min(start + CHUNK - 1, nextId);
        const keys = Array.from({ length: end - start + 1 }, (_, i) => `downloads:${start + i}`);
        const values = await redis.mget<number[]>(...keys);
        for (let i = 0; i < keys.length; i++) {
          const id = (start + i).toString();
          const v = (values?.[i] ?? 0) as number;
          downloads[id] = Number(v || 0);
        }
      }
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
