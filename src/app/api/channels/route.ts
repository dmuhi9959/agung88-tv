import { NextRequest, NextResponse } from 'next/server'
import { getPublicClient, getAdminClient, channelFromDb } from '@/lib/supabase'
import { isAdmin } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function slugify(text: string): string { return text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '') }

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const limit = searchParams.get('limit')
    const client = getPublicClient()
    let query = client.from('channels').select('*').eq('published', true).order('name', { ascending: true })
    if (category && category !== 'all') query = query.eq('category', category)
    if (limit) query = query.limit(parseInt(limit, 10))
    const { data, error } = await query
    if (error) return NextResponse.json({ success: false, error: 'Gagal memuat daftar channel', detail: error.message }, { status: 500 })
    let channels = data || []
    if (search) { const lower = search.toLowerCase(); channels = channels.filter((c: any) => c.name?.toLowerCase().includes(lower) || c.category?.toLowerCase().includes(lower)) }
    channels.sort((a: any, b: any) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
    return NextResponse.json({ success: true, data: channels.map((c: any) => channelFromDb(c)) })
  } catch (error: any) { return NextResponse.json({ success: false, error: error?.message }, { status: 500 }) }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await isAdmin()
    if (!admin) return NextResponse.json({ success: false, error: 'Akses ditolak' }, { status: 403 })
    const body = await req.json()
    const { name, description, streamUrl, logoUrl, category, country, featured } = body
    if (!name || !streamUrl) return NextResponse.json({ success: false, error: 'Field wajib belum lengkap' }, { status: 400 })
    let slug = slugify(name)
    const client = getAdminClient()
    const { data: existing } = await client.from('channels').select('id').eq('slug', slug).limit(1)
    if (existing && existing.length > 0) slug = `${slug}-${uuidv4().slice(0, 6)}`
    const { data, error } = await client.from('channels').insert({ name: String(name), slug, description: description || '', stream_url: String(streamUrl), logo_url: logoUrl || '', category: category || 'general', country: country || 'id', featured: !!featured, published: true }).select().single()
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data: channelFromDb(data) })
  } catch (error: any) { return NextResponse.json({ success: false, error: error?.message }, { status: 500 }) }
}
