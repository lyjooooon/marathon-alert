import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { createServerClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const productId = searchParams.get('product_id')

  const db = getSupabaseAdmin()
  let query = db
    .from('user_collections')
    .select('id, product_id, status, note, created_at')
    .eq('user_id', user.id)

  if (productId) query = query.eq('product_id', productId)
  else query = query.order('created_at', { ascending: false })

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })

  const { product_id, status, note } = await req.json()
  if (!product_id || !status) return NextResponse.json({ error: '필수 항목 누락' }, { status: 400 })

  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('user_collections')
    .upsert({ user_id: user.id, product_id, status, note }, { onConflict: 'user_id,product_id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })

  const { product_id } = await req.json()
  const db = getSupabaseAdmin()
  const { error } = await db
    .from('user_collections')
    .delete()
    .eq('user_id', user.id)
    .eq('product_id', product_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
