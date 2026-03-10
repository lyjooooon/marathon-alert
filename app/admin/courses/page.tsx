'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Course = {
  id: string
  name: string
  location: string
  distance_km: number
  difficulty: string
  surface: string
}

const DIFF_COLORS: Record<string, string> = { easy: '#22c55e', moderate: '#f59e0b', hard: '#ef4444' }
const DIFF_LABELS: Record<string, string> = { easy: '쉬움', moderate: '보통', hard: '어려움' }

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCourses = async () => {
    const res = await fetch('/api/admin/courses')
    if (res.ok) setCourses(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchCourses() }, [])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" 코스를 삭제하시겠습니까?`)) return
    await fetch(`/api/admin/courses/${id}`, { method: 'DELETE' })
    fetchCourses()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-white">코스 지도</h1>
          <p className="text-white/40 text-xs mt-0.5">{courses.length}개</p>
        </div>
        <Link href="/admin/courses/new" className="bg-[#FF4D00] hover:bg-[#e03d00] text-white font-semibold text-sm rounded-lg px-4 py-2 transition-colors">
          + 새 코스
        </Link>
      </div>

      {loading ? (
        <div className="text-white/30 text-sm text-center py-12">불러오는 중...</div>
      ) : (
        <div className="space-y-2">
          {courses.map((course) => (
            <div key={course.id} className="bg-[#1a1a1a] border border-white/10 rounded-xl px-5 py-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md" style={{ background: `${DIFF_COLORS[course.difficulty]}22`, color: DIFF_COLORS[course.difficulty] }}>
                    {DIFF_LABELS[course.difficulty] ?? course.difficulty}
                  </span>
                  <span className="text-white/30 text-xs">{course.surface}</span>
                </div>
                <p className="text-white font-semibold text-sm">{course.name}</p>
                <p className="text-white/30 text-xs mt-0.5">{course.location} · {course.distance_km}km</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link href={`/admin/courses/${course.id}`} className="text-xs text-white/40 hover:text-white px-2 py-1 transition-colors">수정</Link>
                <button onClick={() => handleDelete(course.id, course.name)} className="text-xs text-red-400/60 hover:text-red-400 px-2 py-1 transition-colors">삭제</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
