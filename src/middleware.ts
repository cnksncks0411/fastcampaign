import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    // 환경변수가 설정되지 않은 경우 미들웨어 스킵 (개발 초기용)
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
        console.warn('⚠️ Supabase 환경변수가 설정되지 않았습니다. 인증을 건너뜁니다.')
        return NextResponse.next()
    }

    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // 세션 갱신 (중요! - 토큰 만료 방지)
    const { data: { user } } = await supabase.auth.getUser()

    const { pathname } = request.nextUrl

    // 보호되지 않는 경로 (로그인 없이 접근 가능)
    const publicPaths = ['/login', '/signup', '/auth', '/legal', '/api', '/forgot-password']
    const isPublicPath = publicPaths.some(path => pathname.startsWith(path))

    // 로그인하지 않은 사용자 처리
    if (!user && !isPublicPath) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('redirect', pathname) // 로그인 후 원래 페이지로 돌아가기 위함
        return NextResponse.redirect(url)
    }

    // 사업주 전용 경로 보호 (로그인 했더라도 권한 확인)
    /* 
    if (pathname.startsWith('/owner')) {
        // 추가적인 권한 체크 로직이 필요하다면 여기에 작성
        // 현재는 DB 조회가 비용이 드므로, 클라이언트 컴포넌트나 Layout에서 처리하는 것이 일반적
        // 하지만 미들웨어에서 토큰의 role claims를 확인할 수 있다면 베스트
    } 
    */

    // 로그인한 사용자가 로그인/회원가입 페이지 접근 시 리다이렉트
    if (user && (pathname === '/login' || pathname === '/signup')) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        /*
         * 다음 경로를 제외한 모든 요청에 매칭:
         * - _next/static (정적 파일)
         * - _next/image (이미지 최적화 파일)
         * - favicon.ico (파비콘)
         * - 이미지 파일 확장자
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
