import Web3 from 'web3'
import { WALLET_PROVIDER, WALLET_STATUS } from 'integrations/constants'
import InjectedWeb3 from 'integrations/injectedWeb3'
import { timeoutCondition } from 'utils/helpers'
import { hasMetamask } from 'integrations/metamask/utils'

const NETWORK_TIMEOUT = 10000

class Metamask extends InjectedWeb3 {
  static providerName = WALLET_PROVIDER.METAMASK

  static watcherInterval = 1000

  constructor() {
    super()
    this.watcher = () => {
      this.watch('account', this.getAccount)
      this.watch('balance', this.getBalance)
      this.watch('networkId', this.getNetworkId)
    }
  }

  checkIfInstalled() {
    return hasMetamask()
  }

  /**
   * Tries to set connection to the blockchain
   */
  async initWeb3(silent) {
    if (hasMetamask()) {
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum)
        try {
          if (!silent) {
            if (!window.ethereum.selectedAddress) {
              this.runProviderUpdate(this, {
                status: WALLET_STATUS.USER_ACTION_REQUIRED,
              })
            } else {
              setTimeout(() => {
                if (!this.web3) {
                  this.runProviderUpdate(this, {
                    status: WALLET_STATUS.USER_ACTION_REQUIRED,
                  })
                }
              }, 5000)
            }
          }
          await window.ethereum.enable()
          this.web3 = window.web3
          return true
        } catch (error) {
          console.error(error)
          return false
        }
      } else if (window.web3) {
        this.web3 = new Web3(window.web3.currentProvider)
        window.web3 = this.web3
        return true
      }
    }
    return false
  }

  /**
   * Tries to initialize and enable the current provider
   * @param {object} opts - Integration Options
   * @param {function} opts.runProviderUpdate - Function to run when this provider updates
   * @param {function} opts.runProviderRegister - Function to run when this provider registers
   */
  async initialize(opts) {
    super.initialize(opts)
    this.runProviderRegister(this)

    this.walletEnabled = await this.initWeb3(opts.silent)

    if (this.walletEnabled) {
      const checks = async () => {
        this.networkId = await this.getNetworkId()
        this.network = await this.getNetwork()
        this.account = await this.getAccount()
        this.balance = await this.getBalance()
      }

      // allow metamask timeout
      try {
        await Promise.race([checks(), timeoutCondition(NETWORK_TIMEOUT, 'connection timed out')])
      } catch (err) {
        console.warn(err)
        this.walletEnabled = false
      }
    } else if (!opts.silent) {
      this.runProviderUpdate(this, {
        status: WALLET_STATUS.ERROR,
      })
      throw new Error('Initialization failed')
    }

    if (this.watcher) {
      this.watcherInterval = setInterval(this.watcher, Metamask.watcherInterval)
    }

    this.runProviderUpdate(this, {
      networkId: this.networkId,
      network: this.network,
      account: this.account,
      balance: this.balance,
      status: WALLET_STATUS.INITIALIZED,
    })
  }
}

export default new Metamask()
