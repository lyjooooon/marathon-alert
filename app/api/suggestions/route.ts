import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { createServerClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })

  const { name, brand, category, note, reference_url } = await req.json()
  if (!name || !brand) return NextResponse.json({ error: '제품명과 브랜드를 입력해주세요.' }, { status: 400 })

  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('product_suggestions')
    .insert({ user_id: user.id, name, brand, category: category ?? 'shoes', note, reference_url })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
