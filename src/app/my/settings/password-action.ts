'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updatePassword(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/;

    if (!password || password.length < 8) {
        return { success: false, message: '', error: '비밀번호는 8자 이상이어야 합니다.' }
    }

    if (!passwordRegex.test(password)) {
        return { success: false, message: '', error: '비밀번호는 영문, 숫자, 특수문자를 모두 포함해야 합니다.' }
    }

    if (password !== confirmPassword) {
        return { success: false, message: '', error: '비밀번호가 일치하지 않습니다.' }
    }

    const { error } = await supabase.auth.updateUser({
        password: password
    })

    if (error) {
        console.error('Password update error:', error)
        return { success: false, message: '', error: '비밀번호 변경에 실패했습니다.' }
    }

    return {
        success: true,
        message: '비밀번호가 성공적으로 변경되었습니다.',
        error: ''
    }
}
