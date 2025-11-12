import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

export const runtime = 'edge';

const redis = Redis.fromEnv();

// イラストの型定義
interface Illustration {
  id: number;
  title: string;
  imageUrl: string;
  thumbnailUrl: string;
  originalUrl: string;
  category: string;
  tags: string[];
  downloads: number;
  fileSize?: string;
  dimensions?: string;
  createdAt: string;
  updatedAt: string;
}

// 全イラスト取得
export async function GET() {
  try {
    // keys/scan を避け、next_id から1..next_id の範囲で取得して欠番は除外
    const nextIdRaw = await redis.get('illustration:next_id');
    const nextId = Number(nextIdRaw || 0);
    if (!Number.isFinite(nextId) || nextId <= 0) {
      return NextResponse.json({ success: true, illustrations: [] });
    }

    const makeKeys = (from: number, to: number) =>
      Array.from({ length: to - from + 1 }, (_, i) => `illustration:${from + i}`);

    const makeDownloadKeys = (from: number, to: number) =>
      Array.from({ length: to - from + 1 }, (_, i) => `downloads:${from + i}`);

    const CHUNK = 200; // Upstashへの過大なmgetを避ける
    const items: any[] = [];
    for (let start = 1; start <= nextId; start += CHUNK) {
      const end = Math.min(start + CHUNK - 1, nextId);
      const idKeys = makeKeys(start, end);
      const downloadKeys = makeDownloadKeys(start, end);
      const [chunkIllustrations, chunkDownloads] = await Promise.all([
        redis.mget(...idKeys),
        redis.mget(...downloadKeys),
      ]);

      for (let i = 0; i < idKeys.length; i++) {
        const raw = (chunkIllustrations as any[])[i];
        if (!raw) continue;
        try {
          const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
          const downloads = Number((chunkDownloads as any[])[i]) || 0;
          items.push({ ...data, downloads });
        } catch {
          // skip invalid json
        }
      }
    }

    // データを整形
    const result = items.sort((a, b) => a.id - b.id);

    const response = NextResponse.json({ 
      success: true, 
      illustrations: result 
    });

    // CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    // CDNキャッシュ（一覧は短め）
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');

    return response;
  } catch (error) {
    console.error('Error fetching illustrations:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch illustrations' 
    }, { status: 500 });
  }
}

// 新規イラスト作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, imageUrl, thumbnailUrl, originalUrl, category, tags, fileSize, dimensions } = body;

    // 必須フィールドの検証
    if (!title || !imageUrl || !category) {
      return NextResponse.json({ 
        success: false, 
        error: 'Title, imageUrl, and category are required' 
      }, { status: 400 });
    }

    // 新しいIDを生成（自動採番）
    const nextId = await redis.incr('illustration:next_id');
    
    const now = new Date().toISOString();
    const illustration: Illustration = {
      id: nextId,
      title,
      imageUrl,
      thumbnailUrl: thumbnailUrl || imageUrl,
      originalUrl: originalUrl || imageUrl,
      category,
      tags: tags || [],
      downloads: 0,
      fileSize: fileSize || '',
      dimensions: dimensions || '',
      createdAt: now,
      updatedAt: now
    };

    // Upstashに保存
    await redis.set(`illustration:${nextId}`, JSON.stringify(illustration));
    
    // ダウンロード数の初期化
    await redis.set(`downloads:${nextId}`, 0);

    const response = NextResponse.json({ 
      success: true, 
      illustration 
    });

    // CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

    return response;
  } catch (error) {
    console.error('Error creating illustration:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create illustration' 
    }, { status: 500 });
  }
}

// OPTIONS（CORS preflight）
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
