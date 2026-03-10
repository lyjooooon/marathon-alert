'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

const CATEGORIES = ['훈련팁', '코스추천', '장비리뷰', '대회후기']

export default function NewInfoPostPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [authChecked, setAuthChecked] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user)
      setAuthChecked(true)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 입력해주세요.')
      return
    }
    setLoading(true)
    setError('')

    const res = await fetch('/api/info-posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, category }),
    })

    if (res.ok) {
      const data = await res.json()
      router.push(`/info/posts/${data.id}`)
    } else {
      const data = await res.json()
      setError(data.error ?? '오류가 발생했습니다.')
    }
    setLoading(false)
  }

  if (!authChecked) {
    return <div className="text-white/30 text-center py-20 text-sm">로딩 중...</div>
  }

  if (!isLoggedIn) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">🔒</p>
        <h2 className="text-white font-bold text-xl mb-2">로그인이 필요합니다</h2>
        <p className="text-white/40 text-sm mb-6">포스트 작성은 로그인 후 이용 가능합니다.</p>
        <Link href="/login?next=/info/posts/new" className="bg-[#FF4D00] hover:bg-[#e03d00] text-white font-semibold text-sm rounded-lg px-6 py-2.5 transition-colors">
          로그인하기
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/info/posts" className="text-white/40 hover:text-white text-sm transition-colors">← 목록으로</Link>
        <h1 className="text-xl font-black text-white">포스트 작성</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 space-y-5">
        {/* 카테고리 */}
        <div>
          <label className="block text-white/60 text-xs mb-2">카테고리</label>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  category === c ? 'bg-[#FF4D00] text-white' : 'bg-white/5 text-white/50 hover:text-white'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* 제목 */}
        <div>
          <label className="block text-white/60 text-xs mb-1.5">제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={100}
            placeholder="제목을 입력해주세요"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF4D00] transition-colors"
          />
        </div>

        {/* 내용 */}
        <div>
          <label className="block text-white/60 text-xs mb-1.5">내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={10}
            placeholder="러너들과 공유하고 싶은 내용을 자유롭게 작성해주세요"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF4D00] transition-colors resize-none"
          />
        </div>

        {error && <p className="text-red-400 text-xs bg-red-400/10 rounded-lg px-3 py-2">{error}</p>}

        <div className="flex gap-3 justify-end">
          <Link href="/info/posts" className="px-4 py-2 text-white/50 text-sm hover:text-white transition-colors">
            취소
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="bg-[#FF4D00] hover:bg-[#e03d00] disabled:opacity-50 text-white font-semibold text-sm rounded-lg px-6 py-2 transition-colors"
          >
            {loading ? '등록 중...' : '등록하기'}
          </button>
        </div>
      </form>
    </div>
  )
}
