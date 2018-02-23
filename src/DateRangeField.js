import React from 'react'
import { DateRangePicker } from 'react-dates';

export default class DateRangeField extends React.Component {

  state = {
    focusedInput: null
  }

  onChange = ({ startDate, endDate }) => {
    const event = { target: { name: this.props.name, value: { startDate, endDate } } }
    this.props.onChange(event)
  }

  render() {

    let { value, preventOutsideRange, ...otherProps } = this.props
    delete otherProps.onChange
    delete otherProps.name

    preventOutsideRange = !!preventOutsideRange
    value = value || {}
    const { startDate, endDate } = value
    return (
      <DateRangePicker
        startDate={startDate}
        startDateId="startDateID"
        endDate={endDate}
        endDateId="endDateID"
        onDatesChange={this.onChange}
        isOutsideRange={() => preventOutsideRange}
        focusedInput={this.state.focusedInput}
        onFocusChange={focusedInput => this.setState({ focusedInput })}
        {...otherProps}
  />
    )

  }
}