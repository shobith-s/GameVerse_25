import { NextResponse } from 'next/server';
import { readSheet } from '@/lib/sheets';

export async function GET() {
  try {
    const rows = await readSheet('Teams!A1:O1');
    return NextResponse.json({ ok: true, header: rows[0] || [] });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}