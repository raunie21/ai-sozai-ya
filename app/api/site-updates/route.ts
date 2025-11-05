import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();
const IDS_KEY = 'site_updates:ids';
const ITEM_KEY = (id: number | string) => `site_update:${id}`;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limit = Math.min(Math.max(parseInt(limitParam || '8', 10) || 8, 1), 50);

    // 手動上書き: site_updates:manual があれば優先
    const manualRaw = await redis.get('site_updates:manual');
    if (manualRaw) {
      try {
        const arr = typeof manualRaw === 'string' ? JSON.parse(manualRaw) : manualRaw;
        if (Array.isArray(arr)) {
          const updates = arr
            .filter((x: any) => x && x.date && x.text)
            .slice(0, limit)
            .map((x: any, i: number) => ({ id: i + 1, date: x.date, text: x.text }));
          return NextResponse.json({ updates, source: 'manual' }, { status: 200 });
        }
      } catch {
        // 無視して従来の読み方へフォールバック
      }
    }

    // 最新順（LPUSHで積んでいる想定）
    const idStrings: string[] = await redis.lrange(IDS_KEY, 0, limit - 1);
    if (!idStrings || idStrings.length === 0) {
      return NextResponse.json({ updates: [] }, { status: 200 });
    }

    const keys = idStrings.map((id) => ITEM_KEY(id));
    const rawList = await redis.mget<string[]>(...keys as any);
    const updates = (rawList || [])
      .map((raw, i) => {
        try {
          if (!raw) return null;
          const obj = typeof raw === 'string' ? JSON.parse(raw) : raw;
          return { id: Number(idStrings[i]), date: obj?.date, text: obj?.text, createdAt: obj?.createdAt };
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    return NextResponse.json({ updates }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: 'failed_to_fetch_updates', message: e?.message || 'unknown' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
    const expected = process.env.SITE_UPDATES_WRITE_TOKEN || '';
    if (!expected || auth !== expected) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const date: string = body?.date || '';
    const text: string = body?.text || '';
    if (!date || !text) {
      return NextResponse.json({ error: 'invalid_body', message: 'date and text are required' }, { status: 400 });
    }

    // ID採番
    const nextId = await redis.incr('site_update:next_id');
    const payload = {
      id: nextId,
      date,
      text,
      createdAt: new Date().toISOString(),
    };

    await redis.set(ITEM_KEY(nextId), JSON.stringify(payload));
    await redis.lpush(IDS_KEY, String(nextId));

    return NextResponse.json({ ok: true, update: payload }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: 'failed_to_create', message: e?.message || 'unknown' }, { status: 500 });
  }
}


