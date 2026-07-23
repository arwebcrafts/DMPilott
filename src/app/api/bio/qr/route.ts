import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'
import { createServiceClient } from '@/lib/supabase/server'
import { getBioPageByUserId } from '@/lib/db/bioPages'
import { getAuthenticatedUserPlan } from '@/lib/bio/planChecks'

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUserPlan()
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const service = createServiceClient()
    const page = await getBioPageByUserId(auth.userId, service)
    if (!page) {
      return NextResponse.json({ error: 'Bio page not found' }, { status: 404 })
    }

    const host = req.headers.get('host') || 'localhost:3000'
    const protocol = host.includes('localhost') ? 'http' : 'https'
    const url = `${protocol}://${host}/${page.slug}`
    const username = page.slug
    const displayName = page.display_name || `@${page.slug}`

    const qrSvgInner = await QRCode.toString(url, {
      type: 'svg',
      margin: 0,
      width: 280,
      color: { dark: '#1a1a2e', light: '#ffffff' },
    })

    const qrContent = qrSvgInner.replace(/<svg[^>]*>/, '').replace('</svg>', '')

    const brandedSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="500" height="600" viewBox="0 0 500 600">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F58529"/>
      <stop offset="50%" stop-color="#DD2A7B"/>
      <stop offset="100%" stop-color="#8134AF"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.25"/>
    </filter>
  </defs>
  <rect width="500" height="600" rx="28" fill="url(#bg)"/>
  <rect x="60" y="50" width="380" height="380" rx="20" fill="#ffffff" filter="url(#shadow)"/>
  <g transform="translate(110, 100)">
    ${qrContent}
  </g>
  <text x="250" y="490" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="700">${displayName}</text>
  <text x="250" y="520" text-anchor="middle" fill="rgba(255,255,255,0.85)" font-family="system-ui, -apple-system, sans-serif" font-size="16">@${username}</text>
  <text x="250" y="560" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-family="system-ui, -apple-system, sans-serif" font-size="12" letter-spacing="2">DMPILOT</text>
</svg>`

    const format = req.nextUrl.searchParams.get('format')
    if (format === 'svg') {
      return new NextResponse(brandedSvg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Content-Disposition': `inline; filename="dmpilot-${page.slug}-qr.svg"`,
          'Cache-Control': 'no-store',
        },
      })
    }

    const pngBuffer = await QRCode.toBuffer(url, {
      type: 'png',
      width: 512,
      margin: 2,
      color: { dark: '#1a1a2e', light: '#ffffff' },
    })

    return new NextResponse(new Uint8Array(pngBuffer), {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="dmpilot-${page.slug}-qr.png"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('[Bio QR]', error)
    return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 })
  }
}
