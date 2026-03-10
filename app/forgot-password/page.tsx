'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://marathon-alert.vercel.app/auth/callback?next=/auth/reset-password',
    })

    if (error) {
      setError('메일 발송 중 오류가 발생했습니다.')
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="text-5xl mb-4">✉️</div>
          <h2 className="text-white font-bold text-xl mb-2">메일을 확인해주세요</h2>
          <p className="text-white/50 text-sm mb-6">
            {email}로 비밀번호 재설정 링크를 보냈습니다.<br />링크를 클릭해 새 비밀번호를 설정하세요.
          </p>
          <Link href="/login" className="text-[#FF4D00] text-sm font-medium hover:underline">
            로그인으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-1">
            <span className="text-[#FF4D00] font-black text-2xl">RUN</span>
            <span className="text-white font-black text-2xl">IN ONE</span>
          </Link>
        </div>

        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6">
          <h1 className="text-white font-bold text-xl mb-2">비밀번호 찾기</h1>
          <p className="text-white/40 text-xs mb-6">가입한 이메일을 입력하면 재설정 링크를 보내드립니다.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white/60 text-xs mb-1.5">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF4D00] transition-colors"
                placeholder="example@email.com"
              />
            </div>

            {error && <p className="text-red-400 text-xs bg-red-400/10 rounded-lg px-3 py-2">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF4D00] hover:bg-[#e03d00] disabled:opacity-50 text-white font-semibold rounded-lg py-2.5 text-sm transition-colors"
            >
              {loading ? '발송 중...' : '재설정 링크 보내기'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link href="/login" className="text-white/40 text-xs hover:text-white transition-colors">
              ← 로그인으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
