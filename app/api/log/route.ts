import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Server-side console log - will appear in the terminal where Next.js is running
    console.log('========== S3 UPLOAD LOG ==========');
    console.log(`[${new Date().toISOString()}]`);
    
    if (data.success) {
      console.log('✅ Image upload successful');
      console.log('Key:', data.key);
      console.log('URL:', data.url);
    } else {
      console.log('❌ Error getting S3 URL');
      console.log('Key:', data.key);
      console.log('Error:', data.error);
    }
    
    console.log('===================================');
    
    return NextResponse.json({ logged: true });
  } catch (error) {
    console.error('Error in log API route:', error);
    return NextResponse.json({ logged: false }, { status: 500 });
  }
}
