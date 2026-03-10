'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    // 세션 확인 (비밀번호 재설정 링크 클릭 후 세션이 생성됨)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setSessionReady(true)
      } else {
        // 세션 없으면 forgot-password로 리다이렉트
        router.replace('/forgot-password')
      }
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }
    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.')
      return
    }
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError('비밀번호 변경 중 오류가 발생했습니다.')
    } else {
      setDone(true)
    }
    setLoading(false)
  }

  if (!sessionReady) {
    return <div className="min-h-screen flex items-center justify-center text-white/30 text-sm">로딩 중...</div>
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-white font-bold text-xl mb-2">비밀번호가 변경됐습니다</h2>
          <p className="text-white/50 text-sm mb-6">새 비밀번호로 로그인해주세요.</p>
          <Link href="/login" className="bg-[#FF4D00] hover:bg-[#e03d00] text-white font-semibold text-sm rounded-lg px-6 py-2.5 transition-colors inline-block">
            로그인하기
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
          <h1 className="text-white font-bold text-xl mb-6">새 비밀번호 설정</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white/60 text-xs mb-1.5">새 비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF4D00] transition-colors"
                placeholder="6자 이상"
              />
            </div>
            <div>
              <label className="block text-white/60 text-xs mb-1.5">비밀번호 확인</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF4D00] transition-colors"
                placeholder="동일한 비밀번호 입력"
              />
            </div>

            {error && <p className="text-red-400 text-xs bg-red-400/10 rounded-lg px-3 py-2">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF4D00] hover:bg-[#e03d00] disabled:opacity-50 text-white font-semibold rounded-lg py-2.5 text-sm transition-colors"
            >
              {loading ? '변경 중...' : '비밀번호 변경'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
