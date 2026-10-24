import { NextRequest, NextResponse } from 'next/server';
import { lookupParentRequestStatus } from '@/lib/db/storage';
import { checkRateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'anonymous';
    const rateLimit = checkRateLimit(`parent_status_${ip}`, 30, 60 * 1000);
    if (!rateLimit.isAllowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment.' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const ref = searchParams.get('ref') || '';
    const phone = searchParams.get('phone') || undefined;

    if (!ref.trim()) {
      return NextResponse.json(
        { error: 'Reference number is required' },
        { status: 400 }
      );
    }

    const result = await lookupParentRequestStatus(ref, phone);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json({ success: true, request: result.request });
  } catch (error) {
    console.error('Parent status lookup error:', error);
    return NextResponse.json(
      { error: 'Failed to process request status lookup' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'anonymous';
    const rateLimit = checkRateLimit(`parent_status_${ip}`, 30, 60 * 1000);
    if (!rateLimit.isAllowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment.' },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const ref = (body.reference_number || body.ref || '').toString();
    const phone = body.phone ? body.phone.toString() : undefined;

    if (!ref.trim()) {
      return NextResponse.json(
        { error: 'Reference number is required' },
        { status: 400 }
      );
    }

    const result = await lookupParentRequestStatus(ref, phone);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json({ success: true, request: result.request });
  } catch (error) {
    console.error('Parent status lookup error:', error);
    return NextResponse.json(
      { error: 'Failed to process request status lookup' },
      { status: 500 }
    );
  }
}
