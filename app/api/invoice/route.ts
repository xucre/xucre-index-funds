import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
 
export async function GET(request: Request): Promise<NextResponse> {
    return NextResponse.json({});
}