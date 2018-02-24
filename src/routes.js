import React from 'react'
import { Route, IndexRoute } from 'react-router'
import App from './App'
import About from './About'
import Repos from './Repos'
import Repo from './Repo'
import Home from './Home'
import TripList from './TripList'
import UserMap from './UserMap'
import Profile from './Profile'
import Users from './Users'

export default (
  <Route path="/" component={App}>
    <IndexRoute component={Home}/>
    <Route path="/map" component={UserMap}/>
    <Route path="/triplist" component={TripList}/>
    <Route path="/profile" component={Profile}/>
    <Route path="/balbabes" component={Users}/>
  </Route>
)
