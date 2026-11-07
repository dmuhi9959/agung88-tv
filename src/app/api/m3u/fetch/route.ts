import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

function parseM3U(content: string) {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l)
  const channels: any[] = []
  let current: any = {}
  for (const line of lines) {
    if (line.startsWith('#EXTINF:')) {
      const match = line.match(/#EXTINF:-1\s*(.*)/)
      if (match) {
        const meta = match[1]
        const logoMatch = meta.match(/tvg-logo="([^"]*)"/)
        const groupMatch = meta.match(/group-title="([^"]*)"/)
        const nameMatch = meta.match(/,(.+)$/)
        current.logoUrl = logoMatch ? logoMatch[1] : ''
        current.category = groupMatch ? groupMatch[1].toLowerCase().replace(/[^a-z0-9-]/g, '-') : 'general'
        current.name = nameMatch ? nameMatch[1].trim() : 'Unknown'
      }
    } else if (line.startsWith('http') || line.startsWith('rtmp') || line.startsWith('rtsp')) {
      current.streamUrl = line
      if (current.name && current.streamUrl) channels.push({ name: current.name, streamUrl: current.streamUrl, logoUrl: current.logoUrl || '', category: current.category || 'general', country: 'id' })
      current = {}
    }
  }
  return channels
}

function slugify(text: string): string { return text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '') }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    let content = ''
    if (body.content) { content = body.content }
    else if (body.m3uUrl) { const res = await fetch(body.m3uUrl, { signal: AbortSignal.timeout(30000) }); if (!res.ok) return NextResponse.json({ success: false, error: `Gagal fetch: HTTP ${res.status}` }, { status: 500 }); content = await res.text() }
    else { const country = body.country || 'id'; const res = await fetch(`https://iptv-org.github.io/iptv/countries/${country}.m3u`, { signal: AbortSignal.timeout(30000) }); if (!res.ok) return NextResponse.json({ success: false, error: `Gagal fetch: HTTP ${res.status}` }, { status: 500 }); content = await res.text() }
    
    const channels = parseM3U(content)
    if (channels.length === 0) return NextResponse.json({ success: false, error: 'Tidak ada channel ditemukan' }, { status: 400 })
    
    const client = getAdminClient()
    const { data: existing } = await client.from('channels').select('slug')
    const existingSlugs = new Set((existing || []).map((c: any) => c.slug))
    const newChannels = channels.filter(c => !existingSlugs.has(slugify(c.name)))
    const rows = newChannels.map(c => ({ name: c.name, slug: slugify(c.name), description: `Live TV: ${c.name}`, stream_url: c.streamUrl, logo_url: c.logoUrl, category: c.category, country: c.country, featured: false, published: true }))
    
    if (rows.length > 0) {
      for (let i = 0; i < rows.length; i += 50) {
        await client.from('channels').insert(rows.slice(i, i + 50) as any)
      }
    }
    return NextResponse.json({ success: true, data: { totalParsed: channels.length, newChannels: newChannels.length, inserted: rows.length }, message: `Berhasil import ${newChannels.length} channel baru` })
  } catch (error: any) { return NextResponse.json({ success: false, error: error?.message }, { status: 500 }) }
}
