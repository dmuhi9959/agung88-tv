import { NextRequest, NextResponse } from 'next/server'
import { getPublicClient, getAdminClient, channelFromDb } from '@/lib/supabase'
import { isAdmin } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const client = getPublicClient()
  const { data, error } = await client.from('channels').select('*').eq('id', id).single()
  if (error || !data) return NextResponse.json({ success: false, error: 'Channel tidak ditemukan' }, { status: 404 })
  return NextResponse.json({ success: true, data: channelFromDb(data) })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await isAdmin()
  if (!admin) return NextResponse.json({ success: false, error: 'Akses ditolak' }, { status: 403 })
  const { id } = await params
  const client = getAdminClient()
  const { error } = await client.from('channels').delete().eq('id', id)
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, message: 'Channel dihapus' })
}
