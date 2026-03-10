'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function CoachPage() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setIsLoggedIn(!!data.user))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return
    const userMsg: Message = { role: 'user', content: text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      })

      if (!res.ok || !res.body) throw new Error('응답 오류')

      // 스트리밍 텍스트 읽기
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let assistantText = ''
      setMessages(prev => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        // AI SDK 스트림 파싱 (text: prefix)
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('0:')) {
            try {
              const text = JSON.parse(line.slice(2))
              assistantText += text
              setMessages(prev => [
                ...prev.slice(0, -1),
                { role: 'assistant', content: assistantText },
              ])
            } catch {}
          }
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '죄송합니다, 오류가 발생했습니다. 다시 시도해주세요.' }])
    }
    setIsLoading(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  if (isLoggedIn === null) {
    return <div className="max-w-2xl mx-auto px-4 py-12 text-white/40 text-center">로딩 중...</div>
  }

  if (!isLoggedIn) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-5xl mb-4">🤖</p>
        <h2 className="text-white font-black text-xl mb-2">AI 코치</h2>
        <p className="text-white/40 text-sm mb-6">로그인 후 나만의 러닝 코치를 만나보세요</p>
        <Link href="/login?next=/info/coach" className="inline-block px-6 py-2.5 rounded-xl font-bold text-white text-sm" style={{ background: '#FF4D00' }}>
          로그인하기
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col" style={{ minHeight: 'calc(100vh - 120px)' }}>
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/info" className="text-white/40 hover:text-white text-sm transition-colors">정보허브</Link>
        <span className="text-white/20">/</span>
        <div className="flex items-center gap-2">
          <span className="text-xl">🤖</span>
          <h1 className="text-white font-black">AI 코치</h1>
          <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-[#FF4D00]/20 text-[#FF4D00]">Claude AI</span>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4" style={{ minHeight: '400px' }}>
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-white/20 text-sm mb-4">러닝에 관한 무엇이든 물어보세요</p>
            <div className="flex flex-col gap-2 max-w-xs mx-auto">
              {['하프마라톤 훈련 어떻게 시작하나요?', '페이스 조절 팁을 알려주세요', '부상 없이 달리려면?'].map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-xs px-3 py-2 rounded-xl text-left transition-colors"
                  style={{ background: '#1a1a1a', color: '#888', border: '1px solid #2a2a2a' }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-[#FF4D00]/20 flex items-center justify-center text-sm mr-2 shrink-0 mt-0.5">🤖</div>
            )}
            <div
              className="max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap"
              style={{
                background: m.role === 'user' ? '#FF4D00' : '#1a1a1a',
                color: m.role === 'user' ? '#fff' : '#ddd',
                border: m.role === 'assistant' ? '1px solid #2a2a2a' : 'none',
              }}
            >
              {m.content || <span className="text-white/30">...</span>}
            </div>
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full bg-[#FF4D00]/20 flex items-center justify-center text-sm mr-2 shrink-0">🤖</div>
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl px-4 py-3">
              <span className="text-white/40 text-sm">답변 작성 중...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="러닝에 관해 무엇이든 물어보세요..."
          className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FF4D00] transition-colors"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-4 py-3 rounded-xl font-bold text-white text-sm transition-colors disabled:opacity-40"
          style={{ background: '#FF4D00' }}
        >
          전송
        </button>
      </form>
    </div>
  )
}
