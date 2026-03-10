'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const inputCls = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF4D00] transition-colors'
const selectCls = inputCls

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-white/60 text-xs mb-1.5">
        {label}{hint && <span className="text-white/30 ml-1">{hint}</span>}
      </label>
      {children}
    </div>
  )
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [category, setCategory] = useState('shoes')
  const [description, setDescription] = useState('')
  const [releaseYear, setReleaseYear] = useState('')
  const [priceKrw, setPriceKrw] = useState('')
  const [weightG, setWeightG] = useState('')
  const [dropMm, setDropMm] = useState('')
  const [stackMm, setStackMm] = useState('')
  const [cushionType, setCushionType] = useState('')
  const [surface, setSurface] = useState('')
  const [isPublished, setIsPublished] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/products/${id}`).then((r) => r.json()).then((data) => {
      setName(data.name ?? '')
      setBrand(data.brand ?? '')
      setCategory(data.category ?? 'shoes')
      setDescription(data.description ?? '')
      setReleaseYear(data.release_year ? String(data.release_year) : '')
      setPriceKrw(data.price_krw ? String(data.price_krw) : '')
      setWeightG(data.weight_g ? String(data.weight_g) : '')
      setDropMm(data.drop_mm != null ? String(data.drop_mm) : '')
      setStackMm(data.stack_height_mm ? String(data.stack_height_mm) : '')
      setCushionType(data.cushion_type ?? '')
      setSurface(data.surface ?? '')
      setIsPublished(data.is_published ?? false)
      setFetching(false)
    })
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name, brand, category, description: description || null,
        release_year: releaseYear ? parseInt(releaseYear) : null,
        price_krw: priceKrw ? parseInt(priceKrw) : null,
        weight_g: weightG ? parseInt(weightG) : null,
        drop_mm: dropMm !== '' ? parseInt(dropMm) : null,
        stack_height_mm: stackMm ? parseInt(stackMm) : null,
        cushion_type: cushionType || null,
        surface: surface || null,
        is_published: isPublished,
      }),
    })

    if (res.ok) {
      router.push('/admin/products')
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
        <Link href="/admin/products" className="text-white/40 hover:text-white text-sm transition-colors">← 목록</Link>
        <h1 className="text-xl font-black text-white">제품 수정</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Field label="브랜드">
            <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} required className={inputCls} />
          </Field>
          <Field label="카테고리">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectCls}>
              <option value="shoes">러닝화</option>
              <option value="apparel">의류</option>
              <option value="watch">시계</option>
              <option value="accessory">액세서리</option>
            </select>
          </Field>
        </div>

        <Field label="제품명">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputCls} />
        </Field>

        <Field label="설명" hint="(선택)">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputCls + ' resize-none'} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="출시 연도">
            <input type="number" value={releaseYear} onChange={(e) => setReleaseYear(e.target.value)} className={inputCls} />
          </Field>
          <Field label="가격 (원)">
            <input type="number" value={priceKrw} onChange={(e) => setPriceKrw(e.target.value)} className={inputCls} />
          </Field>
        </div>

        {category === 'shoes' && (
          <>
            <div className="grid grid-cols-3 gap-4">
              <Field label="무게 (g)">
                <input type="number" value={weightG} onChange={(e) => setWeightG(e.target.value)} className={inputCls} />
              </Field>
              <Field label="드롭 (mm)">
                <input type="number" value={dropMm} onChange={(e) => setDropMm(e.target.value)} className={inputCls} />
              </Field>
              <Field label="스택 높이 (mm)">
                <input type="number" value={stackMm} onChange={(e) => setStackMm(e.target.value)} className={inputCls} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="쿠션 타입">
                <select value={cushionType} onChange={(e) => setCushionType(e.target.value)} className={selectCls}>
                  <option value="">선택 안함</option>
                  <option value="max">맥스쿠션</option>
                  <option value="moderate">미들쿠션</option>
                  <option value="minimal">미니멀</option>
                  <option value="racing">레이싱</option>
                </select>
              </Field>
              <Field label="서페이스">
                <select value={surface} onChange={(e) => setSurface(e.target.value)} className={selectCls}>
                  <option value="">선택 안함</option>
                  <option value="road">로드</option>
                  <option value="trail">트레일</option>
                  <option value="track">트랙</option>
                  <option value="mixed">혼합</option>
                </select>
              </Field>
            </div>
          </>
        )}

        <div className="flex items-center gap-2">
          <input type="checkbox" id="published" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="accent-[#FF4D00]" />
          <label htmlFor="published" className="text-white/60 text-sm">발행 상태</label>
        </div>

        {error && <p className="text-red-400 text-xs bg-red-400/10 rounded-lg px-3 py-2">{error}</p>}

        <div className="flex gap-3 justify-end">
          <Link href="/admin/products" className="px-4 py-2 text-white/50 text-sm hover:text-white transition-colors">취소</Link>
          <button type="submit" disabled={loading} className="bg-[#FF4D00] hover:bg-[#e03d00] disabled:opacity-50 text-white font-semibold text-sm rounded-lg px-6 py-2 transition-colors">
            {loading ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>
    </div>
  )
}
