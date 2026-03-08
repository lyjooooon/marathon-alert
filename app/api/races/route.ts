import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const distance = searchParams.get('distance')
  const location = searchParams.get('location')

  let query = supabase
    .from('races')
    .select('*')
    .order('date', { ascending: true })

  if (distance) {
    query = query.contains('distances', [distance])
  }
  if (location) {
    query = query.ilike('location', `%${location}%`)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
