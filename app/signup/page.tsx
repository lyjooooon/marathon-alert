'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

const NAVER_CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID

function naverOAuthUrl() {
  const state = Math.random().toString(36).slice(2)
  const redirectUri = 'https://marathon-alert.vercel.app/api/auth/naver'
  return `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`
}

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { preferred_username: username },
      },
    })

    if (error) {
      setError(error.message === 'User already registered'
        ? '이미 가입된 이메일입니다.'
        : '회원가입 중 오류가 발생했습니다.')
    } else {
      setDone(true)
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

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="text-5xl mb-4">✉️</div>
          <h2 className="text-white font-bold text-xl mb-2">이메일을 확인해주세요</h2>
          <p className="text-white/50 text-sm mb-6">
            {email}로 인증 메일을 보냈습니다.<br />링크를 클릭하면 가입이 완료됩니다.
          </p>
          <Link href="/login" className="text-[#FF4D00] text-sm font-medium hover:underline">
            로그인 페이지로
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
          <p className="text-white/40 text-sm mt-2">함께 달리는 러닝 커뮤니티</p>
        </div>

        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6">
          <h1 className="text-white font-bold text-xl mb-6">회원가입</h1>

          <div className="space-y-2 mb-5">
            <button
              onClick={handleKakao}
              className="w-full flex items-center justify-center gap-2 bg-[#FEE500] hover:bg-[#f0d800] text-[#191919] font-semibold rounded-lg py-2.5 text-sm transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 1.5C4.858 1.5 1.5 4.134 1.5 7.38c0 2.07 1.338 3.888 3.366 4.956l-.864 3.222a.225.225 0 0 0 .336.246L8.1 13.56c.294.03.594.048.9.048 4.142 0 7.5-2.634 7.5-5.88C16.5 4.134 13.142 1.5 9 1.5Z" fill="#191919"/></svg>
              카카오로 시작하기
            </button>
            <button
              onClick={handleNaver}
              className="w-full flex items-center justify-center gap-2 bg-[#03C75A] hover:bg-[#02b350] text-white font-semibold rounded-lg py-2.5 text-sm transition-colors"
            >
              <span className="font-black text-base leading-none">N</span>
              네이버로 시작하기
            </button>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs">또는 이메일로 가입</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-white/60 text-xs mb-1.5">닉네임</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF4D00] transition-colors"
                placeholder="러너명을 입력해주세요"
              />
            </div>
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
                placeholder="6자 이상"
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
              {loading ? '가입 중...' : '회원가입'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <span className="text-white/40 text-xs">이미 계정이 있으신가요? </span>
            <Link href="/login" className="text-[#FF4D00] text-xs font-medium hover:underline">
              로그인
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
