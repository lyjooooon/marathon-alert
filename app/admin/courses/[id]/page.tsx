'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const inputCls = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF4D00] transition-colors'
const selectCls = inputCls + ' appearance-none'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-white/60 text-xs mb-1.5">{label}</label>
      {children}
    </div>
  )
}

export default function EditCoursePage({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [distanceKm, setDistanceKm] = useState('')
  const [difficulty, setDifficulty] = useState('easy')
  const [surface, setSurface] = useState('road')
  const [mapEmbedUrl, setMapEmbedUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/admin/courses/${id}`).then((r) => r.json()).then((data) => {
      setName(data.name ?? '')
      setLocation(data.location ?? '')
      setDescription(data.description ?? '')
      setDistanceKm(String(data.distance_km ?? ''))
      setDifficulty(data.difficulty ?? 'easy')
      setSurface(data.surface ?? 'road')
      setMapEmbedUrl(data.map_embed_url ?? '')
      setFetching(false)
    })
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch(`/api/admin/courses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name, location, description,
        distance_km: parseFloat(distanceKm),
        difficulty, surface,
        map_embed_url: mapEmbedUrl || null,
      }),
    })

    if (res.ok) {
      router.push('/admin/courses')
    } else {
      const data = await res.json()
      setError(data.error ?? '오류가 발생했습니다.')
    }
    setLoading(false)
  }

  if (fetching) return <div className="text-white/30 text-sm text-center py-12">불러오는 중...</div>

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/courses" className="text-white/40 hover:text-white text-sm transition-colors">← 목록</Link>
        <h1 className="text-xl font-black text-white">코스 수정</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 space-y-5">
        <Field label="코스명">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputCls} />
        </Field>
        <Field label="위치">
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} required className={inputCls} />
        </Field>
        <div className="grid grid-cols-3 gap-4">
          <Field label="거리 (km)">
            <input type="number" value={distanceKm} onChange={(e) => setDistanceKm(e.target.value)} required step="0.1" min="0" className={inputCls} />
          </Field>
          <Field label="난이도">
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className={selectCls}>
              <option value="easy">쉬움</option>
              <option value="moderate">보통</option>
              <option value="hard">어려움</option>
            </select>
          </Field>
          <Field label="노면">
            <select value={surface} onChange={(e) => setSurface(e.target.value)} className={selectCls}>
              <option value="road">도로</option>
              <option value="trail">트레일</option>
              <option value="track">트랙</option>
              <option value="mixed">혼합</option>
            </select>
          </Field>
        </div>
        <Field label="설명">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className={inputCls + ' resize-none'} />
        </Field>
        <Field label="지도 URL">
          <input type="url" value={mapEmbedUrl} onChange={(e) => setMapEmbedUrl(e.target.value)} className={inputCls} />
        </Field>

        {error && <p className="text-red-400 text-xs bg-red-400/10 rounded-lg px-3 py-2">{error}</p>}

        <div className="flex gap-3 justify-end">
          <Link href="/admin/courses" className="px-4 py-2 text-white/50 text-sm hover:text-white transition-colors">취소</Link>
          <button type="submit" disabled={loading} className="bg-[#FF4D00] hover:bg-[#e03d00] disabled:opacity-50 text-white font-semibold text-sm rounded-lg px-6 py-2 transition-colors">
            {loading ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>
    </div>
  )
}
