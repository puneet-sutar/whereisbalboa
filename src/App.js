import React from 'react'
import Navbar from './Navbar'
import SignInScreen from './SignInScreen'
import firebase from 'firebase'
import fire from './fire'

export default class App extends React.Component {

  state = {
    user: null,
    loading: true,// Local signed-in state.
    users: [],
    trips: [],
  }

  signInSuccess = (user) => {
    // TODO :: add more user info like hometown
    this.setState({ user })
    fire.database().ref(`balboa/users/${user.uid}`).set({
      name: user.name,
      email: user.email,
      uid: user.uid,
    }, () => { this.setState({ loading: false }) });
  }

  componentDidMount = () => {
    firebase.auth().onAuthStateChanged((user) => {
      if(user) {
        this.setState({ user })
      }
      this.setState({ loading: false })
    })
    fire.database().ref('balboa/users').on('child_added', snapshot => {
      const user = {
        ...snapshot.val(),
        imgUrl: "https://firebasestorage.googleapis.com/v0/b/whereisbalboa.appspot.com/o/20180113_182004.jpg?alt=media&token=d80a4c9c-00fb-4f27-b3a0-e346522cd293",
      }
      this.setState({ users: [user, ...this.state.users] }, () => {
        console.log(this.state.users)
      });
    })
    fire.database().ref('balboa/trips').on('child_added', snapshot => {
      const trip = { ...snapshot.val(), id: snapshot.key }
      this.setState({ trips: [trip, ...this.state.trips] }, () => {
        console.log(this.state.trips)
      });
    })
  }

  render(){
    const { user, loading } = this.state
    const containerClassName = this.props.router.isActive("/map") ? "container-fluid" : "container"
    if (loading)
      return <div>Loading...</div>
    else if (user) {
      return (
        <div>
          <Navbar />
          <div className={containerClassName}>
            { React.cloneElement(this.props.children, { ...this.state  }) }
          </div>
        </div>
      )
    } else {
      return <SignInScreen signInSuccess={this.signInSuccess} />
    }

  }
}
