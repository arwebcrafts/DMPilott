import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    secret: process.env.META_APP_SECRET,
    secretLength: process.env.META_APP_SECRET?.length,
    secretFirst4: process.env.META_APP_SECRET?.substring(0, 4),
    secretLast4: process.env.META_APP_SECRET?.slice(-4),
  })
}
