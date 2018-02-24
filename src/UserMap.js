import React, { Component } from 'react';
import GoogleMapReact from 'google-map-react';
import fire from './fire';
import { find, isEmpty, contains, sortBy, last, first } from 'underscore'
import moment from 'moment'
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import DateRangeField from './DateRangeField'
import Navlink from './NavLink'

const AnyReactComponent = ({ text, isSelectedTrip, $hover, user }) => {
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
    <img style={pinStyle} src={user.imgUrl}/>
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
    timelineTrips: [],
    timelineMode: false,
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

    const userUidWithTrips = this.userWithTrips().map(user => user.uid)

    trips = trips.filter(trip => contains(userUidWithTrips, trip.uid))
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
    const { filters, timelineMode } = this.state
    if (timelineMode) return
    this.setState({ filters: { ...filters, [name]: value } })
  }

  onFilterClear = () => {
    this.setState({ filters: {} })
  }

  onToggleTimeline = () => {
    const { timelineMode } = this.state
    if (timelineMode) {
      this.setState({ timelineTrips: [], timelineMode: false  })
      clearInterval(this.timelineTimer)
    } else {
      this.setState({ timelineTrips: [first(this.getPrasedTrips())], timelineMode: true  })
      this.timelineTimer = setInterval(this.onTimelineTick, 2000)
    }

  }

  onTimelineTick = () => {
    // Imporve timeline algo to use stack
    const trips = this.getPrasedTrips()
    const { timelineTrips } = this.state
    if (timelineTrips.length < trips.length) {
      this.setState({ timelineTrips: [...timelineTrips, trips[timelineTrips.length]] })
    } else {
      this.setState({ timelineTrips: [], timelineMode: false  })
      clearInterval(this.timelineTimer)
    }
  }

  togglePostRYMode = () => {
    const startDate = moment("03-04-2018", "MM-DD-YYYY")
    const endDate = null
    this.onFilterChange({ target: { name: "dateRange", value: { startDate, endDate }} })
  }

  toggleRYMode = () => {
    const startDate = moment("03-04-2017", "MM-DD-YYYY")
    const endDate = moment("03-03-2018", "MM-DD-YYYY")
    this.onFilterChange({ target: { name: "dateRange", value: { startDate, endDate }} })
  }

  userWithTrips = () => {
    const userUidsWithTrips = this.props.trips.map(trip => trip.uid)
    return this.props.users.filter((user) => contains(userUidsWithTrips, user.uid))
  }

  render() {

    const { filters, timelineMode, timelineTrips } = this.state
    let { selectedTrip } = this.state
    const { users } = this.props
    const trips = timelineMode ? timelineTrips : this.getPrasedTrips()
    selectedTrip = timelineMode ? last(timelineTrips) : (selectedTrip || trips[0])

    return (
      <div className="user-map">
        <div className="row">
          <div className="col-sm-12">
              <div className="panel-body">
                <Filters onChange={this.onFilterChange}
                         users={this.userWithTrips()}
                         value={filters}
                         onClear={this.onFilterClear}
                         onToggleTimeline={this.onToggleTimeline}
                         toggleRYMode={this.toggleRYMode}
                         togglePostRYMode={this.togglePostRYMode}
                         timelineMode={timelineMode}
                />
              </div>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-9 google-map-container">
            <div className="google-map">
              <GoogleMapReact
                defaultCenter={this.props.center}
                defaultZoom={this.props.zoom}
                center={selectedTrip}
                options={{fullscreen: true}}
              >
                {
                  trips.map(({ lat, lng, name, id, uid }) => {
                    const user = find(users, user => uid === user.uid)
                    return (
                      <AnyReactComponent
                        key={id}
                        lat={lat}
                        lng={lng}
                        text={name}
                        user={user}
                        isSelectedTrip={selectedTrip && selectedTrip.id === id}
                      />
                    )
                  })}
              </GoogleMapReact>
            </div>
          </div>
          <div style={{padding: 0}} className="col-sm-3">
            <TripList key={timelineMode} trips={trips} users={users} selectedTrip={selectedTrip} onSelectTrip={this.onSelectTrip}/>
          </div>
        </div>
      </div>
    );
  }
}

const TripList = (props) => {
  const { trips } = props

  return (
    <ul className="list-group trip-list">
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
  const { name: userName, imgUrl } = user

  let className = "list-group-item"
  if (selectedTrip.id == trip.id) className = `${className} active`
  return (
    <a href="#" onClick={() => onSelectTrip(trip)} className={className} style={{borderRadius: 0}}>
      <div className="row">
        <div className="col-sm-2">
          <img src={imgUrl} style={{ width: 50, height: 50, borderRadius: "50%", border: "#eee solid thin" }} alt={userName} />
        </div>
        <div className="col-sm-10">
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


const Filters = ({ users, onChange, value, onClear, onToggleTimeline, toggleRYMode, togglePostRYMode, timelineMode }) => {

  return (
    <div className="map-filters">
      <div className="row">
        <div className="col-sm-1">
          <Navlink to="/" className="btn btn-warning">
            <span className="glyphicon glyphicon-home" /> Home
          </Navlink>
        </div>
        <div className="col-sm-3">
          <UserFilter value={value.users} users={users} onChange={onChange} />
        </div>
        <div className="col-sm-3">
          <DateFilter value={value.dateRange} onChange={onChange} />
        </div>
        <div className="col-sm-4">
          <div className="btn-toolbar">
            <div className="btn-group">
              <button onClick={toggleRYMode} className="btn btn-primary">
                RY
              </button>
            </div>
            <div className="btn-group">
              <button onClick={togglePostRYMode} className="btn btn-primary">
                Post RY
              </button>
            </div>
            <div className="btn-group">
              <button onClick={onClear} className="btn btn-danger">
                <div className="glyphicon glyphicon-remove" /> Clear Filters
              </button>
            </div>
            <div className="btn-group">
              {
                !timelineMode && <button onClick={onToggleTimeline} className="btn btn-success">
                  <div className="glyphicon glyphicon-play" /> Play Timeline
                </button>
              }
              {
                timelineMode && <button onClick={onToggleTimeline} className="btn btn-danger">
                  <div className="glyphicon glyphicon-stop" /> Stop Timeline
                </button>
              }
            </div>
          </div>
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

