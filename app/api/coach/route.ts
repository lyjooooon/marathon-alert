import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { RUNNING_COACH_SYSTEM_PROMPT, buildUserContext } from '@/lib/claude'

export async function POST(req: NextRequest) {
  // 인증 확인
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { messages } = await req.json()
  if (!messages?.length) {
    return new Response(JSON.stringify({ error: 'messages required' }), { status: 400 })
  }

  // 유저 프로필 조회 (컨텍스트 주입)
  const admin = getSupabaseAdmin()
  const { data: profile } = await admin
    .from('profiles')
    .select('running_level, pace_min_per_km, weekly_mileage_km')
    .eq('id', user.id)
    .single()

  const userContext = buildUserContext(profile ? {
    level: profile.running_level,
    pace: profile.pace_min_per_km,
    weeklyMileage: profile.weekly_mileage_km,
  } : null)

  const result = streamText({
    model: anthropic('claude-haiku-4-5-20251001'),
    system: RUNNING_COACH_SYSTEM_PROMPT + userContext,
    messages,
    maxOutputTokens: 1024,
  })

  return result.toUIMessageStreamResponse()
}
