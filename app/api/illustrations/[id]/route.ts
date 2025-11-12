import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

export const runtime = 'edge';

const redis = Redis.fromEnv();

// 個別イラスト取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const illustration = await redis.get(`illustration:${id}`);
    
    if (!illustration) {
      return NextResponse.json({ 
        success: false, 
        error: 'Illustration not found' 
      }, { status: 404 });
    }

    // ダウンロード数も取得
    const downloads = await redis.get(`downloads:${id}`) || 0;
    
    // データが既にオブジェクトの場合はそのまま使用、文字列の場合はパース
    const data = typeof illustration === 'string' ? JSON.parse(illustration) : illustration;
    const result = {
      ...data,
      downloads: Number(downloads)
    };

    const response = NextResponse.json({ 
      success: true, 
      illustration: result 
    });

    // CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    // Cache headers（CDNキャッシュを効かせてTTFB短縮）
    response.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=600');

    return response;
  } catch (error) {
    console.error('Error fetching illustration:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch illustration' 
    }, { status: 500 });
  }
}

// イラスト更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    
    // 既存データを取得
    const existing = await redis.get(`illustration:${id}`);
    if (!existing) {
      return NextResponse.json({ 
        success: false, 
        error: 'Illustration not found' 
      }, { status: 404 });
    }

    // データが既にオブジェクトの場合はそのまま使用、文字列の場合はパース
    const existingData = typeof existing === 'string' ? JSON.parse(existing) : existing;
    
    // 更新データをマージ
    const updatedIllustration = {
      ...existingData,
      ...body,
      id: parseInt(id), // IDは変更不可
      updatedAt: new Date().toISOString()
    };

    // Upstashに保存
    await redis.set(`illustration:${id}`, JSON.stringify(updatedIllustration));

    const response = NextResponse.json({ 
      success: true, 
      illustration: updatedIllustration 
    });

    // CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

    return response;
  } catch (error) {
    console.error('Error updating illustration:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update illustration' 
    }, { status: 500 });
  }
}

// イラスト削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // 存在確認
    const existing = await redis.get(`illustration:${id}`);
    if (!existing) {
      return NextResponse.json({ 
        success: false, 
        error: 'Illustration not found' 
      }, { status: 404 });
    }

    // イラストとダウンロード数を削除
    await redis.del(`illustration:${id}`);
    await redis.del(`downloads:${id}`);

    const response = NextResponse.json({ 
      success: true, 
      message: 'Illustration deleted successfully' 
    });

    // CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

    return response;
  } catch (error) {
    console.error('Error deleting illustration:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete illustration' 
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
