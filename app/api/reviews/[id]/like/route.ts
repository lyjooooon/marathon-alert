import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { createServerClient } from '@/lib/supabase-server'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })

  const db = getSupabaseAdmin()
  const { data: existing } = await db
    .from('review_likes')
    .select('id')
    .eq('review_id', params.id)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    await db.from('review_likes').delete().eq('id', existing.id)
    return NextResponse.json({ liked: false })
  } else {
    await db.from('review_likes').insert({ review_id: params.id, user_id: user.id })
    return NextResponse.json({ liked: true })
  }
}
