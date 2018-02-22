import React, { Component } from 'react';
import GoogleMapReact from 'google-map-react';
import fire from './fire';
import { find } from 'underscore'
import moment from 'moment'

const AnyReactComponent = ({ text }) => {
  return (
    <div>
      <img src="http://c8.alamy.com/comp/J9C0AC/sheep-face-flat-icon-J9C0AC.jpg"
           eight="20"
           width="20"
           style={{borderRadius: "50%"}} />
      {text}
    </div>
  )
}

const parseTripProp = ({ longitude, latitude, endTimestamp, startTimestamp, ...otherProps }) => {
  return {
    ...otherProps,
    lat: latitude,
    lng: longitude,
    endTime: moment(endTimestamp).format("DD-MMM-YYYY"),
    startTime: moment(startTimestamp).format("DD-MMM-YYYY"),
  }
}
export default class SimpleMap extends Component {

  state = {
    trips: [],
    selectedTrip: null,
  }

  componentWillMount(){
    const tripsRef = fire.database().ref('balboa/trips')
    tripsRef.on('child_added', snapshot => {
      const trip = { ...parseTripProp(snapshot.val()), id: snapshot.key }
      this.setState({ trips: [trip].concat(this.state.trips) }, () => {
        console.log(this.state.trips)
      })
    })
  }

  // TODO : use split coordinates
  static defaultProps = {
    center: {lat: 59.95, lng: 30.33},
    zoom: 0
  }

  onSelectTrip = (trip) => {
    this.setState({ selectedTrip: trip })
  }

  render() {

    const { trips, selectedTrip } = this.state
    const { users } = this.props
    return (
      <div style={ {margin: "0 auto", width: "100%"} }>
        <div className="row">
          <div className="col-sm-9">
            <GoogleMapReact
              defaultCenter={trips[0] || this.props.center}
              defaultZoom={this.props.zoom}
              center={selectedTrip}
            >
              {
                trips.map(({ lat, lng, name, id }) => {
                  return (
                    <AnyReactComponent
                      key={id}
                      lat={lat}
                      lng={lng}
                      text={name}
                    />
                  )
                })}
            </GoogleMapReact>
          </div>
          <div className="col-sm-3">
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
  const { displayName } = user
  let className = "list-group-item"
  if (selectedTrip.id == trip.id) className = `${className} active`
  return (
    <a href="#" onClick={() => onSelectTrip(trip)} className={className}>
      <div className="row">
        <div className="col-sm-3">
          { displayName }
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