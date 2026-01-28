import { BackButton } from '@/components/common/BackButton'
import { getPaymentMethods, getPaymentHistory } from './actions'
import PaymentMethodList from './PaymentMethodList'
import PaymentHistory from './PaymentHistory'

export default async function PaymentPage() {
    const methods = await getPaymentMethods()
    const { data: history, hasMore } = await getPaymentHistory(0)

    return (
        <div className="bg-slate-50 dark:bg-slate-950">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center h-14 px-4 max-w-2xl mx-auto">
                    <BackButton />
                    <h1 className="font-bold text-lg text-slate-900 dark:text-white ml-2">결제 정보</h1>
                </div>
            </header>

            <div className="max-w-2xl mx-auto p-4 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {/* 결제 수단 */}
                <PaymentMethodList methods={methods} />

                {/* 최근 결제 내역 */}
                <PaymentHistory initialData={history} initialHasMore={hasMore} />
            </div>
        </div>
    )
}
