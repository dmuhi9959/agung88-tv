import { NextRequest, NextResponse } from 'next/server'
import { validateCredentials, createSession, SESSION_COOKIE, SESSION_MAX_AGE } from '@/lib/auth'
export async function POST(req: NextRequest) {
  const { username, password } = await req.json()
  if (!username || !password) return NextResponse.json({ success: false, error: 'Username dan password wajib' }, { status: 400 })
  if (!validateCredentials(username, password)) return NextResponse.json({ success: false, error: 'Username atau password salah' }, { status: 401 })
  const session = createSession(username)
  const response = NextResponse.json({ success: true, data: { username, message: 'Login berhasil' } })
  response.cookies.set({ name: SESSION_COOKIE, value: session.token, httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: SESSION_MAX_AGE, path: '/' })
  return response
}
