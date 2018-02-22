import firebase from 'firebase'
import firebaseui from 'firebaseui'
import { FirebaseAuth } from 'react-firebaseui';

var config = {
  apiKey: "AIzaSyCFDIaAaSSUysBZOHp1HhxEltWktxlh-S4",
  authDomain: "whereisbalboa.firebaseapp.com",
  databaseURL: "https://whereisbalboa.firebaseio.com",
  projectId: "whereisbalboa",
  storageBucket: "whereisbalboa.appspot.com",
  messagingSenderId: "57043097633"
};
var fire = firebase.initializeApp(config);
export default fire;