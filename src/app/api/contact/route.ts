import { NextResponse } from 'next/server';

export async function POST() {
  // Do not acknowledge delivery until a real mail provider is configured.
  return NextResponse.json(
    { error: 'Online enquiries are not connected yet. Please email business@kor8.in.' },
    { status: 503 },
  );
}

