import { NextResponse } from 'next/server';
import sampleScanData from '@/data/sampleScan.json';

export async function GET() {
  return NextResponse.json(sampleScanData);
}
