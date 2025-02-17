import { NextResponse } from 'next/server';
import { listAgentConfigs, saveAgentConfig, updateAgentConfig } from '@/service/chat/db';

export async function GET() {
  const configs = await listAgentConfigs();
  return NextResponse.json(configs);
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }
  await saveAgentConfig(body);
  return NextResponse.json({ success: true });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { name, instructions, toolList, ...updates } = body;
  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }
  await updateAgentConfig(name, { instructions, toolList, ...updates });
  return NextResponse.json({ success: true });
}
