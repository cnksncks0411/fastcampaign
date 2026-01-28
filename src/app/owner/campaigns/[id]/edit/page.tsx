
import { getOwnerCampaignDetail } from '@/app/owner/actions'
import { EditForm } from './EditForm'

export default async function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const { campaign, error } = await getOwnerCampaignDetail(id)

    if (error || !campaign) {
        return <div className="p-10 text-center text-slate-500">캠페인을 찾을 수 없거나 권한이 없습니다.</div>
    }

    // 신청자가 있거나 Active 상태가 아니면 수정 불가 정책
    if (campaign.current_confirmed > 0 || campaign.status !== 'ACTIVE') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] p-10 text-center text-slate-500 gap-4">
                <div className="font-bold text-lg text-slate-900">수정할 수 없는 캠페인입니다</div>
                <p className="text-sm">
                    이미 신청자가 있거나 종료된 캠페인은 수정할 수 없습니다.<br />
                    관리자에게 문의해주세요.
                </p>
            </div>
        )
    }

    return <EditForm campaign={campaign} />
}
