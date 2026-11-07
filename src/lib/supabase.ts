import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { config } from './config'

let publicClient: SupabaseClient | null = null
let adminClient: SupabaseClient | null = null

export function getPublicClient(): SupabaseClient {
  if (!publicClient) publicClient = createClient(config.url, config.anon, { auth: { persistSession: false } })
  return publicClient
}
export function getAdminClient(): SupabaseClient {
  if (!adminClient) adminClient = createClient(config.url, config.secret, { auth: { persistSession: false, autoRefreshToken: false } })
  return adminClient
}
export const STORAGE_BUCKET = config.bucket

export interface Channel {
  id: string; name: string; slug: string; description: string;
  streamUrl: string; logoUrl: string; category: string; country: string;
  featured: boolean; published: boolean; createdAt: string;
}
export function channelFromDb(row: any) {
  return { id: row.id, name: row.name, slug: row.slug, description: row.description || '',
    streamUrl: row.stream_url || '', logoUrl: row.logo_url || '', category: row.category || 'uncategorized',
    country: row.country || 'id', featured: !!row.featured, published: row.published !== false, createdAt: row.created_at }
}
