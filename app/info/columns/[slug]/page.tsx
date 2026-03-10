import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase'

function formatDate(d: string) {
  const date = new Date(d)
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
}

// 간단한 마크다운 → HTML 변환 (외부 라이브러리 없이)
function renderMarkdown(text: string): string {
  return text
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-black text-white mt-8 mb-4">$1</h1>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-white mt-6 mb-3">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-bold text-white/80 mt-4 mb-2">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
    .replace(/^- (.+)$/gm, '<li class="text-white/70 ml-4 list-disc">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="text-white/70 ml-4 list-decimal">$2</li>')
    .replace(/\n\n/g, '</p><p class="text-white/70 leading-relaxed mb-3">')
    .replace(/^(?!<[h|l])/gm, '')
}

export default async function ColumnDetailPage({ params }: { params: { slug: string } }) {
  const admin = getSupabaseAdmin()

  // 조회수 증가
  const { data: col } = await admin
    .from('columns')
    .select('*')
    .eq('slug', params.slug)
    .eq('published', true)
    .single()

  if (!col) notFound()

  // 조회수 비동기 업데이트 (응답 블로킹 없이)
  admin.from('columns').update({ view_count: (col.view_count ?? 0) + 1 }).eq('id', col.id)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* 브레드크럼 */}
      <div className="flex items-center gap-2 mb-6 text-sm">
        <Link href="/info" className="text-white/40 hover:text-white transition-colors">정보허브</Link>
        <span className="text-white/20">/</span>
        <Link href="/info/columns" className="text-white/40 hover:text-white transition-colors">전문가 칼럼</Link>
      </div>

      <article>
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 mb-3">
            {col.tags?.map((tag: string) => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/40">#{tag}</span>
            ))}
          </div>
          <h1 className="text-3xl font-black text-white mb-3">{col.title}</h1>
          <p className="text-white/40 text-sm">{formatDate(col.published_at)} · 조회 {col.view_count + 1}</p>
        </div>

        {col.excerpt && (
          <p className="text-white/60 text-base leading-relaxed mb-6 bg-[#1a1a1a] border border-white/5 rounded-xl px-5 py-4">
            {col.excerpt}
          </p>
        )}

        <div
          className="prose prose-invert max-w-none text-white/70 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: `<p class="text-white/70 leading-relaxed mb-3">${renderMarkdown(col.content)}</p>` }}
        />
      </article>

      <div className="mt-8 pt-6 border-t border-white/5">
        <Link href="/info/columns" className="text-[#FF4D00] text-sm hover:underline">← 칼럼 목록으로</Link>
      </div>
    </div>
  )
}
