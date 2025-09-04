import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const downloadsFilePath = path.join(process.cwd(), 'app/data/downloads.json');

export async function POST(request: NextRequest) {
  try {
    const { illustrationId } = await request.json();
    console.log('Download API called for illustration ID:', illustrationId);
    
    if (!illustrationId) {
      console.log('Error: Illustration ID is required');
      return NextResponse.json({ error: 'Illustration ID is required' }, { status: 400 });
    }

    let downloadsData;
    try {
      const fileContent = fs.readFileSync(downloadsFilePath, 'utf-8');
      downloadsData = JSON.parse(fileContent);
      console.log('Current downloads data:', downloadsData);
    } catch (error) {
      console.log('Creating new downloads data file');
      downloadsData = { downloads: {} };
    }

    const currentCount = downloadsData.downloads[illustrationId] || 0;
    const newCount = currentCount + 1;
    downloadsData.downloads[illustrationId] = newCount;
    
    console.log(`Updating download count for ID ${illustrationId}: ${currentCount} → ${newCount}`);
    
    fs.writeFileSync(downloadsFilePath, JSON.stringify(downloadsData, null, 2), 'utf-8');
    console.log('Download count updated successfully');

    const response = NextResponse.json({
      success: true,
      illustrationId: illustrationId,
      newDownloadCount: newCount,
      previousCount: currentCount
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
    const fileContent = fs.readFileSync(downloadsFilePath, 'utf-8');
    const downloadsData = JSON.parse(fileContent);
    console.log('Returning download counts:', downloadsData.downloads);
    
    const response = NextResponse.json({ success: true, downloads: downloadsData.downloads });
    
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
