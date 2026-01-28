import CampaignDetailPage from '@/app/(main)/campaigns/[id]/page'
import { ModalWrapper } from './modal-wrapper'

export default function InterceptedCampaignPage(props: any) {
    return (
        <ModalWrapper>
            <CampaignDetailPage {...props} />
        </ModalWrapper>
    )
}
