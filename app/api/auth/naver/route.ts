import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(`${origin}/login?error=naver_failed`)
  }

  const clientId = process.env.NAVER_CLIENT_ID
  const clientSecret = process.env.NAVER_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${origin}/login?error=naver_not_configured`)
  }

  try {
    // 1. 액세스 토큰 교환
    const tokenRes = await fetch('https://nid.naver.com/oauth2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code,
        state: searchParams.get('state') ?? '',
      }),
    })
    const tokenData = await tokenRes.json()
    const accessToken = tokenData.access_token
    if (!accessToken) throw new Error('No access token')

    // 2. 프로필 조회
    const profileRes = await fetch('https://openapi.naver.com/v1/nid/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    const profileData = await profileRes.json()
    const naverUser = profileData.response

    if (!naverUser?.email) throw new Error('No email from Naver')

    const email: string = naverUser.email
    const nickname: string = naverUser.nickname ?? naverUser.name ?? email.split('@')[0]

    const db = getSupabaseAdmin()

    // 3. 기존 유저 확인
    const { data: { users } } = await db.auth.admin.listUsers()
    const existing = users.find((u) => u.email === email)

    if (!existing) {
      // 4. 신규 유저 생성
      await db.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { preferred_username: nickname, provider: 'naver' },
      })
    }

    // 5. 매직링크 생성 → 자동 로그인
    const { data: linkData, error: linkError } = await db.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo: `${origin}/` },
    })

    if (linkError || !linkData.properties?.action_link) throw new Error('Failed to generate link')

    return NextResponse.redirect(linkData.properties.action_link)
  } catch {
    return NextResponse.redirect(`${origin}/login?error=naver_failed`)
  }
}
