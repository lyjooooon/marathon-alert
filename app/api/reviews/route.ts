import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { createServerClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const db = getSupabaseAdmin()
  const { searchParams } = new URL(req.url)
  const productId = searchParams.get('product_id')
  const sort = searchParams.get('sort') ?? 'recent'
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = 10
  const offset = (page - 1) * limit

  let query = db
    .from('reviews')
    .select(`
      id, rating, title, content, pros, cons, like_count, created_at,
      profiles!reviews_user_id_fkey (username, avatar_url)
    `)

  if (productId) query = query.eq('product_id', productId)

  if (sort === 'helpful') query = query.order('like_count', { ascending: false })
  else if (sort === 'rating_high') query = query.order('rating', { ascending: false })
  else if (sort === 'rating_low') query = query.order('rating', { ascending: true })
  else query = query.order('created_at', { ascending: false })

  query = query.range(offset, offset + limit - 1)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })

  const body = await req.json()
  const { product_id, rating, title, content, pros, cons } = body

  if (!product_id || !rating || !content) {
    return NextResponse.json({ error: '필수 항목을 입력해주세요.' }, { status: 400 })
  }

  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('reviews')
    .insert({ user_id: user.id, product_id, rating, title, content, pros, cons })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: '이미 리뷰를 작성했습니다.' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data, { status: 201 })
}
