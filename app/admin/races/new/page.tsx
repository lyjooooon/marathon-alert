'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const inputCls = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF4D00] transition-colors'

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-white/60 text-xs mb-1.5">{label}{hint && <span className="text-white/30 ml-1">{hint}</span>}</label>
      {children}
    </div>
  )
}

export default function NewRacePage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [location, setLocation] = useState('')
  const [distances, setDistances] = useState('')
  const [regStart, setRegStart] = useState('')
  const [regEnd, setRegEnd] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/admin/races', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        date,
        location,
        distances: distances.split(',').map((d) => d.trim()).filter(Boolean),
        registration_start: regStart || null,
        registration_end: regEnd || null,
        url: url || null,
        source: 'manual',
      }),
    })

    if (res.ok) {
      router.push('/admin/races')
    } else {
      const data = await res.json()
      setError(data.error ?? '오류가 발생했습니다.')
    }
    setLoading(false)
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/races" className="text-white/40 hover:text-white text-sm transition-colors">← 목록</Link>
        <h1 className="text-xl font-black text-white">새 대회 등록</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 space-y-5">
        <Field label="대회명">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className={inputCls} placeholder="서울 국제 마라톤" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="대회일">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className={inputCls} />
          </Field>
          <Field label="지역">
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} required className={inputCls} placeholder="서울시 중구" />
          </Field>
        </div>

        <Field label="거리" hint="(쉼표 구분)">
          <input type="text" value={distances} onChange={(e) => setDistances(e.target.value)} className={inputCls} placeholder="풀코스, 하프, 10km" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="접수 시작일">
            <input type="date" value={regStart} onChange={(e) => setRegStart(e.target.value)} className={inputCls} />
          </Field>
          <Field label="접수 마감일">
            <input type="date" value={regEnd} onChange={(e) => setRegEnd(e.target.value)} className={inputCls} />
          </Field>
        </div>

        <Field label="공식 URL">
          <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} className={inputCls} placeholder="https://..." />
        </Field>

        {error && <p className="text-red-400 text-xs bg-red-400/10 rounded-lg px-3 py-2">{error}</p>}

        <div className="flex gap-3 justify-end">
          <Link href="/admin/races" className="px-4 py-2 text-white/50 text-sm hover:text-white transition-colors">취소</Link>
          <button type="submit" disabled={loading} className="bg-[#FF4D00] hover:bg-[#e03d00] disabled:opacity-50 text-white font-semibold text-sm rounded-lg px-6 py-2 transition-colors">
            {loading ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>
    </div>
  )
}
