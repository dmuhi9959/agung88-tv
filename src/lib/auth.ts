import { cookies } from 'next/headers'
import { config } from './config'

export const ADMIN_USERNAME = config.adminUser
export const ADMIN_PASSWORD = config.adminPass
export const SESSION_COOKIE = 'biru_tv_session'
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7

export function validateCredentials(username: string, password: string): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD
}
export function createSession(username: string) {
  const token = Buffer.from(`${username}:${Date.now()}:${Math.random().toString(36).substring(2,12)}`).toString('base64url')
  return { token, expires: new Date(Date.now() + SESSION_MAX_AGE * 1000) }
}
export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE)
  if (!session?.value) return false
  try {
    const decoded = Buffer.from(session.value, 'base64url').toString('utf-8')
    const [username, timestampStr] = decoded.split(':')
    if (username !== ADMIN_USERNAME) return false
    const timestamp = parseInt(timestampStr, 10)
    if (isNaN(timestamp) || Date.now() - timestamp > SESSION_MAX_AGE * 1000) return false
    return true
  } catch { return false }
}
