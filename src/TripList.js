import React from 'react'
import fire from './fire'
import ReactTable from 'react-table'
import 'react-table/react-table.css'
import Geosuggest from 'react-geosuggest'
import './geosuggest.css'
import 'react-dates/initialize'
import 'react-dates/lib/css/_datepicker.css';
import { DateRangePicker } from 'react-dates';


export default class TripList extends React.Component {

  state = {
    trips: [],
    loading: true,// Local signed-in state.
    form: {},
  }

  componentWillMount(){
    let tripsRef = fire.database().ref('balboa/trips')
    tripsRef.on('child_added', snapshot => {
      let trip = { ...snapshot.val(), uid: snapshot.key }
      this.setState({ trips: [trip].concat(this.state.trips) }, () => {
        console.log(this.state.trips)
      });
    })
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
    const { address: { location, label }, startDate, endDate } = this.state.form
    const disabled = !location || !startDate || !endDate
    if (disabled) return
    const { user: { uid } } = this.props
    const startTimestamp = startDate.unix()
    const endTimestamp = endDate.unix()
    fire.database().ref(`balboa/trips`).push( {
      latitude: location.lat,
      longitude: location.lng,
      name: label,
      startTimestamp,
      endTimestamp,
      uid,
    });
    this.input.clear(); // <- clear the input
  }

  render() {
    const disabled = !this.state.form.address || !this.state.form.address.location
    const { form } = this.state
    const { startDate, endDate } = form

    return (
      <div className="row">
        <div className="co-sm-offset-1 col-sm-10">
          <div className="address form-group">
            <Geosuggest
              ref={(i) => { this.input = i }}
              inputClassName="form-control"
              name="address"
              types={['establishment', 'geocode']}
              placeholder="Enter your address to get suggestions..."
              onSuggestSelect={this.onSuggesSelect} />
          </div>
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
          <div className="form-group">
            <a className="btn btn-primary" disabled={disabled} onClick={this.addNewTrip}>Add Trip</a>
          </div>
        </div>
      </div>
    )
  }

}