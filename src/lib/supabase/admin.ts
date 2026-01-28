import { createClient } from '@supabase/supabase-js'

// ⚠️ 이 클라이언트는 RLS를 우회합니다!
// 반드시 서버 사이드에서만 사용하세요.
// 절대로 클라이언트 컴포넌트에서 import하지 마세요!

export const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
)
