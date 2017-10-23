import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import DecimalValue from 'components/DecimalValue'
import Identicon from 'components/Identicon'
import ProviderIcon from 'components/ProviderIcon'
import { providerPropType } from 'utils/shapes'
import { upperFirst } from 'lodash'

import './header.less'

const Header = ({ version, currentAccount, currentBalance, currentNetwork, currentProvider }) => (
  <div className="headerContainer">
    <div className="container">
      <div className="headerContainer__group headerContainer__group--logo">
        <Link to="/">
          <div className="headerLogo" />
        </Link>
      </div>
      <div className="headerContainer__group headerContainer__group--left headerContainer__group--version">
        {version}
      </div>
      <div className="headerContainer__group headerContainer__group--left">
        <Link
          to="/markets/list"
          activeClassName="headerContainer__navLink--active"
          className="headerContainer__navLink"
        >
          Markets
        </Link>
        <Link to="/dashboard" activeClassName="headerContainer__navLink--active" className="headerContainer__navLink">
          Dashboard
        </Link>
        <Link to="/scoreboard" activeClassName="headerContainer__navLink--active" className="headerContainer__navLink">
          Scoreboard
        </Link>
        <Link to="/gamerules" activeClassName="headerContainer__navLink--active" className="headerContainer__navLink">
          Game Rules
        </Link>

      </div>
      <div className="headerContainer__group headerContainer__group--right account">
        {currentAccount && currentProvider && (
          <div className="headerContainer__account">
            {currentNetwork && currentNetwork !== 'MAIN' && <span className="headerContainer__network--text">Network: {upperFirst(currentNetwork.toLowerCase())}</span>}
            <DecimalValue value={currentBalance} className="headerContainer__account--text" />&nbsp;<span className="headerContainer__account--text">ETH</span>
            <Identicon account={currentAccount} />
          </div>
        )}
        {currentAccount && currentProvider && (
          <ProviderIcon provider={currentProvider} />
        )}
      </div>
    </div>
  </div>
)

Header.propTypes = {
  version: PropTypes.string,
  currentNetwork: PropTypes.string,
  currentAccount: PropTypes.string,
  currentBalance: PropTypes.string,
  currentProvider: providerPropType,
}

export default Header
