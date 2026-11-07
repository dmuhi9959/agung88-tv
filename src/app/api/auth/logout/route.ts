import { NextResponse } from 'next/server'
import { SESSION_COOKIE } from '@/lib/auth'
export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logout berhasil' })
  response.cookies.set({ name: SESSION_COOKIE, value: '', httpOnly: true, sameSite: 'lax', maxAge: 0, path: '/' })
  return response
}
