import { getOwnerStoresWithStatus } from '../../actions'
import { CreateForm } from './CreateForm'
import { BackButton } from '@/components/common/BackButton'
import { AlertCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function CreateCampaignPage() {
    const result = await getOwnerStoresWithStatus()

    if (result.error || !result.data) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl text-center max-w-sm">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-lg font-bold mb-2">데이터를 불러오지 못했습니다</h2>
                    <p className="text-slate-500 text-sm mb-6">{result.error || '잠시 후 다시 시도해주세요'}</p>
                    <BackButton />
                </div>
            </div>
        )
    }

    // 매장이 없는 경우 처리
    if (result.data.stores.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl font-bold">등록된 매장이 없습니다</h2>
                    <p className="text-slate-500">캠페인을 시작하려면 먼저 매장을 등록해주세요.</p>
                    <a href="/owner/register-store" className="inline-block px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors">
                        매장 등록하기
                    </a>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-dvh bg-slate-50 dark:bg-slate-950 pb-24">
            <header className="sticky top-0 z-30 flex items-center h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800 px-4 transition-all">
                <BackButton />
                <h1 className="text-lg font-bold text-slate-900 dark:text-white ml-2">새로운 캠페인 시작하기</h1>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <CreateForm storeData={result.data} />
            </div>
        </div>
    )
}
