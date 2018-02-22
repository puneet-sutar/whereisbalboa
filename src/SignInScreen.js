import React from 'react'
import fire from './fire'
import { FirebaseAuth } from 'react-firebaseui';
import firebase from 'firebase';

export default class SignInScreen extends React.Component {

  uiConfig = {
    // Popup signin flow rather than redirect flow.
    signInFlow: 'popup',
    // Redirect to /signedIn after sign in is successful. Alternatively you can provide a callbacks.signInSuccess function.
    // We will display Google and Facebook as auth providers.
    signInOptions: [
      {
        provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
      }
    ],
    callbacks: {
      signInSuccess: this.props.signInSuccess,
    },
  };

  render() {
    return (
      <div>
        <h1>My App</h1>
        <p>Please sign-in:</p>
        <FirebaseAuth uiConfig={this.uiConfig} firebaseAuth={firebase.auth()}/>
      </div>
    );
  }
}