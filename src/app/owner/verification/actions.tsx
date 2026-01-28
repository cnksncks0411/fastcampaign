'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export type FormState = {
    error?: string
    success?: boolean
    verificationStatus?: 'PENDING' | 'APPROVED' | 'REJECTED'
    rejectionReason?: string
}

const verificationSchema = z.object({
    business_number: z.string().min(1, '사업자등록번호를 입력해주세요'),
    business_name: z.string().min(1, '상호명을 입력해주세요'),
    representative_name: z.string().min(1, '대표자명을 입력해주세요'),
})

// 인증 상태 확인
export async function getVerificationStatus(): Promise<FormState> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: '로그인이 필요합니다' }
    }

    const { data: verification } = await supabase
        .from('owner_verifications')
        .select('status, rejection_reason')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    if (!verification) {
        return {} // 인증 신청 내역 없음
    }

    return {
        verificationStatus: verification.status as FormState['verificationStatus'],
        rejectionReason: verification.rejection_reason || undefined,
    }
}

// 인증 신청
export async function submitVerification(
    prevState: FormState,
    formData: FormData
): Promise<FormState> {
    const supabase = await createClient()

    // 1. 로그인 확인
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: '로그인이 필요합니다' }
    }

    // 2. 기존 인증 상태 확인
    const { data: existingVerification } = await supabase
        .from('owner_verifications')
        .select('status')
        .eq('owner_id', user.id)
        .in('status', ['PENDING', 'APPROVED'])
        .single()

    if (existingVerification) {
        if (existingVerification.status === 'APPROVED') {
            return { verificationStatus: 'APPROVED' }
        }
        if (existingVerification.status === 'PENDING') {
            return { verificationStatus: 'PENDING' }
        }
    }

    // 3. 유효성 검사
    const rawData = {
        business_number: formData.get('business_number'),
        business_name: formData.get('business_name'),
        representative_name: formData.get('representative_name'),
    }

    const validated = verificationSchema.safeParse(rawData)
    if (!validated.success) {
        return { error: validated.error.errors[0].message }
    }

    // 4. 파일 업로드 (선택적)
    const documentFile = formData.get('document') as File | null
    let docUrl: string | null = null

    if (documentFile && documentFile.size > 0) {
        const fileExt = documentFile.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('verifications')
            .upload(fileName, documentFile, {
                cacheControl: '3600',
                upsert: false
            })

        if (uploadError) {
            console.error('File upload error:', uploadError)
            // 파일 업로드 실패해도 계속 진행 (MVP에서는 선택적)
        } else {
            docUrl = uploadData.path
        }
    }

    // 5. 매장 ID 조회 (있는 경우)
    const { data: store } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', user.id)
        .limit(1)
        .single()

    // 6. 인증 신청 생성
    const { error: insertError } = await supabase
        .from('owner_verifications')
        .insert({
            owner_id: user.id,
            store_id: store?.id || null,
            business_number: validated.data.business_number,
            business_name: validated.data.business_name,
            representative_name: validated.data.representative_name,
            doc_url: docUrl,
            status: 'PENDING',
        })

    if (insertError) {
        console.error('Verification insert error:', insertError)
        return { error: '인증 신청에 실패했습니다. 다시 시도해주세요.' }
    }

    return { verificationStatus: 'PENDING', success: true }
}
