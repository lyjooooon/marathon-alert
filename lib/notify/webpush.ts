import webpush from 'web-push'

webpush.setVapidDetails(
  'mailto:lyjooooon@gmail.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function sendWebPush({
  subscription,
  title,
  body,
  url,
}: {
  subscription: webpush.PushSubscription
  title: string
  body: string
  url?: string
}) {
  await webpush.sendNotification(
    subscription,
    JSON.stringify({ title, body, url })
  )
}
