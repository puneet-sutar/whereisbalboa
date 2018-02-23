import React, { Component } from 'react';
import GoogleMapReact from 'google-map-react';
import fire from './fire';
import { find, isEmpty, contains, sortBy } from 'underscore'
import moment from 'moment'
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import DateRangeField from './DateRangeField'

const AnyReactComponent = ({ text, isSelectedTrip, $hover }) => {
  let markerSize = 20;
  let otherStyle = {}
  if ($hover || isSelectedTrip) {
    markerSize = 40;
    otherStyle.zIndex = 1000;
  }
  let pinStyle = {...{
      position: 'absolute',
      width: markerSize,
      height: markerSize,
      left: -markerSize / 2,
      top: -markerSize / 2,
      borderRadius: "50%",
    }, ...otherStyle }


  return (
    <img style={pinStyle} src="https://firebasestorage.googleapis.com/v0/b/whereisbalboa.appspot.com/o/20180113_182004.jpg?alt=media&token=d80a4c9c-00fb-4f27-b3a0-e346522cd293"/>
  )
}

const parseTripProp = ({ longitude, latitude, endTimestamp, startTimestamp, ...otherProps }) => {
  return {
    ...otherProps,
    lat: latitude,
    lng: longitude,
    endTime: moment.unix(endTimestamp).format("DD-MMM-YYYY"),
    startTime: moment.unix(startTimestamp).format("DD-MMM-YYYY"),
    startTimestamp,
    endTimestamp,
  }
}
export default class SimpleMap extends Component {

  state = {
    trips: [],
    filters: {},
    timelineTrips: []
  }

  timelineTimer = null

  // TODO : use split coordinates
  static defaultProps = {
    center: {lat: 59.95, lng: 30.33},
    zoom: 0
  }

  getFilterTrips = () => {
    const { users, dateRange } = this.state.filters
    let { trips } = this.props
    if (users && !isEmpty(users)) {
      const userUids = users.map(user => user.value)
      trips = trips.filter(trip => contains(userUids, trip.uid))
    }

    if (dateRange && dateRange.startDate) {
      const startTimestamp = dateRange.startDate.unix()
      trips = trips.filter(trip => (trip.startTimestamp >= startTimestamp))
    }

    if (dateRange && dateRange.endDate) {
      const endTimestamp = dateRange.endDate.unix()
      trips = trips.filter(trip =>(trip.startTimestamp <= endTimestamp))
    }
    return trips
  }

  getPrasedTrips = () => {
    return sortBy(this.getFilterTrips(), 'startTimestamp').map( trip => parseTripProp(trip))
  }
  onSelectTrip = (trip) => {
    this.setState({ selectedTrip: trip })
  }

  onFilterChange = (event) => {
    console.log(event)
    const { target: { name, value } } = event
    const { filters } = this.state
    this.setState({ filters: { ...filters, [name]: value } })
  }

  onFilterClear = () => {
    this.setState({ filters: {} })
  }

  onShowTimeline = () => {
    this.setState({ timelineTrips: [] })
  }

  userWithTrips = () => {
    const userUidsWithTrips = this.props.trips.map(trip => trip.uid)
    return this.props.users.filter((user) => contains(userUidsWithTrips, user.uid))
  }

  render() {

    const { selectedTrip, filters } = this.state
    const { users } = this.props
    const trips = this.getPrasedTrips()

    return (
      <div style={ {margin: "0 auto", width: "100%"} }>
        <div className="row">
          <div className="col-sm-12">
            <Filters onChange={this.onFilterChange}
                     users={this.userWithTrips()}
                     value={filters}
                     onClear={this.onFilterClear}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-sm-9">
            <GoogleMapReact
              defaultCenter={this.props.center}
              defaultZoom={this.props.zoom}
              center={selectedTrip}
              options={{fullscreen: true}}
            >
              {
                trips.map(({ lat, lng, name, id }) => {
                  return (
                    <AnyReactComponent
                      key={id}
                      lat={lat}
                      lng={lng}
                      text={name}
                      isSelectedTrip={selectedTrip && selectedTrip.id === id}
                    />
                  )
                })}
            </GoogleMapReact>
          </div>
          <div style={{padding: 0}} className="col-sm-3">
            <TripList trips={trips} users={users} selectedTrip={selectedTrip} onSelectTrip={this.onSelectTrip}/>
          </div>
        </div>
      </div>
    );
  }
}

const TripList = (props) => {
  const { trips } = props

  return (
    <ul className="list-group">
      {
        trips.map((trip) => {
          return <TripItem {...props} trip={trip} key={trip.id} />
        })
      }
    </ul>
  )

}

const TripItem = ({ trip, users, onSelectTrip, selectedTrip }) => {
  const user = find(users, user => trip.uid === user.uid)
  const { name, lat, lng, endTime, startTime } = trip
  if (!user || !trip) return null
  selectedTrip = selectedTrip || {}
  const { name: userName } = user

  let className = "list-group-item"
  if (selectedTrip.id == trip.id) className = `${className} active`
  return (
    <a href="#" onClick={() => onSelectTrip(trip)} className={className} style={{borderRadius: 0}}>
      <div className="row">
        <div className="col-sm-3">
          { userName }
        </div>
        <div className="col-sm-9">
          <div className="col-sm-12">
            { name }
          </div>
          <div className="col-sm-12">
            { startTime } - { endTime }
          </div>
        </div>
      </div>
    </a>
  )
}


const Filters = ({ users, onChange, value, onClear }) => {

  return (
    <div>
      <h1>Filters</h1>
      <div className="row">
        <div className="col-sm-3">
          <UserFilter value={value.users} users={users} onChange={onChange} />
        </div>
        <div className="col-sm-3">
          <DateFilter value={value.dateRange} onChange={onChange} />
        </div>
        <div className="col-sm-1">
          <a href="#clear" onClick={onClear} style={{fontSize: 20, color: "red"}}>
            <span className="glyphicon glyphicon-remove-circle" />
          </a>
        </div>
        <div className="col-sm-1">
          <a href="#clear" className="btn btn-primary">
            Timeline
          </a>
        </div>
      </div>
    </div>
  )
}

const UserFilter = ({ value, users, onChange }) => {

  const options = users.map(
    (user) => {
      return { value: user.uid, label: user.name }
    }
  )
  return (
    <Select
      name="users"
      value={value}
      onChange={selectedOptions => onChange({ target: { name: "users", value: selectedOptions} })}
      multi
      options={options}
    />
  )
}

const DateFilter = ({ value, onChange }) => {

  return (
    <DateRangeField
      value={value}
      name="dateRange"
      onChange={onChange}
    />
  )
}

