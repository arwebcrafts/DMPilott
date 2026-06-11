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

    const pngBuffer = await QRCode.toBuffer(url, {
      type: 'png',
      width: 512,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
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
