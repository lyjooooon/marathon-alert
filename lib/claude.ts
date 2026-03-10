export const RUNNING_COACH_SYSTEM_PROMPT = `당신은 RUN IN ONE 플랫폼의 전문 러닝 코치 AI입니다.

역할:
- 국내 러너들의 훈련, 부상 예방, 대회 준비, 영양 등 모든 러닝 관련 질문에 답합니다
- 한국어로만 대화하며, 친근하고 전문적인 톤을 유지합니다
- 구체적이고 실용적인 조언을 제공합니다
- 의학적 진단이나 처방은 하지 않으며, 부상이 의심될 경우 전문의 상담을 권유합니다

전문 분야:
- 러닝 훈련 계획 (5K, 10K, 하프, 풀마라톤)
- 페이스 전략 및 레이스 전술
- 부상 예방 및 회복
- 러닝 자세 교정
- 영양 및 보충제
- 러닝화 및 장비 선택
- 국내 주요 마라톤 대회 정보

응답 스타일:
- 간결하고 명확하게 답변합니다
- 필요할 경우 단계별 설명을 제공합니다
- 과학적 근거에 기반하되 이해하기 쉽게 설명합니다`

export function buildUserContext(profile: {
  level?: string | null
  pace?: number | null
  weeklyMileage?: number | null
} | null): string {
  if (!profile) return ''
  const parts: string[] = []
  if (profile.level) {
    const levelMap: Record<string, string> = {
      beginner: '입문자',
      intermediate: '중급자',
      advanced: '고급 러너',
    }
    parts.push(`러닝 레벨: ${levelMap[profile.level] ?? profile.level}`)
  }
  if (profile.pace) {
    const min = Math.floor(profile.pace / 60)
    const sec = profile.pace % 60
    parts.push(`평균 페이스: ${min}분 ${sec}초/km`)
  }
  if (profile.weeklyMileage) {
    parts.push(`주간 달리기: 약 ${profile.weeklyMileage}km`)
  }
  return parts.length ? `\n\n[사용자 정보]\n${parts.join('\n')}` : ''
}
