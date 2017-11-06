import React from 'react'
import PropTypes from 'prop-types'
import './TransactionExplanation.less'

const TransactionsExplanation = ({ transactions, closeModal }) => (
  <div className="transactionsExplanation">
    <div className="container transactionsExplanation__container">
      <a className="transactionsExplanation__close" href="javascript:void(0);" onClick={() => closeModal()} />
      {this.props.errorMessage &&
        this.props.status === 'ERROR' && (
          <span className="transactionsExplanation__error">{this.props.errorMessage}</span>
        )}

      {
        this.props.status === 'OK' && (
          <div>
            <span className="transactionExplanation__success">Your transactions were successful!</span>
          </div>
        )
      }

      {!this.props.status && (
        <div>
          <h3>
            We will ask you to approve the following {transactions.length === 1 ? 'transaction' : 'transactions'} with
            your <strong>uPort app</strong>
          </h3>
          transactions.length > 1 ? (
          <ul className="transactionsExplanation__transaction-list">
            {transactions.map((transaction, index) => <li key={transaction}>{`${index + 1}. ${transaction}`}</li>)}
          </ul>
          ) : (
          <h4 className="transactionsExplanation__transaction-single">{transactions[0]}</h4>
          )
          <h4>
            To approve this transaction, use your uPort App on your mobile device and sign the transaction by either
            entering your PIN/Password or by using your devices authorisation method such as fingerprint or a face
            scanner.
          </h4>
        </div>
      )}
    </div>
  </div>
)

TransactionsExplanation.propTypes = {
  transactions: PropTypes.arrayOf(PropTypes.string),
  closeModal: PropTypes.func,
  errorMessage: PropTypes.string,
  status: PropTypes.string,
}

export default TransactionsExplanation
