import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

// POST: 추천 토글 (있으면 삭제, 없으면 추가)
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // 기존 좋아요 확인
  const { data: existing } = await supabase
    .from('info_post_likes')
    .select('id')
    .eq('post_id', id)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    // 취소
    await supabase.from('info_post_likes').delete().eq('id', existing.id)
    return NextResponse.json({ liked: false })
  } else {
    // 추가
    await supabase.from('info_post_likes').insert({ post_id: id, user_id: user.id })
    return NextResponse.json({ liked: true })
  }
}

// GET: 내가 이 포스트를 추천했는지 확인
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ liked: false })

  const { data } = await supabase
    .from('info_post_likes')
    .select('id')
    .eq('post_id', id)
    .eq('user_id', user.id)
    .single()

  return NextResponse.json({ liked: !!data })
}
