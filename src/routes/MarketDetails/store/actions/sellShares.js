import allowedRangePrice from 'utils/marginPrice'
import uuid from 'uuid/v4'
import * as api from 'api'
import Decimal from 'decimal.js'
import { requestCollateralTokenBalance } from 'store/actions/blockchain'
import {
  startLog, closeLog, closeEntrySuccess, closeEntryError,
} from 'routes/Transactions/store/actions/transactions'
import { openModal, closeModal } from 'store/actions/modal'
import { requestFromRestAPI } from 'api/utils/fetch'
import { gaSend } from 'utils/analytics/google'
import { MAX_ALLOWANCE_WEI, TRANSACTION_COMPLETE_STATUS } from 'utils/constants'
import { SETTING_ALLOWANCE, SELL } from 'utils/transactionExplanations'
import { TRANSACTION_EVENTS_GENERIC, TRANSACTION_STAGES } from 'store/actions/market/constants'
import { updateShare } from 'store/actions/shares'
import { processMarketResponse } from './requestMarket'
import { sellShares } from '../../api'
/**
 * Sell shares on a specific market
 * @param {Market} market - Market to sell shares on
 * @param {MarketShare} share - Marketshare object
 * @param {number|string|BigNumber} outcomeTokenCount - Amount of tokenshares to sell
 */
const sellMarketShares = (market, share, outcomeTokenCount, earnings) => async (dispatch, getState) => {
  const transactionId = uuid()
  const gnosis = await api.getGnosisConnection()
  const currentAccount = await api.getCurrentAccount()

  const {
    outcomeToken: { index: outcomeIndex },
  } = share

  // Reset the allowance if the cost of current transaction is greater than the current allowance
  const marketAllowance = await gnosis.contracts.Token.at(
    await gnosis.contracts.Event.at(market.eventAddress).outcomeTokens(outcomeIndex),
  ).allowance(currentAccount, market.address)
  const outcomeCountWei = Decimal(outcomeTokenCount).mul(1e18)
  const approvalResetAmount = outcomeCountWei.gte(marketAllowance.toString()) ? MAX_ALLOWANCE_WEI : null

  const updatedMarket = await requestFromRestAPI(`markets/${market.address}`)
  const updatedPrice = updatedMarket.marginalPrices[outcomeIndex]
  const oldPrice = market.outcomes.toArray()[outcomeIndex].marginalPrice
  if (!allowedRangePrice(oldPrice, updatedPrice)) {
    dispatch(openModal({ modalName: 'ModalOutcomePriceChanged' }))
    return processMarketResponse(dispatch, getState(), updatedMarket)
  }

  // Start a new transaction log
  await dispatch(startLog(transactionId, TRANSACTION_EVENTS_GENERIC, `Selling Shares for "${market.title}"`))

  gaSend(['event', 'Transactions', 'trading-interface', 'Sell shares transactions start'])
  const transactions = [
    SELL(
      Decimal(outcomeTokenCount)
        .toDP(2)
        .toNumber(),
    ),
  ]

  if (approvalResetAmount) transactions.unshift(SETTING_ALLOWANCE)

  try {
    await sellShares(market.address, outcomeIndex, outcomeTokenCount, earnings, approvalResetAmount)
    await dispatch(closeEntrySuccess, transactionId, TRANSACTION_STAGES.GENERIC)
    gaSend(['event', 'Transactions', 'trading-interface', 'Sell shares transactions succeeded'])
    await dispatch(closeModal())
  } catch (e) {
    console.error(e)
    await dispatch(closeEntryError(transactionId, TRANSACTION_STAGES.GENERIC, e.message))
    await dispatch(closeLog(transactionId, TRANSACTION_COMPLETE_STATUS.ERROR))
    await dispatch(closeModal())
    throw e
  }

  await dispatch(
    updateShare({
      shareId: share.id,
      data: {
        balance: Decimal(share.balance)
          .sub(Decimal(outcomeCountWei))
          .toString(),
      },
    }),
  )
  await dispatch(requestCollateralTokenBalance(currentAccount))

  return dispatch(closeLog(transactionId, TRANSACTION_COMPLETE_STATUS.NO_ERROR))
}

export default sellMarketShares
