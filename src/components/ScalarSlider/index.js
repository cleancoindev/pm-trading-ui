import React from 'react'
import PropTypes from 'prop-types'
import Decimal from 'decimal.js'
import cn from 'classnames'

import DecimalValue from 'components/DecimalValue'

import './scalarSlider.less'

const ScalarSlider = ({
  lowerBound, upperBound, unit, marginalPriceCurrent, marginalPriceSelected, decimals,
}) => {
  const bigLowerBound = new Decimal(lowerBound)
  const bigUpperBound = new Decimal(upperBound)

  // current value
  const bounds = bigUpperBound.sub(bigLowerBound).div(10 ** decimals)

  const value = new Decimal(marginalPriceCurrent)
    .mul(bounds.toString())
    .add(bigLowerBound.div(10 ** decimals).toString())
  const percentage = new Decimal(marginalPriceCurrent).mul(100)

  const selectedValue = new Decimal(marginalPriceSelected)
    .mul(bounds.toString())
    .add(bigLowerBound.div(10 ** decimals).toString())
  const selectedPercentage = new Decimal(marginalPriceSelected).mul(100)

  const currentValueSliderStyle = { left: `${percentage.toFixed(4)}%` }
  const selectedValueSliderStyle = { left: `${selectedPercentage.toFixed(4)}%` }

  return (
    <div className="scalarSlider">
      <div className="scalarSlider__inner">
        <div className="scalarSlider__lowerBound">
          {bigLowerBound.div(10 ** decimals).toFixed(0)} {unit}
          <div className="scalarSlider__lowerBoundLabel">Lower Bound</div>
        </div>
        <div className="scalarSlider__bar" title="Please enter a value on the right!">
          <div className="scalarSlider__handle" style={currentValueSliderStyle}>
            <div className="scalarSlider__handleText">
              <div className="scalarSlider__handleTextLabel">Current Trade</div>
              <DecimalValue value={value} decimals={decimals} /> {unit}
            </div>
          </div>
          <div
            className={cn('scalarSlider__handle scalarSlider__handle--below', {
              'scalarSlider__handle--below--pinRight': selectedPercentage.gt(75),
              'scalarSlider__handle--below--pinLeft': selectedPercentage.lt(25),
            })}
            style={selectedValueSliderStyle}
          >
            <div className="scalarSlider__handleText">
              <div className="scalarSlider__handleTextLabel">Selected Trade</div>
              <DecimalValue value={selectedValue} decimals={decimals} /> {unit}
            </div>
          </div>
        </div>
        <div className="scalarSlider__upperBound">
          {bigUpperBound.div(10 ** decimals).toFixed(0)} {unit}
          <div className="scalarSlider__upperBoundLabel">Upper Bound</div>
        </div>
      </div>
    </div>
  )
}

ScalarSlider.propTypes = {
  lowerBound: PropTypes.number,
  upperBound: PropTypes.number,
  unit: PropTypes.string,
  marginalPriceCurrent: PropTypes.string,
  marginalPriceSelected: PropTypes.number,
  decimals: PropTypes.number,
}

export default ScalarSlider
