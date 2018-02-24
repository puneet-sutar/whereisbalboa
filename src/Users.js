import React from 'react'
import { sortBy } from 'underscore'

export default ({ users }) => {


  return (
    <div className="user-list">
      <div className="row">
        {
          sortBy([...users, ...users, ...users], 'name').map((user) => {
            return (
              <div className="col-sm-4">
                <UserCard user={user} />
              </div>
            )
          })
        }
      </div>
    </div>
  )
}


const UserCard = ({ user }) => {

  return (
    <div className="panel">
      <div className="panel-body">
        <div className="row  text-center">
          <div className="col-sm-12">
            <ProfileImage user={user} />
          </div>
          <div className="col-sm-12">
            Name: {user.name}
          </div>
          <div className="col-sm-12">
            Whatsapp: {user.whatsapp}
          </div>
          <div className="col-sm-12">
            Email: {user.email}
          </div>
          <div className="col-sm-12">
            Home: {user.cityName}
          </div>
        </div>
      </div>
    </div>
  )
}

const ProfileImage = ({ user }) => {

  return (
    <img src={user.imgUrl || "https://firebasestorage.googleapis.com/v0/b/whereisbalboa.appspot.com/o/Balboa%20Icon.svg?alt=media&token=9aae2d3e-a36e-4ec2-9d7c-d0a80e578fad"} className="profile-image"/>
  )
}