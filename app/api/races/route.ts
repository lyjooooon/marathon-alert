import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const distance = searchParams.get('distance')
  const location = searchParams.get('location')
  const status = searchParams.get('status')

  const today = new Date().toISOString().split('T')[0]

  let query = getSupabase().from('races').select('*')

  if (distance) query = query.contains('distances', [distance])
  if (location) query = query.ilike('location', `%${location}%`)

  if (status === '접수중') {
    query = query.lte('registration_start', today).gte('registration_end', today)
  } else if (status === '접수예정') {
    query = query.gt('registration_start', today)
  } else if (status === '접수마감') {
    query = query.lt('registration_end', today).gt('date', today)
  } else if (status === '대회종료') {
    query = query.lt('date', today)
  }

  const { data, error } = await query.order('date', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
