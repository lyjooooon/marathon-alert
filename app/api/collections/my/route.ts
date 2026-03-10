import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { createServerClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json([])

  const db = getSupabaseAdmin()
  const { data } = await db
    .from('user_collections')
    .select(`id, product_id, status, created_at,
      products!user_collections_product_id_fkey (id, name, brand, images, avg_rating)`)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return NextResponse.json(data ?? [])
}
