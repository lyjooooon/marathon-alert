import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { createServerClient } from '@/lib/supabase-server'

// 현재 유저의 특정 제품 리뷰 또는 전체 리뷰 조회
export async function GET(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json(null)

  const { searchParams } = new URL(req.url)
  const productId = searchParams.get('product_id')

  const db = getSupabaseAdmin()

  if (productId) {
    const { data } = await db
      .from('reviews')
      .select('id, rating, title, content, pros, cons, created_at')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .single()
    return NextResponse.json(data ?? null)
  }

  // 전체 내 리뷰 (마이페이지용)
  const { data } = await db
    .from('reviews')
    .select(`id, rating, title, content, like_count, created_at,
      products!reviews_product_id_fkey (id, name, brand, images)`)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return NextResponse.json(data ?? [])
}
