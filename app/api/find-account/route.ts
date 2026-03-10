import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { username } = await req.json()
  if (!username) return NextResponse.json({ error: 'Missing username' }, { status: 400 })

  const db = getSupabaseAdmin()

  // profiles 테이블에서 username으로 user_id 찾기
  const { data: profile, error } = await db
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single()

  if (error || !profile) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // auth.users에서 이메일 조회
  const { data: { user }, error: userError } = await db.auth.admin.getUserById(profile.id)

  if (userError || !user?.email) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ email: user.email })
}
