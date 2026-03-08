import axios from 'axios'
import * as cheerio from 'cheerio'

export interface Race {
  title: string
  date: string
  location: string
  distances: string[]
  registration_start: string | null
  registration_end: string | null
  url: string
  source: string
}

export async function crawlMarathonOnline(): Promise<Race[]> {
  const races: Race[] = []

  try {
    const response = await axios.get('http://www.marathon.pe.kr/sub03/schedule_v4.php', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9',
      },
      timeout: 15000,
      responseType: 'arraybuffer',
    })

    const decoder = new TextDecoder('euc-kr')
    const html = decoder.decode(response.data)
    const $ = cheerio.load(html)

    $('table.board_list tr').each((_, row) => {
      const cells = $(row).find('td')
      if (cells.length < 4) return

      const title = $(cells[1]).text().trim()
      const date = $(cells[2]).text().trim()
      const location = $(cells[3]).text().trim()
      const link = $(cells[1]).find('a').attr('href')

      if (!title || !date) return

      const distanceText = $(cells[0]).text().trim()
      const distances = distanceText
        .split(/[,\/]/)
        .map((d) => d.trim())
        .filter(Boolean)

      races.push({
        title,
        date,
        location,
        distances,
        registration_start: null,
        registration_end: null,
        url: link ? `http://www.marathon.pe.kr${link}` : 'http://www.marathon.pe.kr',
        source: 'marathon-online',
      })
    })
  } catch (err) {
    console.error('[crawlMarathonOnline] error:', err)
  }

  return races
}
