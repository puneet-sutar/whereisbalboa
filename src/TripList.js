import React from 'react'
import fire from './fire'
import ReactTable from 'react-table'
import 'react-table/react-table.css'
import Geosuggest from 'react-geosuggest'
import './geosuggest.css'
import 'react-dates/initialize'
import 'react-dates/lib/css/_datepicker.css';
import { DateRangePicker } from 'react-dates';
import Select from 'react-select';
import toastr from 'toastr'

export default class TripList extends React.Component {

  state = {
    loading: true,// Local signed-in state.
    form: {},
  }

  onSuggesSelect = (data) => {
    const { form } = this.state
    console.log(data)
    this.setState({
      form: { ...form, address: data }
    })
  }

  addNewTrip = (e) => {
    e.preventDefault(); // <- prevent form submit from reloading the page
    const { address = {}, startDate, endDate, selectedUser } = this.state.form
    const { location, label } = address
    const disabled = !location || !startDate || !endDate
    if (disabled) return
    const { user } = this.props
    const uid = selectedUser.value || user.uid
    const startTimestamp = startDate.unix()
    const endTimestamp = endDate.unix()
    fire.database().ref(`balboa/trips`).push( {
      latitude: location.lat,
      longitude: location.lng,
      name: label,
      startTimestamp,
      endTimestamp,
      uid,
    }, () => {
      this.input.clear(); // <- clear the input
      this.setState({ form: { ...this.state.form, startDate: null, endDate: null}  })
      toastr.success("Trip added successfully")
    });

  }

  render() {
    const disabled = !this.state.form.address || !this.state.form.address.location
    const { form } = this.state
    const { startDate, endDate } = form
    let { selectedUser } = form
    const { users } = this.props
    const user = users.filter(user => this.props.user.uid === user.uid)[0] || {}
    const options = users.map((user) => {
      return { label: user.name, value: user.uid }
    })

    selectedUser = selectedUser ? selectedUser : { label: user.name, value: user.uid }

    return (
      <div className="row">
        <div className="col-sm-offset-2 col-sm-8">
          <h3 className="text-center">Input a trip</h3>
          <div className="panel">
            <div className="panel-body">
              <div className="form-group">
                <Select
                  name="user"
                  value={selectedUser}
                  onChange={selectedOption => this.setState({ form: { ...form, selectedUser: selectedOption } })}
                  options={options}
                />
              </div>
              <div className="address form-group">
                <Geosuggest
                  ref={(i) => { this.input = i }}
                  inputClassName="form-control"
                  name="address"
                  types={['establishment', 'geocode']}
                  placeholder="Enter your address to get suggestions..."
                  onSuggestSelect={this.onSuggesSelect} />
              </div>
              <div className="form-group">
                <DateRangePicker
                  startDate={startDate}
                  startDateId="your_unique_start_date_id"
                  endDate={endDate}
                  endDateId="your_unique_end_date_id"
                  onDatesChange={({ startDate, endDate }) => this.setState({ form: { ...form, startDate, endDate } })}
                  isOutsideRange={() => false}
                  required
                  focusedInput={this.state.focusedInput}
                  onFocusChange={focusedInput => this.setState({ focusedInput })}
                />
              </div>
              <div className="form-group">
                <a className="btn btn-primary" disabled={disabled} onClick={this.addNewTrip}>Add Trip</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

}