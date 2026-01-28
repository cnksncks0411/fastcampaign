'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// 닉네임 중복 확인
export async function checkNicknameAvailability(nickname: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { available: false, error: '로그인이 필요합니다.' }
    if (!nickname || nickname.length < 2) return { available: false, error: '닉네임은 2자 이상이어야 합니다.' }

    // 본인 닉네임인 경우 통과 (변경 안 함)
    const { data: currentProfile } = await supabase
        .from('profiles')
        .select('nickname')
        .eq('id', user.id)
        .single()

    if (currentProfile?.nickname === nickname) {
        return { available: true, message: '현재 사용 중인 닉네임입니다.' }
    }

    // 중복 체크
    // RLS 정책상 사용자는 다른 프로필의 nickname을 select로 조회 가능해야 함 (profiles_select_all 정책 존재 확인됨)
    const { count, error } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('nickname', nickname)

    if (error) {
        console.error('Nickname check error:', error)
        return { available: false, error: '확인 중 오류가 발생했습니다.' }
    }

    if (count && count > 0) {
        return { available: false, message: '이미 사용 중인 닉네임입니다.' }
    }

    return { available: true, message: '사용 가능한 닉네임입니다.' }
}

export async function updateProfile(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, message: '', error: '로그인이 필요합니다.', newAvatarUrl: null }
    }

    const nickname = formData.get('nickname') as string

    // const avatarFile = formData.get('avatar') as File
    // 현재 아바타 업로드 기능은 UI에서 숨김 처리됨

    if (!nickname?.trim()) {
        return { success: false, message: '', error: '닉네임을 입력해주세요.', newAvatarUrl: null }
    }

    let avatarUrl = null

    /* 
    // 이미지 업로드 로직 (주석 처리됨)
    if (avatarFile && avatarFile.size > 0) {
        // ... 업로드 로직 ...
    }
    */

    const updateData: any = {
        nickname: nickname.trim()
    }

    /*
    if (avatarUrl) {
        updateData.avatar_url = avatarUrl
    }
    */

    const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)

    if (error) {
        // 닉네임 중복 제약조건(Unique key)이 DB에 있다면 여기서 에러가 날 수도 있음
        if (error.code === '23505') { // Postgres unique violation code
            return {
                success: false,
                message: '',
                error: '이미 사용 중인 닉네임입니다.',
                newAvatarUrl: null
            }
        }

        console.error('Profile update error:', error)
        return {
            success: false,
            message: '',
            error: '프로필 수정 중 오류가 발생했습니다.',
            newAvatarUrl: null
        }
    }

    revalidatePath('/my/profile')
    revalidatePath('/my/settings')

    return {
        success: true,
        message: '프로필이 업데이트되었습니다.',
        error: '',
        newAvatarUrl: avatarUrl
    }
}
