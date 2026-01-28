
import { notFound } from 'next/navigation'
import { EditStoreForm } from './edit-form'
import { getOwnerStoreDetail } from '../../actions'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function EditStorePage({ params }: PageProps) {
    const resolvedParams = await params
    const storeId = resolvedParams.id

    const { store, error } = await getOwnerStoreDetail(storeId)

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl text-center max-w-sm w-full">
                    <h2 className="text-xl font-bold text-red-500 mb-2">오류 발생</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
                    <a href="/owner/stores" className="text-sm font-medium text-violet-600 hover:text-violet-500 underline underline-offset-4">
                        목록으로 돌아가기
                    </a>
                </div>
            </div>
        )
    }

    if (!store) {
        notFound()
    }

    return <EditStoreForm store={store} />
}
