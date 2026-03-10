import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin-auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const db = getSupabaseAdmin()
  const [columns, plans, courses, posts] = await Promise.all([
    db.from('columns').select('id', { count: 'exact', head: true }),
    db.from('training_plans').select('id', { count: 'exact', head: true }),
    db.from('course_maps').select('id', { count: 'exact', head: true }),
    db.from('info_posts').select('id', { count: 'exact', head: true }),
  ])

  return NextResponse.json({
    columns: columns.count ?? 0,
    plans: plans.count ?? 0,
    courses: courses.count ?? 0,
    posts: posts.count ?? 0,
  })
}
