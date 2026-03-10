import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const db = getSupabaseAdmin()
  const { searchParams } = new URL(req.url)

  const brand = searchParams.get('brand')
  const cushion = searchParams.get('cushion')
  const surface = searchParams.get('surface')
  const sort = searchParams.get('sort') ?? 'review_count'
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = 20
  const offset = (page - 1) * limit

  let query = db
    .from('products')
    .select('id, name, brand, category, images, release_year, price_krw, weight_g, drop_mm, stack_height_mm, cushion_type, surface, avg_rating, review_count, collection_count')
    .eq('is_published', true)

  if (brand) query = query.eq('brand', brand)
  if (cushion) query = query.eq('cushion_type', cushion)
  if (surface) query = query.eq('surface', surface)

  if (sort === 'rating') query = query.order('avg_rating', { ascending: false }).order('review_count', { ascending: false })
  else if (sort === 'new') query = query.order('release_year', { ascending: false }).order('created_at', { ascending: false })
  else query = query.order('review_count', { ascending: false }).order('avg_rating', { ascending: false })

  query = query.range(offset, offset + limit - 1)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
