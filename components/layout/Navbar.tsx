'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import type { User } from '@supabase/supabase-js'

const NAV_ITEMS = [
  { label: '대회센터', href: '/', icon: '🏃' },
  { label: '커뮤니티', href: '/community', icon: '👥' },
  { label: '정보허브', href: '/info', icon: '📚' },
  { label: '러닝스토어', href: '/store', icon: '👟' },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* 데스크탑 네비게이션 */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-[#0f0f0f]/95 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-7xl mx-auto w-full px-6 flex items-center h-14 gap-8">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2 mr-4 shrink-0">
            <span className="text-[#FF4D00] font-black text-lg tracking-tight">RUN</span>
            <span className="text-white font-black text-lg tracking-tight">IN ONE</span>
          </Link>

          {/* 메뉴 */}
          <div className="flex items-center gap-1 flex-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-[#FF4D00] bg-[#FF4D00]/10'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* 유저 영역 */}
          <div className="relative">
            {user ? (
              <>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-[#FF4D00] flex items-center justify-center text-white text-xs font-bold">
                    {user.email?.[0].toUpperCase()}
                  </div>
                  <span className="text-white/80 text-sm">{user.email?.split('@')[0]}</span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-40 bg-[#1a1a1a] border border-white/10 rounded-lg overflow-hidden shadow-xl">
                    <Link
                      href="/mypage"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 hover:text-white"
                    >
                      마이페이지
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2.5 text-sm text-white/60 hover:bg-white/5 hover:text-white border-t border-white/5"
                    >
                      로그아웃
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link
                href="/login"
                className="px-4 py-1.5 rounded-lg bg-[#FF4D00] text-white text-sm font-semibold hover:bg-[#e03d00] transition-colors"
              >
                로그인
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* 모바일 하단 탭 바 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0f0f0f]/95 backdrop-blur-sm border-t border-white/5">
        <div className="grid grid-cols-5 h-16">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
                isActive(item.href) ? 'text-[#FF4D00]' : 'text-white/40'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          ))}
          {/* 마이페이지 탭 */}
          <Link
            href={user ? '/mypage' : '/login'}
            className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
              pathname.startsWith('/mypage') || pathname === '/login' ? 'text-[#FF4D00]' : 'text-white/40'
            }`}
          >
            <span className="text-xl">👤</span>
            <span className="text-[10px] font-medium">{user ? '마이' : '로그인'}</span>
          </Link>
        </div>
      </nav>

      {/* 클릭 외부 닫기 */}
      {menuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
      )}
    </>
  )
}
