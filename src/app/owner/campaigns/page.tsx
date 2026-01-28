
import { getOwnerCampaigns, getOwnerStores } from '../actions'
import CampaignListClient from './CampaignListClient'

type Props = {
    searchParams: Promise<{ store_id?: string }>
}

export default async function OwnerCampaignsPage({ searchParams }: Props) {
    const resolvedParams = await searchParams
    const storeId = resolvedParams.store_id

    // Fetch ALL campaigns and stores to allow client-side filtering
    const [campaignsRes, storesRes] = await Promise.all([
        getOwnerCampaigns('ALL'),
        getOwnerStores()
    ])

    const campaigns = campaignsRes.campaigns || []
    const stores = storesRes.stores || []

    if (campaignsRes.error) {
        return <div className="p-8 text-center text-red-500">데이터를 불러오지 못했습니다.</div>
    }

    return <CampaignListClient campaigns={campaigns} stores={stores} initialStoreId={storeId} />
}
