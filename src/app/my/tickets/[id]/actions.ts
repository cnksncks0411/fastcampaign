'use server'

import { createClient } from '@/lib/supabase/server'

// applicationId로 신청 취소
export async function cancelApplicationById(applicationId: string): Promise<{ success?: boolean; error?: string }> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: '로그인이 필요합니다' }
    }

    // 기존 신청 확인
    const { data: application } = await supabase
        .from('applications')
        .select('id, campaign_id, status')
        .eq('id', applicationId)
        .eq('user_id', user.id)
        .single()

    if (!application || application.status !== 'CONFIRMED') {
        return { error: '취소할 신청이 없습니다' }
    }

    // 캠페인 정보 조회
    const { data: campaign } = await supabase
        .from('campaigns')
        .select('current_confirmed, status')
        .eq('id', application.campaign_id)
        .single()

    const cancelContext = campaign?.status === 'FULL' ? 'AFTER_FULL' : 'BEFORE_FULL'

    // 신청 상태 업데이트
    const { error: updateAppError } = await supabase
        .from('applications')
        .update({
            status: 'CANCELLED_BY_USER',
            cancel_context: cancelContext,
            cancelled_at: new Date().toISOString(),
        })
        .eq('id', application.id)

    if (updateAppError) {
        return { error: '취소에 실패했습니다' }
    }

    // 캠페인 확정 인원 감소
    if (campaign) {
        await supabase
            .from('campaigns')
            .update({
                current_confirmed: Math.max(0, campaign.current_confirmed - 1),
                status: campaign.status === 'FULL' ? 'ACTIVE' : campaign.status,
            })
            .eq('id', application.campaign_id)
    }

    return { success: true }
}
