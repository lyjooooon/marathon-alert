'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Product = {
  id: string
  name: string
  brand: string
  category: string
  avg_rating: number
  review_count: number
  is_published: boolean
  release_year: number | null
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  async function fetchProducts() {
    const res = await fetch('/api/admin/products')
    if (res.ok) setProducts(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchProducts() }, [])

  async function handleTogglePublish(id: string, current: boolean) {
    await fetch(`/api/admin/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: !current }),
    })
    fetchProducts()
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`"${name}" 제품을 삭제하시겠습니까?`)) return
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    fetchProducts()
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-white">제품 관리</h1>
          <p className="text-white/40 text-xs mt-0.5">{products.length}개</p>
        </div>
        <Link href="/admin/products/new" className="bg-[#FF4D00] hover:bg-[#e03d00] text-white font-semibold text-sm rounded-lg px-4 py-2 transition-colors">
          + 새 제품
        </Link>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="제품명 또는 브랜드 검색"
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF4D00] transition-colors mb-4"
      />

      {loading ? (
        <div className="text-white/30 text-sm text-center py-12">불러오는 중...</div>
      ) : filtered.length === 0 ? (
        <div className="text-white/30 text-sm text-center py-12">제품이 없습니다.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <div key={p.id} className="bg-[#1a1a1a] border border-white/10 rounded-xl px-5 py-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${p.is_published ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-white/30'}`}>
                    {p.is_published ? '발행' : '미발행'}
                  </span>
                  <span className="text-white/20 text-xs">{p.brand}</span>
                  {p.release_year && <span className="text-white/20 text-xs">{p.release_year}</span>}
                </div>
                <p className="text-white font-semibold text-sm truncate">{p.name}</p>
                <p className="text-white/30 text-xs mt-0.5">★ {Number(p.avg_rating).toFixed(1)} · 리뷰 {p.review_count}개</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleTogglePublish(p.id, p.is_published)}
                  className="text-xs text-white/40 hover:text-white px-2 py-1 transition-colors"
                >
                  {p.is_published ? '비발행' : '발행'}
                </button>
                <Link href={`/admin/products/${p.id}`} className="text-xs text-white/40 hover:text-white px-2 py-1 transition-colors">수정</Link>
                <button onClick={() => handleDelete(p.id, p.name)} className="text-xs text-red-400/60 hover:text-red-400 px-2 py-1 transition-colors">삭제</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
