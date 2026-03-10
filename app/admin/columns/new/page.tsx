'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export default function NewColumnPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [published, setPublished] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleTitleChange = (v: string) => {
    setTitle(v)
    if (!slug || slug === slugify(title)) setSlug(slugify(v))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/admin/columns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        slug,
        excerpt,
        content,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        published,
      }),
    })

    if (res.ok) {
      router.push('/admin/columns')
    } else {
      const data = await res.json()
      setError(data.error ?? '오류가 발생했습니다.')
    }
    setLoading(false)
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/columns" className="text-white/40 hover:text-white text-sm transition-colors">← 목록</Link>
        <h1 className="text-xl font-black text-white">새 칼럼</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 space-y-5">
        <Field label="제목">
          <input type="text" value={title} onChange={(e) => handleTitleChange(e.target.value)} required className={inputCls} placeholder="칼럼 제목" />
        </Field>

        <Field label="슬러그 (URL)">
          <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} required className={inputCls} placeholder="url-slug-here" />
        </Field>

        <Field label="한 줄 소개">
          <input type="text" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className={inputCls} placeholder="칼럼 요약 (목록에 표시)" />
        </Field>

        <Field label="태그 (쉼표 구분)">
          <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} className={inputCls} placeholder="훈련, 영양, 장비" />
        </Field>

        <Field label="본문">
          <textarea value={content} onChange={(e) => setContent(e.target.value)} required rows={14} className={inputCls + ' resize-y'} placeholder="칼럼 내용을 작성해주세요" />
        </Field>

        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setPublished(!published)}
            className={`w-10 h-6 rounded-full transition-colors ${published ? 'bg-[#FF4D00]' : 'bg-white/10'}`}>
            <div className={`w-4 h-4 bg-white rounded-full mx-1 transition-transform ${published ? 'translate-x-4' : 'translate-x-0'}`} />
          </button>
          <span className="text-white/60 text-sm">즉시 발행</span>
        </div>

        {error && <p className="text-red-400 text-xs bg-red-400/10 rounded-lg px-3 py-2">{error}</p>}

        <div className="flex gap-3 justify-end">
          <Link href="/admin/columns" className="px-4 py-2 text-white/50 text-sm hover:text-white transition-colors">취소</Link>
          <button type="submit" disabled={loading} className="bg-[#FF4D00] hover:bg-[#e03d00] disabled:opacity-50 text-white font-semibold text-sm rounded-lg px-6 py-2 transition-colors">
            {loading ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>
    </div>
  )
}

const inputCls = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF4D00] transition-colors'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-white/60 text-xs mb-1.5">{label}</label>
      {children}
    </div>
  )
}
