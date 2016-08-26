import React from 'react'
import Firebase from 'firebase'

try {
    firebase.app()
} catch (e){
    Firebase.initializeApp({
      apiKey: "AIzaSyBm9oAcCktnQlaxNS1GvyraDGV7QtA6d78",
      authDomain: "bastard-183be.firebaseapp.com",
      databaseURL: "https://bastard-183be.firebaseio.com",
      storageBucket: ""
    })
}

export var loginButtons = <div>
    {
  Firebase.auth().currentUser ? "Logged in" : ['Facebook', 'Google', 'Twitter'].map( m => {
      let meth = firebase.auth[m+"AuthProvider"]
      return <button onClick={ () => firebase.auth().signInWithPopup( new meth() ) }>Join w {m}</button>
    }
  )}
</div>

loginButtons 
    
export default firebase