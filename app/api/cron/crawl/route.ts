import { NextRequest, NextResponse } from 'next/server'
import { crawlMarathonOnline } from '@/lib/crawler/marathon-online'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const races = await crawlMarathonOnline()

    if (races.length === 0) {
      return NextResponse.json({ message: 'No races found', count: 0 })
    }

    const { error } = await supabaseAdmin.from('races').upsert(
      races.map((r) => ({
        title: r.title,
        date: r.date,
        location: r.location,
        distances: r.distances,
        registration_start: r.registration_start,
        registration_end: r.registration_end,
        url: r.url,
        source: r.source,
      })),
      { onConflict: 'title,date' }
    )

    if (error) throw error

    return NextResponse.json({ message: 'Crawl complete', count: races.length })
  } catch (err) {
    console.error('[cron/crawl]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
