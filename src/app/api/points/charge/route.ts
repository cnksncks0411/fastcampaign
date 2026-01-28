import { NextResponse } from 'next/server'

export async function POST() {
    return new NextResponse('Not Found', { status: 404 })
}

/*
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

// MVP용 테스트 포인트 충전 API
// 실제 서비스에서는 PG 연동 후 콜백에서 처리해야 함
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // 1. 사용자 확인
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
        }

        // 2. 요청 데이터 파싱
        const body = await request.json()
        const amount = parseInt(body.amount)

        if (!amount || amount < 1000) {
            return NextResponse.json({ error: '최소 충전 금액은 1,000원입니다' }, { status: 400 })
        }

        if (amount > 10000000) {
            return NextResponse.json({ error: '최대 충전 금액은 10,000,000원입니다' }, { status: 400 })
        }

        // 3. 사업주 권한 확인
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!profile || profile.role !== 'OWNER') {
            return NextResponse.json({ error: '사업주만 포인트를 충전할 수 있습니다' }, { status: 403 })
        }

        // 4. 현재 잔액 조회 또는 지갑 생성
        let { data: wallet } = await supabase
            .from('points_wallets')
            .select('balance')
            .eq('owner_id', user.id)
            .single()

        if (!wallet) {
            // 지갑이 없으면 생성
            const { error: createError } = await supabase
                .from('points_wallets')
                .insert({ owner_id: user.id, balance: 0 })

            if (createError) {
                console.error('Wallet creation error:', createError)
                return NextResponse.json({ error: '지갑 생성에 실패했습니다' }, { status: 500 })
            }
            wallet = { balance: 0 }
        }

        // 5. 포인트 충전 (잔액 증가)
        const newBalance = wallet.balance + amount
        const { error: updateError } = await supabase
            .from('points_wallets')
            .update({ balance: newBalance })
            .eq('owner_id', user.id)

        if (updateError) {
            console.error('Wallet update error:', updateError)
            return NextResponse.json({ error: '충전에 실패했습니다' }, { status: 500 })
        }

        // 6. 원장 기록
        const idempotencyKey = `charge_${user.id}_${Date.now()}`
        await supabase
            .from('points_ledger')
            .insert({
                owner_id: user.id,
                transaction_type: 'CHARGE',
                amount: amount,
                balance_after: newBalance,
                description: `포인트 충전 (테스트)`,
                idempotency_key: idempotencyKey,
            })

        // Revalidate paths to update UI
        revalidatePath('/my/profile')
        revalidatePath('/owner')
        revalidatePath('/owner/points')


        return NextResponse.json({
            success: true,
            balance: newBalance,
            charged: amount
        })

    } catch (error) {
        console.error('Charge error:', error)
        return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
    }
}
*/
