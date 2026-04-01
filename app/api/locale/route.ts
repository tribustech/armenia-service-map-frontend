import { NextResponse } from 'next/server';

const ALLOWED_LOCALES = new Set(['en', 'hy']);

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const locale = typeof body?.locale === 'string' ? body.locale : '';

  if (!ALLOWED_LOCALES.has(locale)) {
    return NextResponse.json({ message: 'Invalid locale' }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set('locale', locale, {
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    sameSite: 'lax',
  });

  return response;
}
