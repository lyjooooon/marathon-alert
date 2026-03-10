import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { getSupabaseAdmin } from '@/lib/supabase'

// PATCH /api/participations/[id] — 상태 변경
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { status, finish_time, notes } = await req.json()
  const admin = getSupabaseAdmin()

  const { data, error } = await admin
    .from('race_participations')
    .update({ status, finish_time, notes })
    .eq('id', params.id)
    .eq('user_id', user.id) // 본인 것만 수정
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE /api/participations/[id]
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = getSupabaseAdmin()
  const { error } = await admin
    .from('race_participations')
    .delete()
    .eq('id', params.id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
