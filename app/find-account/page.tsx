'use client'

import { useState } from 'react'
import Link from 'next/link'

function maskEmail(email: string) {
  const [local, domain] = email.split('@')
  const masked = local.slice(0, 2) + '****'
  return `${masked}@${domain}`
}

export default function FindAccountPage() {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    const res = await fetch('/api/find-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    })

    if (res.ok) {
      const data = await res.json()
      setResult(maskEmail(data.email))
    } else {
      setError('해당 닉네임으로 가입된 계정을 찾을 수 없습니다.')
    }
    setLoading(false)
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
          <h1 className="text-white font-bold text-xl mb-2">이메일(아이디) 찾기</h1>
          <p className="text-white/40 text-xs mb-6">가입 시 사용한 닉네임을 입력하면 이메일을 알려드립니다.</p>

          {result ? (
            <div className="text-center py-4">
              <p className="text-white/50 text-sm mb-2">가입된 이메일</p>
              <p className="text-white font-bold text-lg mb-6">{result}</p>
              <div className="space-y-2">
                <Link href="/login" className="block w-full bg-[#FF4D00] hover:bg-[#e03d00] text-white font-semibold rounded-lg py-2.5 text-sm text-center transition-colors">
                  로그인하기
                </Link>
                <Link href="/forgot-password" className="block w-full bg-white/5 hover:bg-white/10 text-white/60 font-semibold rounded-lg py-2.5 text-sm text-center transition-colors">
                  비밀번호 찾기
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white/60 text-xs mb-1.5">닉네임</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF4D00] transition-colors"
                  placeholder="가입 시 사용한 닉네임"
                />
              </div>

              {error && <p className="text-red-400 text-xs bg-red-400/10 rounded-lg px-3 py-2">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FF4D00] hover:bg-[#e03d00] disabled:opacity-50 text-white font-semibold rounded-lg py-2.5 text-sm transition-colors"
              >
                {loading ? '검색 중...' : '이메일 찾기'}
              </button>
            </form>
          )}

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
