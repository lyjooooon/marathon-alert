'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Status = 'using' | 'used' | 'wishlist' | null

const BUTTONS = [
  { status: 'using' as const, label: '신고 있어요', icon: '🏃' },
  { status: 'used' as const, label: '신었어요', icon: '✅' },
  { status: 'wishlist' as const, label: '신고 싶어요', icon: '🌟' },
]

interface Props {
  productId: string
  initialStatus: Status
  isLoggedIn: boolean
}

export default function CollectionButton({ productId, initialStatus, isLoggedIn }: Props) {
  const [status, setStatus] = useState<Status>(initialStatus)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleClick(s: Status) {
    if (!isLoggedIn) {
      router.push('/login?next=' + encodeURIComponent(window.location.pathname))
      return
    }

    setLoading(true)
    if (status === s) {
      // 토글 해제
      await fetch('/api/collections', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId }),
      })
      setStatus(null)
    } else {
      // 추가 또는 변경
      await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, status: s }),
      })
      setStatus(s)
    }
    setLoading(false)
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {BUTTONS.map((btn) => (
        <button
          key={btn.status}
          onClick={() => handleClick(btn.status)}
          disabled={loading}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 border ${
            status === btn.status
              ? 'bg-[#FF4D00] border-[#FF4D00] text-white'
              : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20 hover:text-white'
          }`}
        >
          <span>{btn.icon}</span>
          <span>{btn.label}</span>
        </button>
      ))}
    </div>
  )
}
