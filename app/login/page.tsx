'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

const NAVER_CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID

function naverOAuthUrl() {
  const state = Math.random().toString(36).slice(2)
  const redirectUri = 'https://marathon-alert.vercel.app/api/auth/naver'
  return `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.')
    } else {
      router.push(next)
      router.refresh()
    }
    setLoading(false)
  }

  const handleKakao = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: { redirectTo: 'https://marathon-alert.vercel.app/auth/callback' },
    })
  }

  const handleNaver = () => {
    if (!NAVER_CLIENT_ID) {
      alert('네이버 로그인이 아직 설정되지 않았습니다.')
      return
    }
    window.location.href = naverOAuthUrl()
  }

  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6">
      <h1 className="text-white font-bold text-xl mb-6">로그인</h1>

      <div className="space-y-2 mb-5">
        <button
          onClick={handleKakao}
          className="w-full flex items-center justify-center gap-2 bg-[#FEE500] hover:bg-[#f0d800] text-[#191919] font-semibold rounded-lg py-2.5 text-sm transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 1.5C4.858 1.5 1.5 4.134 1.5 7.38c0 2.07 1.338 3.888 3.366 4.956l-.864 3.222a.225.225 0 0 0 .336.246L8.1 13.56c.294.03.594.048.9.048 4.142 0 7.5-2.634 7.5-5.88C16.5 4.134 13.142 1.5 9 1.5Z" fill="#191919"/></svg>
          카카오로 계속하기
        </button>
        <button
          onClick={handleNaver}
          className="w-full flex items-center justify-center gap-2 bg-[#03C75A] hover:bg-[#02b350] text-white font-semibold rounded-lg py-2.5 text-sm transition-colors"
        >
          <span className="font-black text-base leading-none">N</span>
          네이버로 계속하기
        </button>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-white/30 text-xs">또는</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
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
        <div>
          <label className="block text-white/60 text-xs mb-1.5">비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF4D00] transition-colors"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="text-red-400 text-xs bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#FF4D00] hover:bg-[#e03d00] disabled:opacity-50 text-white font-semibold rounded-lg py-2.5 text-sm transition-colors"
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <div className="mt-4 flex items-center justify-center gap-4">
        <Link href="/find-account" className="text-white/40 text-xs hover:text-white/70 transition-colors">
          이메일 찾기
        </Link>
        <span className="text-white/20 text-xs">|</span>
        <Link href="/forgot-password" className="text-white/40 text-xs hover:text-white/70 transition-colors">
          비밀번호 찾기
        </Link>
        <span className="text-white/20 text-xs">|</span>
        <Link href="/signup" className="text-[#FF4D00] text-xs font-medium hover:underline">
          회원가입
        </Link>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-1">
            <span className="text-[#FF4D00] font-black text-2xl">RUN</span>
            <span className="text-white font-black text-2xl">IN ONE</span>
          </Link>
          <p className="text-white/40 text-sm mt-2">달리는 사람들의 모든 것</p>
        </div>

        <Suspense fallback={<div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 text-white/40 text-center">로딩 중...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
