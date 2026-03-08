import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sendEmail } from '@/lib/notify/email'
import { sendKakaoMessage } from '@/lib/notify/kakao'
import { sendWebPush } from '@/lib/notify/webpush'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = new Date()

  // 접수 마감이 N일 후인 대회의 구독자에게 알림 발송
  const { data: subscriptions, error } = await getSupabaseAdmin()
    .from('subscriptions')
    .select('*, races(*)')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  let sent = 0

  for (const sub of subscriptions ?? []) {
    const race = sub.races as Record<string, string> | null
    if (!race?.registration_end) continue

    const endDate = new Date(race.registration_end)
    const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (daysLeft !== sub.notify_days_before) continue

    const message = `[마라톤 알림] "${race.title}" 접수 마감 ${daysLeft}일 전입니다!\n대회일: ${race.date}\n장소: ${race.location}`

    // 이메일 알림
    if (sub.email && process.env.GMAIL_APP_PASSWORD) {
      try {
        await sendEmail({
          to: sub.email,
          subject: `[마라톤 알림] ${race.title} 접수 마감 D-${daysLeft}`,
          html: `<p>${message.replace(/\n/g, '<br>')}</p><p><a href="${race.url}">대회 페이지 바로가기</a></p>`,
        })
        sent++
      } catch (e) {
        console.error('Email error:', e)
      }
    }

    // 카카오톡 알림
    if (sub.kakao_token) {
      try {
        await sendKakaoMessage({ accessToken: sub.kakao_token, message })
        sent++
      } catch (e) {
        console.error('Kakao error:', e)
      }
    }

    // 웹 푸시 알림
    if (sub.push_subscription) {
      try {
        await sendWebPush({
          subscription: sub.push_subscription,
          title: `마라톤 알림 D-${daysLeft}`,
          body: `${race.title} 접수 마감이 ${daysLeft}일 남았습니다.`,
          url: race.url,
        })
        sent++
      } catch (e) {
        console.error('WebPush error:', e)
      }
    }
  }

  return NextResponse.json({ message: 'Notifications sent', sent })
}
