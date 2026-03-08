import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

const sampleRaces = [
  {
    title: '2026 서울국제마라톤 (동아마라톤)',
    date: '2026-03-15',
    location: '서울 광화문~잠실',
    distances: ['풀코스', '하프', '10km'],
    registration_start: '2025-12-01',
    registration_end: '2026-02-15',
    url: 'https://www.donga-marathon.com',
    source: 'sample',
  },
  {
    title: '2026 경주벚꽃마라톤',
    date: '2026-04-05',
    location: '경북 경주시 보문단지',
    distances: ['풀코스', '하프', '10km', '5km'],
    registration_start: '2026-01-10',
    registration_end: '2026-03-15',
    url: 'https://www.gyeongjumarathon.com',
    source: 'sample',
  },
  {
    title: '2026 춘천마라톤',
    date: '2026-10-25',
    location: '강원 춘천시 의암호',
    distances: ['풀코스', '하프'],
    registration_start: '2026-06-01',
    registration_end: '2026-09-20',
    url: 'https://www.chuncheonmarathon.com',
    source: 'sample',
  },
  {
    title: '2026 JTBC 마라톤',
    date: '2026-11-08',
    location: '서울 잠실올림픽공원',
    distances: ['풀코스', '하프', '10km'],
    registration_start: '2026-05-01',
    registration_end: '2026-10-01',
    url: 'https://www.jtbcmarathon.com',
    source: 'sample',
  },
  {
    title: '2026 제주국제마라톤',
    date: '2026-06-07',
    location: '제주특별자치도 서귀포시',
    distances: ['풀코스', '하프', '10km', '5km'],
    registration_start: '2026-02-01',
    registration_end: '2026-05-10',
    url: 'https://www.jejumarathon.com',
    source: 'sample',
  },
  {
    title: '2026 대구국제마라톤',
    date: '2026-04-19',
    location: '대구광역시 두류공원',
    distances: ['풀코스', '하프', '10km'],
    registration_start: '2026-01-15',
    registration_end: '2026-03-25',
    url: 'https://www.daegumarathon.com',
    source: 'sample',
  },
  {
    title: '2026 부산국제마라톤',
    date: '2026-04-12',
    location: '부산광역시 해운대',
    distances: ['풀코스', '하프', '10km'],
    registration_start: '2026-01-05',
    registration_end: '2026-03-20',
    url: 'https://www.busanmarathon.com',
    source: 'sample',
  },
  {
    title: '2026 인천송도국제마라톤',
    date: '2026-09-27',
    location: '인천 연수구 센트럴파크',
    distances: ['풀코스', '하프', '10km', '5km'],
    registration_start: '2026-06-01',
    registration_end: '2026-09-10',
    url: 'https://www.incheonmarathon.com',
    source: 'sample',
  },
  {
    title: '2026 광주조선일보마라톤',
    date: '2026-05-03',
    location: '광주광역시 상무시민공원',
    distances: ['풀코스', '하프', '10km'],
    registration_start: '2026-02-01',
    registration_end: '2026-04-15',
    url: 'https://www.gjmarathon.co.kr',
    source: 'sample',
  },
  {
    title: '2026 수원화성국제마라톤',
    date: '2026-04-26',
    location: '경기 수원시 화성행궁',
    distances: ['풀코스', '하프', '10km', '5km'],
    registration_start: '2026-01-20',
    registration_end: '2026-04-05',
    url: 'https://www.suwonmarathon.com',
    source: 'sample',
  },
  {
    title: '2026 전주마라톤',
    date: '2026-05-17',
    location: '전북 전주시 덕진공원',
    distances: ['풀코스', '하프', '10km', '5km'],
    registration_start: '2026-02-15',
    registration_end: '2026-04-30',
    url: 'https://www.jeonjumarathon.com',
    source: 'sample',
  },
  {
    title: '2026 울산마라톤',
    date: '2026-05-10',
    location: '울산광역시 태화강 국가정원',
    distances: ['풀코스', '하프', '10km'],
    registration_start: '2026-02-10',
    registration_end: '2026-04-20',
    url: 'https://www.ulsanmarathon.com',
    source: 'sample',
  },
  {
    title: '2026 창원마라톤',
    date: '2026-03-29',
    location: '경남 창원시 창원광장',
    distances: ['풀코스', '하프', '10km'],
    registration_start: '2025-12-15',
    registration_end: '2026-03-08',
    url: 'https://www.changwonmarathon.com',
    source: 'sample',
  },
  {
    title: '2026 강릉마라톤',
    date: '2026-09-13',
    location: '강원 강릉시 경포해변',
    distances: ['풀코스', '하프', '10km', '5km'],
    registration_start: '2026-06-01',
    registration_end: '2026-08-25',
    url: 'https://www.gangneungmarathon.com',
    source: 'sample',
  },
  {
    title: '2026 광양매화마라톤',
    date: '2026-03-22',
    location: '전남 광양시 매화마을',
    distances: ['하프', '10km', '5km'],
    registration_start: '2025-12-01',
    registration_end: '2026-03-05',
    url: 'https://www.maehwamarathon.com',
    source: 'sample',
  },
  {
    title: '2026 서울여자마라톤',
    date: '2026-09-06',
    location: '서울 올림픽공원',
    distances: ['풀코스', '하프', '10km'],
    registration_start: '2026-05-01',
    registration_end: '2026-08-20',
    url: 'https://www.seoulwomenmarathon.com',
    source: 'sample',
  },
  {
    title: '2026 속초마라톤',
    date: '2026-10-11',
    location: '강원 속초시 청초호',
    distances: ['풀코스', '하프', '10km', '5km'],
    registration_start: '2026-07-01',
    registration_end: '2026-09-25',
    url: 'https://www.sokchomararathon.com',
    source: 'sample',
  },
  {
    title: '2026 한강마라톤',
    date: '2026-04-19',
    location: '서울 여의도한강공원',
    distances: ['하프', '10km', '5km'],
    registration_start: '2026-02-01',
    registration_end: '2026-04-01',
    url: 'https://www.hanriverthon.com',
    source: 'sample',
  },
  {
    title: '2026 코오롱구간마라톤',
    date: '2026-05-24',
    location: '경기 가평군 청평~서울',
    distances: ['풀코스'],
    registration_start: '2026-02-20',
    registration_end: '2026-05-01',
    url: 'https://www.kolonmarathon.com',
    source: 'sample',
  },
  {
    title: '2026 조선일보춘천마라톤',
    date: '2026-10-18',
    location: '강원 춘천시 공지천',
    distances: ['풀코스', '하프', '10km'],
    registration_start: '2026-06-15',
    registration_end: '2026-09-30',
    url: 'https://www.chosunmarathon.com',
    source: 'sample',
  },
]

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 기존 샘플 데이터 삭제 후 재삽입
  await getSupabaseAdmin().from('races').delete().eq('source', 'sample')

  const { error } = await getSupabaseAdmin()
    .from('races')
    .insert(sampleRaces)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: '샘플 데이터 추가 완료', count: sampleRaces.length })
}
