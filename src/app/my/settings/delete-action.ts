'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function deleteAccount(password?: string) {
    const supabase = await createClient()

    // 1. 현재 로그인된 사용자 확인
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: '로그인이 필요합니다.' }
    }

    // 2. 비밀번호 검증 (이메일 로그인 사용자인 경우)
    if (user.app_metadata.provider === 'email' && password) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email!,
            password
        })

        if (signInError) {
            return { success: false, error: '비밀번호가 올바르지 않습니다.' }
        }
    } else if (user.app_metadata.provider === 'email' && !password) {
        return { success: false, error: '본인 확인을 위해 비밀번호를 입력해주세요.' }
    }

    // 3. Admin Client 생성 (사용자 완전 삭제를 위해 필요)
    const adminSupabase = await createAdminClient()

    // 4. 사용자 삭제 시도
    const { error } = await adminSupabase.auth.admin.deleteUser(user.id)

    if (error) {
        console.error('Delete user error:', error)
        return { success: false, error: '회원 탈퇴 처리 중 오류가 발생했습니다.' }
    }

    // 4. 로그아웃 처리 (세션 정리)
    await supabase.auth.signOut()

    return { success: true }
}
