
import { getPointWallet, getPointHistory } from '../actions'
import PointsClient from './PointsClient'

export default async function PointsPage() {
    const [walletRes, historyRes] = await Promise.all([
        getPointWallet(),
        getPointHistory()
    ])

    const balance = walletRes.balance || 0
    const history = historyRes.history || []

    return <PointsClient balance={balance} history={history} />
}
