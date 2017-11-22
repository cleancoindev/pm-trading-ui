import { ETHEREUM_NETWORK, ETHEREUM_NETWORK_IDS } from 'integrations/constants'

import { weiToEth, promisify } from 'utils/helpers'

class BaseIntegration {
  runProviderUpdate() {}
  runProviderRegister() {}

  /**
   * Initializes the Integration
   * @param {object} opts - Integration Options
   * @param {function} opts.runProviderUpdate - Function to run when this provider updates
   * @param {function} opts.runProviderRegister - Function to run when this provider registers
   */
  async initialize(opts) {
    this.runProviderUpdate =
      typeof opts.runProviderUpdate === 'function' ? opts.runProviderUpdate : this.runProviderUpdate
    this.runProviderRegister =
      typeof opts.runProviderRegister === 'function' ? opts.runProviderRegister : this.runProviderRegister
  }

  /**
   * Returns the current Networks Name
   * @async
   * @see src/integrations/constants ETHEREUM_NETWORK constants
   * @returns {Promise<string>} - Network Name Constant
   */
  async getNetwork() {
    const networkId = await this.getNetworkId()

    const networkName = ETHEREUM_NETWORK_IDS[networkId]
    return networkName || ETHEREUM_NETWORK.UNKNOWN
  }

  /**
   * Returns the current Networks ID
   * @async
   * @returns {Promise<string>} - Network Identifier
   */
  async getNetworkId() {
    return promisify(this.web3.version.getNetwork, [], this.defaultTimeout > 0 ? this.defaultTimeout : undefined)
  }

  /**
   * Returns the current Accounts Address
   * @async
   * @returns {Promise<string>} - Accountaddress
   */
  async getAccount() {
    const accounts = await promisify(
      this.web3.eth.getAccounts,
      [],
      this.defaultTimeout > 0 ? this.defaultTimeout : undefined,
    )

    return accounts && accounts.length ? accounts[0] : null
  }

  /**
   * Returns the balance for the current default account in Wei
   * @async
   * @returns {Promise<string>} - Accountbalance in WEI for current account
   */
  async getBalance() {
    if (!this.account) {
      throw new Error('No Account available')
    }

    const balance = await promisify(
      this.web3.eth.getBalance,
      [this.account],
      this.defaultTimeout > 0 ? this.defaultTimeout : undefined,
    )

    if (typeof balance !== 'undefined') {
      return weiToEth(balance.toString())
    }

    throw new Error('Invalid Balance')
  }

  watch = async (property, getter) => {
    let value

    try {
      value = await getter.call(this)
    } catch (e) {
      if (this.walletEnabled) {
        this.walletEnabled = false
        await this.runProviderUpdate(this, { available: false })
      }

      return
    }

    if (this[property] !== value) {
      const providerUpdate = { [property]: value }

      if (!this.walletEnabled) {
        providerUpdate.available = true
        this.walletEnabled = true
      }
      this.runProviderUpdate(this, providerUpdate)
    }
  }
}

export default BaseIntegration
