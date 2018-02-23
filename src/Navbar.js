import React from 'react'
import NavLink from './NavLink'

const Navbar = () => {
  return (
    <nav className="navbar navbar-default">
      <div className="container-fluid">
        <div className="navbar-header">
          <NavLink className="navbar-brand" to="/" onlyActiveOnIndex>WhereIsBalboa</NavLink>
        </div>
        <ul className="nav navbar-nav">
          <li><NavLink to="/" onlyActiveOnIndex>Home</NavLink></li>
          <li><NavLink to="/triplist">Trip List</NavLink></li>
          <li><NavLink to="/map">Global Map</NavLink></li>
        </ul>
      </div>
    </nav>
  )
};
export default Navbar;