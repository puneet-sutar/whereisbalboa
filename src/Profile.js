import React from 'react'
import Geosuggest from 'react-geosuggest'
import fire from './fire'
import moment from 'moment'
import toastr from 'toastr'
import "toastr/build/toastr.css"

export default class Profile extends React.Component {

  state = {

  }

  onSuggesSelect = (data) => {
    console.log(data)
    if (!data) {
      this.setState({
        cityName: null,
        latitude: null,
        longitude: null,
      })
    } else {
      this.setState({
        cityName: data.label,
        latitude: data.location.lat,
        longitude: data.location.lng,
      })
    }

  }

  onSubmit = () => {
    const uploadedFile = document.getElementById('profileImage').files[0];
    if (uploadedFile) {
      const storageRef = fire.storage().ref().child(`${moment().unix()}-${uploadedFile.name}`)
      storageRef.put(uploadedFile).then((snapshot) => {
        this.setState({ imgUrl: snapshot.downloadURL }, () => {
          this.uploadProfileData()
        })
      });
    } else {
      this.uploadProfileData()
    }
  }

  uploadProfileData = () => {
    const { user } = this.props
    const update = {uid: user.uid}
    let { name, cityName, imgUrl, latitude, longitude } = this.state
    if (name) update.name = name
    if (cityName) update.cityName = cityName
    if (imgUrl) update.imgUrl = imgUrl
    if (latitude) update.latitude = latitude
    if (longitude) update.longitude = longitude
    fire.database().ref(`balboa/users/${user.uid}`).update(update, () => {
      toastr.success('Profile info updated successfully!')
    });
  }

  onChange = (event) => {
    const { name, value } = event.target
    this.setState({ [name]: value })
  }

  render () {

    let { name, cityName, imgUrl } = this.state
    const user = this.props.users.filter(u => u.uid === this.props.user.uid)[0] || {}
    name = name || user.name
    cityName = cityName || user.cityName
    imgUrl = imgUrl || user.imgUrl

    return (
      <div className="profile">
        <h3 className="text-center">View and update your profile info</h3>
        <div className="row">
          <div className="col-sm-6 col-sm-offset-3">
            <div className="panel panel-default">
              <div className="panel-body">
                <div className="row">
                  <div className="col-sm-12 text-center">
                    <img src={imgUrl} className="profile-image"/>
                  </div>
                  <div className="col-sm-12">
                    <div className="form-group">
                      <label className="control-label">Name</label>
                      <input type="text" onChange={this.onChange} value={name} name="name" className="form-control"/>
                    </div>
                  </div>
                  <div className="col-sm-12">
                    <div className="form-group">
                      <label className="control-label">City</label>
                      <Geosuggest
                        ref={(i) => { this.input = i }}
                        inputClassName="form-control"
                        initialValue={cityName}
                        name="address"
                        types={['establishment', 'geocode']}
                        placeholder="Enter your address to get suggestions..."
                        onSuggestSelect={this.onSuggesSelect} />
                    </div>
                  </div>
                  <div className="col-sm-12">
                    <div className="form-group">
                      <label className="control-label">Profile Image</label>
                      <input type="file" id="profileImage" name="profileImage" className="form-control"/>
                    </div>
                  </div>
                  <div className="col-sm-12">
                    <div className="form-group">
                      <button className="btn btn-primary" onClick={this.onSubmit}>
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

}