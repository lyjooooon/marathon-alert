'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Race {
  id: string
  title: string
  date: string
  location: string
  distances: string[]
  registration_end: string | null
  url: string
}

export default function Home() {
  const [races, setRaces] = useState<Race[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ distance: '', location: '' })

  useEffect(() => {
    fetchRaces()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  async function fetchRaces() {
    setLoading(true)
    const params = new URLSearchParams()
    if (filter.distance) params.set('distance', filter.distance)
    if (filter.location) params.set('location', filter.location)

    const res = await fetch(`/api/races?${params}`)
    const data = await res.json()
    setRaces(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  async function triggerCrawl() {
    const res = await fetch('/api/cron/crawl', {
      headers: { Authorization: 'Bearer marathon-cron-secret-2024' },
    })
    const data = await res.json()
    alert(data.message || data.error)
    fetchRaces()
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white py-6 px-4 shadow">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">🏃 마라톤 대회 알림</h1>
            <p className="text-blue-100 text-sm mt-1">국내 마라톤 대회 정보와 알림 서비스</p>
          </div>
          <button
            onClick={triggerCrawl}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50"
          >
            대회 정보 업데이트
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6 flex gap-3 flex-wrap">
          <select
            value={filter.distance}
            onChange={(e) => setFilter((f) => ({ ...f, distance: e.target.value }))}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">전체 거리</option>
            <option value="풀">풀코스 (42.195km)</option>
            <option value="하프">하프 (21km)</option>
            <option value="10">10km</option>
            <option value="5">5km</option>
          </select>
          <input
            type="text"
            placeholder="지역 검색 (예: 서울)"
            value={filter.location}
            onChange={(e) => setFilter((f) => ({ ...f, location: e.target.value }))}
            className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[150px]"
          />
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">불러오는 중...</div>
        ) : races.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🏃</p>
            <p>대회 정보가 없습니다.</p>
            <p className="text-sm mt-1">상단의 &quot;대회 정보 업데이트&quot; 버튼을 눌러주세요.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {races.map((race) => (
              <div key={race.id} className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h2 className="font-semibold text-lg text-gray-900">{race.title}</h2>
                    <div className="flex flex-wrap gap-2 mt-2 text-sm text-gray-600">
                      <span>📅 {race.date}</span>
                      <span>📍 {race.location}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {race.distances?.map((d) => (
                        <span key={d} className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                          {d}
                        </span>
                      ))}
                    </div>
                    {race.registration_end && (
                      <p className="text-xs text-red-500 mt-2">접수 마감: {race.registration_end}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <a
                      href={race.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      대회 페이지 →
                    </a>
                    <Link
                      href={`/races/${race.id}`}
                      className="bg-blue-600 text-white text-sm px-3 py-1.5 rounded-lg text-center hover:bg-blue-700"
                    >
                      알림 신청
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
