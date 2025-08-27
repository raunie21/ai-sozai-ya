import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const downloadsFilePath = path.join(process.cwd(), 'app/data/downloads.json');

export async function POST(request: NextRequest) {
  try {
    const { illustrationId } = await request.json();
    if (!illustrationId) {
      return NextResponse.json({ error: 'Illustration ID is required' }, { status: 400 });
    }

    let downloadsData;
    try {
      const fileContent = fs.readFileSync(downloadsFilePath, 'utf-8');
      downloadsData = JSON.parse(fileContent);
    } catch (error) {
      downloadsData = { downloads: {} };
    }

    const currentCount = downloadsData.downloads[illustrationId] || 0;
    downloadsData.downloads[illustrationId] = currentCount + 1;
    fs.writeFileSync(downloadsFilePath, JSON.stringify(downloadsData, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      illustrationId: illustrationId,
      newDownloadCount: currentCount + 1,
      previousCount: currentCount
    });
  } catch (error) {
    console.error('Error updating download count:', error);
    return NextResponse.json({ error: 'Failed to update download count' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const fileContent = fs.readFileSync(downloadsFilePath, 'utf-8');
    const downloadsData = JSON.parse(fileContent);
    return NextResponse.json({ success: true, downloads: downloadsData.downloads });
  } catch (error) {
    console.error('Error reading download counts:', error);
    return NextResponse.json({ error: 'Failed to read download counts' }, { status: 500 });
  }
}
