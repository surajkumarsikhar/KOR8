import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('[Contact Submission]', data);

    // In production, integrate with Resend, SendGrid, or Sanity.
    // For now, return a successful response.
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Contact API error:', err);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

