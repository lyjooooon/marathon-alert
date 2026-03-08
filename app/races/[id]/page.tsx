'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Race {
  id: string
  title: string
  date: string
  location: string
  distances: string[]
  registration_start: string | null
  registration_end: string | null
  url: string
}

export default function RaceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [race, setRace] = useState<Race | null>(null)
  const [form, setForm] = useState({ email: '', notify_days_before: '3' })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    supabase
      .from('races')
      .select('*')
      .eq('id', params.id)
      .single()
      .then(({ data }) => setRace(data))
  }, [params.id])

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    let push_subscription = null

    // 웹 푸시 구독 시도
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const reg = await navigator.serviceWorker.ready
        const existing = await reg.pushManager.getSubscription()
        push_subscription = existing
          ? existing.toJSON()
          : (
              await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
              })
            ).toJSON()
      } catch {
        // 웹 푸시 권한 거부 시 이메일만
      }
    }

    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        race_id: race?.id,
        email: form.email,
        push_subscription,
        notify_days_before: Number(form.notify_days_before),
      }),
    })

    const data = await res.json()
    setSubmitting(false)

    if (res.ok) {
      setSuccess(true)
    } else {
      alert(data.error || '오류가 발생했습니다.')
    }
  }

  if (!race) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">불러오는 중...</div>
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white py-4 px-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => router.back()} className="text-blue-200 hover:text-white">
            ← 뒤로
          </button>
          <h1 className="font-bold text-lg">알림 신청</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* 대회 정보 */}
        <div className="bg-white rounded-xl p-5 shadow-sm mb-6">
          <h2 className="font-bold text-xl text-gray-900">{race.title}</h2>
          <div className="mt-3 space-y-1 text-sm text-gray-600">
            <p>📅 대회일: {race.date}</p>
            <p>📍 장소: {race.location}</p>
            {race.registration_start && <p>🗓 접수 시작: {race.registration_start}</p>}
            {race.registration_end && <p>⏰ 접수 마감: {race.registration_end}</p>}
          </div>
          <div className="flex flex-wrap gap-1 mt-3">
            {race.distances?.map((d) => (
              <span key={d} className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                {d}
              </span>
            ))}
          </div>
          <a
            href={race.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 text-sm text-blue-600 hover:underline"
          >
            공식 대회 페이지 →
          </a>
        </div>

        {/* 알림 신청 폼 */}
        {success ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <p className="text-2xl mb-2">✅</p>
            <p className="font-semibold text-green-800">알림 신청 완료!</p>
            <p className="text-sm text-green-600 mt-1">
              접수 마감 {form.notify_days_before}일 전에 이메일로 알려드릴게요.
            </p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 text-sm text-blue-600 hover:underline"
            >
              목록으로 돌아가기
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="bg-white rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-semibold text-gray-900">알림 받기</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이메일 *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="example@gmail.com"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                접수 마감 며칠 전에 알림 받을까요?
              </label>
              <select
                value={form.notify_days_before}
                onChange={(e) => setForm((f) => ({ ...f, notify_days_before: e.target.value }))}
                className="border rounded-lg px-3 py-2 text-sm w-full"
              >
                <option value="1">1일 전</option>
                <option value="3">3일 전</option>
                <option value="7">7일 전</option>
                <option value="14">2주 전</option>
              </select>
            </div>

            <p className="text-xs text-gray-400">
              웹 푸시 알림도 함께 신청됩니다 (브라우저 권한 허용 시).
            </p>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? '신청 중...' : '알림 신청하기'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
