import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
 
export async function GET(request: Request): Promise<NextResponse> {
  const country = request.headers.get('x-vercel-ip-country');
  
  try {
    if (country === 'US') {
      return NextResponse.json({templateId: process.env.NEXT_PUBLIC_DOCUSEAL_TEMPLATE_ID});
    } else if (country === 'MX') {
      return NextResponse.json({templateId: process.env.NEXT_PUBLIC_DOCUSEAL_TEMPLATE_ID});
    } else {
      return NextResponse.json({templateId: process.env.NEXT_PUBLIC_DOCUSEAL_TEMPLATE_ID});
    }
 
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }, // The webhook will retry 5 times waiting for a 200
    );
  }
}