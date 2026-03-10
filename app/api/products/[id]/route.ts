import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const db = getSupabaseAdmin()
  const { id } = params

  const { data: product, error } = await db
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('is_published', true)
    .single()

  if (error) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // 별점 분포
  const { data: ratingDist } = await db
    .from('reviews')
    .select('rating')
    .eq('product_id', id)

  const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  for (const r of ratingDist ?? []) {
    const rounded = Math.round(Number(r.rating))
    dist[rounded] = (dist[rounded] ?? 0) + 1
  }

  return NextResponse.json({ ...product, rating_distribution: dist })
}
