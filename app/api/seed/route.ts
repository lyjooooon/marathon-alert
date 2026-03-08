import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

const sampleRaces = [
  {
    title: '2026 서울국제마라톤 (동아마라톤)',
    date: '2026-03-15',
    location: '서울 광화문',
    distances: ['풀코스', '하프', '10km'],
    registration_start: '2025-12-01',
    registration_end: '2026-02-28',
    url: 'https://www.seoul-marathon.com',
    source: 'sample',
  },
  {
    title: '2026 경주벚꽃마라톤',
    date: '2026-04-05',
    location: '경북 경주시',
    distances: ['풀코스', '하프', '10km', '5km'],
    registration_start: '2026-01-10',
    registration_end: '2026-03-20',
    url: 'https://www.gjmarathon.com',
    source: 'sample',
  },
  {
    title: '2026 춘천마라톤',
    date: '2026-10-25',
    location: '강원 춘천시',
    distances: ['풀코스', '하프'],
    registration_start: '2026-06-01',
    registration_end: '2026-09-30',
    url: 'https://www.chuncheonmarathon.com',
    source: 'sample',
  },
  {
    title: '2026 JTBC 서울마라톤',
    date: '2026-11-08',
    location: '서울 잠실',
    distances: ['풀코스', '하프', '10km'],
    registration_start: '2026-05-01',
    registration_end: '2026-10-10',
    url: 'https://www.jtbcmarathon.com',
    source: 'sample',
  },
  {
    title: '2026 제주국제마라톤',
    date: '2026-06-07',
    location: '제주특별자치도',
    distances: ['풀코스', '하프', '10km', '5km'],
    registration_start: '2026-02-01',
    registration_end: '2026-05-15',
    url: 'https://www.jejumarathon.com',
    source: 'sample',
  },
  {
    title: '2026 대구국제마라톤',
    date: '2026-04-19',
    location: '대구광역시',
    distances: ['풀코스', '하프', '10km'],
    registration_start: '2026-01-15',
    registration_end: '2026-03-31',
    url: 'https://www.daegumarathon.com',
    source: 'sample',
  },
]

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await getSupabaseAdmin()
    .from('races')
    .upsert(sampleRaces, { onConflict: 'title,date' })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: '샘플 데이터 추가 완료', count: sampleRaces.length })
}
