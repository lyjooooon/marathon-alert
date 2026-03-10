'use client'

import { useState } from 'react'
import Link from 'next/link'

const inputCls = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF4D00] transition-colors placeholder:text-white/20'

export default function SuggestPage() {
  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [category, setCategory] = useState('shoes')
  const [note, setNote] = useState('')
  const [referenceUrl, setReferenceUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, brand, category, note: note || null, reference_url: referenceUrl || null }),
    })

    if (res.ok) {
      setSuccess(true)
    } else {
      const data = await res.json()
      if (res.status === 401) {
        setError('로그인이 필요합니다.')
      } else {
        setError(data.error ?? '오류가 발생했습니다.')
      }
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-4">✅</div>
        <h2 className="text-white font-black text-xl mb-2">제안이 접수됐어요!</h2>
        <p className="text-white/40 text-sm mb-6">관리자 검토 후 제품이 등록됩니다.</p>
        <Link href="/shoes" className="text-[#FF4D00] text-sm hover:underline">← 러닝화 목록으로</Link>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/shoes" className="text-white/40 hover:text-white text-sm transition-colors">← 뒤로</Link>
        <h1 className="text-xl font-black text-white">제품 제안</h1>
      </div>

      <p className="text-white/40 text-sm mb-6">등록을 원하는 러닝화나 용품을 알려주세요. 관리자가 검토 후 등록합니다.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-white/60 text-xs mb-1.5">브랜드 *</label>
            <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} required className={inputCls} placeholder="Nike" />
          </div>
          <div>
            <label className="block text-white/60 text-xs mb-1.5">카테고리</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
              <option value="shoes">러닝화</option>
              <option value="apparel">의류</option>
              <option value="watch">시계</option>
              <option value="accessory">액세서리</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-white/60 text-xs mb-1.5">제품명 *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputCls} placeholder="Vaporfly 3" />
        </div>

        <div>
          <label className="block text-white/60 text-xs mb-1.5">추가 메모 <span className="text-white/20">(선택)</span></label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className={inputCls + ' resize-none'} placeholder="색상, 사이즈 정보 등..." />
        </div>

        <div>
          <label className="block text-white/60 text-xs mb-1.5">참고 링크 <span className="text-white/20">(선택)</span></label>
          <input type="url" value={referenceUrl} onChange={(e) => setReferenceUrl(e.target.value)} className={inputCls} placeholder="https://..." />
        </div>

        {error && <p className="text-red-400 text-xs bg-red-400/10 rounded-lg px-3 py-2">{error}</p>}

        <button type="submit" disabled={loading} className="w-full bg-[#FF4D00] hover:bg-[#e03d00] disabled:opacity-50 text-white font-semibold rounded-xl py-3 text-sm transition-colors mt-2">
          {loading ? '제출 중...' : '제안 제출'}
        </button>
      </form>
    </div>
  )
}
