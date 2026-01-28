
import { getOwnerCampaignDetail } from '@/app/owner/actions'
import CampaignDetailClient from './CampaignDetailClient'

export default async function CampaignDetailPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const { campaign, error } = await getOwnerCampaignDetail(id)

    if (error || !campaign) {
        return <div className="p-10 text-center text-slate-500">캠페인을 찾을 수 없거나 권한이 없습니다.</div>
    }

    return <CampaignDetailClient campaign={campaign} />
}
