import Link from 'next/link'
import { getSupabase } from '@/lib/supabase'

const DIFFICULTY_LABEL: Record<string, { label: string; color: string }> = {
  easy:     { label: '쉬움', color: '#22c55e' },
  moderate: { label: '보통', color: '#f59e0b' },
  hard:     { label: '어려움', color: '#ef4444' },
}

const SURFACE_LABEL: Record<string, string> = {
  road: '도로', trail: '트레일', track: '트랙', mixed: '혼합',
}

interface Course {
  id: string
  name: string
  location: string
  distance_km: number
  difficulty: string
  surface: string
  description: string
  map_embed_url: string
}

export default async function CoursesPage() {
  const { data: courses } = await getSupabase()
    .from('course_maps')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/info" className="text-white/40 hover:text-white text-sm transition-colors">정보허브</Link>
        <span className="text-white/20">/</span>
        <h1 className="text-xl font-black text-white">코스 지도</h1>
      </div>

      {!courses?.length ? (
        <div className="text-center py-16 text-white/40">
          <p className="text-4xl mb-3">🗺️</p>
          <p>아직 코스 정보가 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((course: Course) => {
            const diff = DIFFICULTY_LABEL[course.difficulty]
            return (
              <div key={course.id} className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden">
                {/* 지도 임베드 영역 */}
                <div className="h-32 bg-gradient-to-br from-green-900/40 to-teal-900/40 flex items-center justify-center">
                  {course.map_embed_url ? (
                    <a
                      href={course.map_embed_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/60 text-xs hover:text-white transition-colors flex items-center gap-1"
                    >
                      🗺️ 지도에서 보기
                    </a>
                  ) : (
                    <span className="text-white/20 text-xs">지도 준비 중</span>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {diff && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ background: `${diff.color}22`, color: diff.color }}>{diff.label}</span>
                    )}
                    <span className="text-xs px-2 py-0.5 rounded-lg bg-white/5 text-white/40">{SURFACE_LABEL[course.surface] ?? course.surface}</span>
                  </div>
                  <h2 className="text-white font-bold mb-1">{course.name}</h2>
                  <p className="text-[#FF4D00] text-sm font-semibold mb-2">
                    {course.distance_km}km · {course.location}
                  </p>
                  <p className="text-white/50 text-xs line-clamp-2">{course.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
