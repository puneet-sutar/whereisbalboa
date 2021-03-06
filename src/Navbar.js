import React from 'react'
import NavLink from './NavLink'

const Navbar = () => {
  return (
    <nav className="navbar navbar-primary">
      <div className="container-fluid">
        <div className="navbar-header">
          <NavLink className="navbar-brand" to="/" onlyActiveOnIndex>WhereIsBalboa</NavLink>
        </div>
        <ul className="nav navbar-nav">
          <li><NavLink to="/" onlyActiveOnIndex>Home</NavLink></li>
          <li><NavLink to="/Profile">Profile</NavLink></li>
          <li><NavLink to="/map">Global Map</NavLink></li>
          <li><NavLink to="/triplist">Trip List</NavLink></li>
          <li><NavLink to="/balbabes">Balbabes</NavLink></li>
        </ul>
      </div>
    </nav>
  )
};
export default Navbar;