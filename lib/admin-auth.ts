import { createServerClient } from '@/lib/supabase-server'

export function isAdmin(email: string | undefined): boolean {
  if (!email) return false
  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return adminEmails.includes(email.toLowerCase())
}

export async function getAdminUser(): Promise<{ email: string } | null> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email || !isAdmin(user.email)) return null
  return { email: user.email }
}
