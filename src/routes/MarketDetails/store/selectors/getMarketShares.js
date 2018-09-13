import { getCurrentAccount } from 'integrations/store/selectors'
import Decimal from 'decimal.js'
import { createSelector } from 'reselect'
import { sharesWithMarketsSelector } from 'store/selectors/account/shares'
import { hexWithoutPrefix } from 'utils/helpers'
import { calcShareWinnings } from 'routes/Dashboard/containers/Dashboard/utils'

const getMarketShares = marketAddress => createSelector(sharesWithMarketsSelector, getCurrentAccount, (shares, account) => shares
  .filter(
    share => Decimal(share.balance).gt(0)
          && share.owner === hexWithoutPrefix(account)
          && share.market?.address === marketAddress,
  )
  .map((share) => {
    let shareWinnings = '0'

    if (share.market.resolved) {
      shareWinnings = calcShareWinnings(share, share.market)
    }

    return share.set('winnings', shareWinnings)
  })
  .toList())

export default getMarketShares
