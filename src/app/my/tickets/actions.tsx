'use server'

import { createClient } from '@/lib/supabase/server'

export interface UserTicket {
    id: string
    status: string
    confirmed_at: string
    checked_in_at: string | null
    campaign: {
        id: string
        title: string
        benefit_text: string
        review_type: string
        required_tags: string[] | null
        end_at: string
        store: {
            name: string
            address_text: string
            lat: number
            lng: number
        }
    }
    checkin_token?: string
}

// 헬퍼 함수: 중첩된 객체 평탄화 (필요 시 사용)
function flattenCampaign(campaign: unknown): UserTicket['campaign'] {
    const c = Array.isArray(campaign) ? campaign[0] : campaign
    if (!c) {
        return {
            id: '',
            title: '',
            benefit_text: '',
            review_type: '',
            required_tags: null,
            end_at: '',
            store: { name: '', address_text: '', lat: 0, lng: 0 }
        }
    }

    const campaignObj = c as Record<string, unknown>
    const store = Array.isArray(campaignObj.store)
        ? campaignObj.store[0]
        : campaignObj.store

    return {
        id: campaignObj.id as string,
        title: campaignObj.title as string,
        benefit_text: campaignObj.benefit_text as string,
        review_type: campaignObj.review_type as string,
        required_tags: campaignObj.required_tags as string[] | null,
        end_at: campaignObj.end_at as string,
        store: store as UserTicket['campaign']['store']
    }
}

// 사용자의 이용권(신청) 목록 조회 (실제 DB)
export async function getUserTickets(): Promise<{ tickets: UserTicket[]; error?: string }> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    // 비로그인 상태면 빈 배열 반환
    if (!user) {
        return { tickets: [] }
    }

    try {
        const { data: applications, error } = await supabase
            .from('applications')
            .select(`
                id,
                status,
                confirmed_at,
                checked_in_at,
                campaign:campaigns (
                    id,
                    title,
                    benefit_text,
                    review_type,
                    required_tags,
                    end_at,
                    store:stores (
                        name,
                        address_text,
                        lat,
                        lng
                    )
                ),
                checkin_tokens (
                    token
                )
            `)
            .eq('user_id', user.id)
            .order('confirmed_at', { ascending: false })

        if (error) {
            console.error('Error fetching tickets:', error)
            return { tickets: [], error: '이용권을 불러오지 못했습니다.' }
        }

        // 데이터 타입 변환 및 checkin_tokens 처리
        const tickets: UserTicket[] = (applications || []).map((app: any) => {
            // checkin_tokens는 배열로 반환될 수 있음 (1:1 또는 1:N)
            const tokenData = Array.isArray(app.checkin_tokens) ? app.checkin_tokens[0] : app.checkin_tokens
            const token = tokenData?.token

            return {
                id: app.id,
                status: app.status,
                confirmed_at: app.confirmed_at,
                checked_in_at: app.checked_in_at,
                checkin_token: token, // 매핑된 토큰 할당
                campaign: {
                    id: app.campaign.id,
                    title: app.campaign.title,
                    benefit_text: app.campaign.benefit_text,
                    review_type: app.campaign.review_type,
                    required_tags: app.campaign.required_tags,
                    end_at: app.campaign.end_at,
                    store: app.campaign.store
                }
            }
        })

        return { tickets }
    } catch (err) {
        console.error('Unexpected error:', err)
        return { tickets: [], error: '알 수 없는 오류가 발생했습니다.' }
    }
}

// 특정 이용권 상세 조회 (실제 DB)
export async function getTicketDetail(applicationId: string): Promise<{ ticket?: UserTicket; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: '로그인이 필요합니다' }

    try {
        const { data: app, error } = await supabase
            .from('applications')
            .select(`
                id,
                status,
                confirmed_at,
                checked_in_at,
                campaign:campaigns (
                    id,
                    title,
                    benefit_text,
                    review_type,
                    required_tags,
                    end_at,
                    store:stores (
                        name,
                        address_text,
                        lat,
                        lng
                    )
                ),
                checkin_tokens (
                    token
                )
            `)
            .eq('id', applicationId)
            .eq('user_id', user.id)
            .single()

        if (error || !app) {
            return { error: '이용권을 찾을 수 없습니다' }
        }

        const appData = app as any
        const tokenData = Array.isArray(appData.checkin_tokens) ? appData.checkin_tokens[0] : appData.checkin_tokens
        const token = tokenData?.token

        const ticket: UserTicket = {
            id: appData.id,
            status: appData.status,
            confirmed_at: appData.confirmed_at,
            checked_in_at: appData.checked_in_at,
            checkin_token: token,
            campaign: {
                id: appData.campaign.id,
                title: appData.campaign.title,
                benefit_text: appData.campaign.benefit_text,
                review_type: appData.campaign.review_type,
                required_tags: appData.campaign.required_tags,
                end_at: appData.campaign.end_at,
                store: appData.campaign.store
            }
        }

        return { ticket }
    } catch (err) {
        return { error: '조회 중 오류가 발생했습니다' }
    }
}
