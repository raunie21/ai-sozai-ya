import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

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
    // 全イラストのIDを取得
    const keys = await redis.keys('illustration:*');
    
    if (keys.length === 0) {
      return NextResponse.json({ success: true, illustrations: [] });
    }

    // 全イラストデータを一括取得
    const illustrations = await redis.mget(...keys);
    
    // ダウンロード数も取得
    const downloadKeys = keys.map(key => `downloads:${key.split(':')[1]}`);
    const downloadCounts = await redis.mget(...downloadKeys);

    // データを整形
    const result = illustrations.map((illustration, index) => {
      if (!illustration) return null;
      
      // データが既にオブジェクトの場合はそのまま使用、文字列の場合はパース
      const data = typeof illustration === 'string' ? JSON.parse(illustration) : illustration;
      return {
        ...data,
        downloads: Number(downloadCounts[index]) || 0
      };
    }).filter(Boolean);

    // ID順でソート
    result.sort((a, b) => a.id - b.id);

    const response = NextResponse.json({ 
      success: true, 
      illustrations: result 
    });

    // CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

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
