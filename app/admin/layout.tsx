import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAdminUser } from '@/lib/admin-auth'

const NAV = [
  { href: '/admin', label: '대시보드', icon: '📊' },
  { href: '/admin/races', label: '대회 관리', icon: '🏃' },
  { href: '/admin/columns', label: '전문가 칼럼', icon: '✍️' },
  { href: '/admin/plans', label: '트레이닝 플랜', icon: '📋' },
  { href: '/admin/courses', label: '코스 지도', icon: '🗺️' },
  { href: '/admin/posts', label: '유저 포스트', icon: '💬' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminUser()

  if (!admin) {
    redirect('/login?next=/admin')
  }

  return (
    <div className="min-h-screen flex">
      {/* 사이드바 */}
      <aside className="w-56 shrink-0 bg-[#111] border-r border-white/10 fixed top-0 left-0 h-full z-40 flex flex-col pt-6">
        <div className="px-4 mb-6">
          <Link href="/" className="flex items-center gap-1">
            <span className="text-[#FF4D00] font-black text-lg">RUN</span>
            <span className="text-white font-black text-lg">IN ONE</span>
          </Link>
          <p className="text-white/30 text-xs mt-0.5">관리자</p>
        </div>
        <nav className="flex-1 px-2">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 text-sm transition-all mb-0.5"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-white/10">
          <p className="text-white/30 text-xs truncate">{admin.email}</p>
          <Link href="/" className="text-white/40 hover:text-white text-xs transition-colors mt-1 inline-block">← 사이트로</Link>
        </div>
      </aside>

      {/* 콘텐츠 */}
      <main className="flex-1 ml-56 min-h-screen bg-[#0f0f0f]">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
