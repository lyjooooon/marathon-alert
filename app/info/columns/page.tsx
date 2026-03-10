import Link from 'next/link'
import { getSupabase } from '@/lib/supabase'

interface Column {
  id: string
  title: string
  slug: string
  excerpt: string
  tags: string[]
  published_at: string
  view_count: number
}

function formatDate(d: string) {
  const date = new Date(d)
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
}

export default async function ColumnsPage() {
  const { data: columns } = await getSupabase()
    .from('columns')
    .select('id, title, slug, excerpt, tags, published_at, view_count')
    .eq('published', true)
    .order('published_at', { ascending: false })

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/info" className="text-white/40 hover:text-white text-sm transition-colors">정보허브</Link>
        <span className="text-white/20">/</span>
        <h1 className="text-xl font-black text-white">전문가 칼럼</h1>
      </div>

      {!columns?.length ? (
        <div className="text-center py-16 text-white/40">
          <p className="text-4xl mb-3">✍️</p>
          <p>아직 칼럼이 없습니다.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {columns.map((col: Column) => (
            <Link
              key={col.id}
              href={`/info/columns/${col.slug}`}
              className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all"
            >
              <h2 className="text-white font-bold text-lg mb-2 hover:text-[#FF4D00] transition-colors">{col.title}</h2>
              {col.excerpt && <p className="text-white/50 text-sm line-clamp-2 mb-3">{col.excerpt}</p>}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-white/30 text-xs">{formatDate(col.published_at)}</span>
                <span className="text-white/30 text-xs">조회 {col.view_count}</span>
                {col.tags?.map((tag: string) => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/40">#{tag}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
