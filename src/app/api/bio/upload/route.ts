import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUserPlan } from '@/lib/bio/planChecks'

const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUserPlan()
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const form = await req.formData()
    const file = form.get('file')
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPG, PNG, WebP, and GIF allowed' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File must be under 5 MB' }, { status: 400 })
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg'
    const path = `${auth.userId}/${Date.now()}.${safeExt}`

    const buffer = Buffer.from(await file.arrayBuffer())
    const service = createServiceClient()

    const { error: uploadError } = await service.storage
      .from('bio-assets')
      .upload(path, buffer, { contentType: file.type, upsert: false })

    if (uploadError) {
      console.error('[Bio Upload]', uploadError)
      return NextResponse.json(
        { error: 'Upload failed. Use an image URL instead, or ask admin to enable bio-assets storage.' },
        { status: 500 }
      )
    }

    const { data } = service.storage.from('bio-assets').getPublicUrl(path)
    return NextResponse.json({ url: data.publicUrl })
  } catch (error) {
    console.error('[Bio Upload]', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
