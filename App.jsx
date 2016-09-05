import React from 'react'
import Firebase from 'firebase'
import {liveData, actions} from './storage.js'
import GroupsList from './GroupsList.jsx'

try { firebase.app() } catch (e){
  Firebase.initializeApp({
    apiKey: "AIzaSyBm9oAcCktnQlaxNS1GvyraDGV7QtA6d78",
    authDomain: "bastard-183be.firebaseapp.com",
    databaseURL: "https://bastard-183be.firebaseio.com",
    storageBucket: ""
  })
}

const LoginButtons = () => (
  <div>{
    Firebase.auth().currentUser ? "Logged in" : ['Facebook', 'Google', 'Twitter'].map( m => {
        let meth = firebase.auth[m+"AuthProvider"]
        return <button onClick={ () => firebase.auth().signInWithPopup( new meth() ) }>Join w {m}</button>
      }
    )}
  </div>
)

const FB_ROOT = firebase.database().ref('chattytest')

export default class ChatterbaseApp extends React.Component {
  constructor(p){ super(p); this.state = {} }
  componentWillMount(){ liveData(FB_ROOT, s => this.setState(s)) }
  render(){
    let {user, groups} = this.state
    if (!user) return <LoginButtons />
    let actionMethods = actions(FB_ROOT, {
      uid: user.uid,
      displayName: user.displayName
    })
    return <GroupsList groups={groups||{}} userId={user.uid} {...actionMethods} />
  }
}
