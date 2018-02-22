import React, { Component } from 'react';
import GoogleMapReact from 'google-map-react';
import fire from './fire';
import { find } from 'underscore'
import moment from 'moment'

const AnyReactComponent = ({ text, isSelectedTrip, $hover }) => {
  let markerSize = 20;
  let otherStyle = {}
  if ($hover || isSelectedTrip) {
    markerSize = 70;
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
    endTime: moment(endTimestamp).format("DD-MMM-YYYY"),
    startTime: moment(startTimestamp).format("DD-MMM-YYYY"),
  }
}
export default class SimpleMap extends Component {

  state = {
    trips: [],
  }

  // TODO : use split coordinates
  static defaultProps = {
    center: {lat: 59.95, lng: 30.33},
    zoom: 0
  }

  getPrasedTrips = () => {
    return this.props.trips.map( trip => parseTripProp(trip))
  }
  onSelectTrip = (trip) => {
    this.setState({ selectedTrip: trip })
  }

  render() {

    const { selectedTrip } = this.state
    const { users } = this.props
    const trips = this.getPrasedTrips()

    return (
      <div style={ {margin: "0 auto", width: "100%"} }>
        <div className="row">
          <div className="col-sm-9">
            <GoogleMapReact
              defaultCenter={this.props.center}
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
                      isSelectedTrip={selectedTrip && selectedTrip.id === id}
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