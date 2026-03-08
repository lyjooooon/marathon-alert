import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { race_id, email, kakao_token, push_subscription, notify_days_before = 3 } = body

  if (!race_id || !email) {
    return NextResponse.json({ error: '대회 ID와 이메일은 필수입니다.' }, { status: 400 })
  }

  const { error } = await getSupabaseAdmin().from('subscriptions').upsert(
    {
      race_id,
      email,
      kakao_token: kakao_token || null,
      push_subscription: push_subscription || null,
      notify_days_before,
    },
    { onConflict: 'race_id,email' }
  )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: '알림 신청이 완료됐습니다.' })
}
