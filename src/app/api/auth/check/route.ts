import { NextResponse } from 'next/server'
import { isAdmin, ADMIN_USERNAME } from '@/lib/auth'
export async function GET() {
  const admin = await isAdmin()
  return NextResponse.json({ success: true, data: { isAdmin: admin, username: admin ? ADMIN_USERNAME : null } })
}
