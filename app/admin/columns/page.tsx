'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Column = {
  id: string
  title: string
  slug: string
  published: boolean
  published_at: string | null
  view_count: number
  tags: string[]
}

export default function AdminColumnsPage() {
  const [columns, setColumns] = useState<Column[]>([])
  const [loading, setLoading] = useState(true)

  const fetchColumns = async () => {
    const res = await fetch('/api/admin/columns')
    if (res.ok) setColumns(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchColumns() }, [])

  const togglePublish = async (col: Column) => {
    await fetch(`/api/admin/columns/${col.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !col.published }),
    })
    fetchColumns()
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" 칼럼을 삭제하시겠습니까?`)) return
    await fetch(`/api/admin/columns/${id}`, { method: 'DELETE' })
    fetchColumns()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-white">전문가 칼럼</h1>
          <p className="text-white/40 text-xs mt-0.5">{columns.length}개</p>
        </div>
        <Link href="/admin/columns/new" className="bg-[#FF4D00] hover:bg-[#e03d00] text-white font-semibold text-sm rounded-lg px-4 py-2 transition-colors">
          + 새 칼럼
        </Link>
      </div>

      {loading ? (
        <div className="text-white/30 text-sm text-center py-12">불러오는 중...</div>
      ) : columns.length === 0 ? (
        <div className="text-white/30 text-sm text-center py-12">칼럼이 없습니다.</div>
      ) : (
        <div className="space-y-2">
          {columns.map((col) => (
            <div key={col.id} className="bg-[#1a1a1a] border border-white/10 rounded-xl px-5 py-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">{col.title}</p>
                <p className="text-white/30 text-xs mt-0.5">/{col.slug} · 조회 {col.view_count}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => togglePublish(col)}
                  className={`text-xs font-semibold px-3 py-1 rounded-lg transition-colors ${
                    col.published
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      : 'bg-white/5 text-white/40 hover:bg-white/10'
                  }`}
                >
                  {col.published ? '발행됨' : '미발행'}
                </button>
                <Link href={`/admin/columns/${col.id}`} className="text-xs text-white/40 hover:text-white px-2 py-1 transition-colors">
                  수정
                </Link>
                <button onClick={() => handleDelete(col.id, col.title)} className="text-xs text-red-400/60 hover:text-red-400 px-2 py-1 transition-colors">
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
