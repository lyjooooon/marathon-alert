'use client'

import { useState } from 'react'

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const SIZES = {
  sm: { star: 'text-sm', gap: 'gap-0.5' },
  md: { star: 'text-xl', gap: 'gap-1' },
  lg: { star: 'text-3xl', gap: 'gap-1' },
}

export default function StarRating({ value, onChange, readonly = false, size = 'md' }: StarRatingProps) {
  const [hover, setHover] = useState(0)
  const cls = SIZES[size]
  const display = hover || value

  function getStarFill(starIndex: number): 'full' | 'half' | 'empty' {
    const v = display
    if (v >= starIndex) return 'full'
    if (v >= starIndex - 0.5) return 'half'
    return 'empty'
  }

  function handleMouseMove(e: React.MouseEvent<HTMLSpanElement>, starIndex: number) {
    if (readonly) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    setHover(x < rect.width / 2 ? starIndex - 0.5 : starIndex)
  }

  function handleClick(e: React.MouseEvent<HTMLSpanElement>, starIndex: number) {
    if (readonly || !onChange) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const newVal = x < rect.width / 2 ? starIndex - 0.5 : starIndex
    onChange(newVal === value ? 0 : newVal)
  }

  return (
    <span
      className={`inline-flex items-center ${cls.gap} select-none`}
      onMouseLeave={() => !readonly && setHover(0)}
    >
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = getStarFill(i)
        return (
          <span
            key={i}
            className={`relative inline-block ${cls.star} ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
            onMouseMove={(e) => handleMouseMove(e, i)}
            onClick={(e) => handleClick(e, i)}
          >
            {/* 빈 별 (배경) */}
            <span className="text-white/20">★</span>
            {/* 채워진 별 (오버레이) */}
            {fill !== 'empty' && (
              <span
                className="absolute inset-0 overflow-hidden text-[#FF4D00]"
                style={{ width: fill === 'half' ? '50%' : '100%' }}
              >
                ★
              </span>
            )}
          </span>
        )
      })}
    </span>
  )
}
