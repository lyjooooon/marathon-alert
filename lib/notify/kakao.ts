export async function sendKakaoMessage({
  accessToken,
  message,
}: {
  accessToken: string
  message: string
}) {
  const res = await fetch('https://kapi.kakao.com/v2/api/talk/memo/default/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      template_object: JSON.stringify({
        object_type: 'text',
        text: message,
        link: {
          web_url: 'https://marathon-alert.vercel.app',
          mobile_web_url: 'https://marathon-alert.vercel.app',
        },
      }),
    }),
  })

  if (!res.ok) {
    throw new Error(`Kakao API error: ${res.status}`)
  }
}
