import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')

  if (!code) {
    return new NextResponse('<script>window.close()</script>', {
      headers: { 'Content-Type': 'text/html' },
    })
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://marathon-alert.vercel.app'}/api/auth/kakao`

  try {
    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.KAKAO_REST_API_KEY!,
        redirect_uri: redirectUri,
        code,
      }),
    })

    const tokenData = await tokenRes.json()
    const accessToken = tokenData.access_token

    if (!accessToken) throw new Error('No access token')

    const html = `
      <html><body><script>
        window.opener && window.opener.postMessage({ kakaoToken: '${accessToken}' }, '*');
        window.close();
      </script></body></html>
    `
    return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } })
  } catch {
    const html = `
      <html><body><script>
        window.opener && window.opener.postMessage({ kakaoError: true }, '*');
        window.close();
      </script></body></html>
    `
    return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } })
  }
}
