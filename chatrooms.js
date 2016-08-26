import {Updatable} from './updatable.js'

///**Let's model a chatroom!**\\\\In order to test this script, we're going to need a kind of a basic model of a chatroom.\\\\Like this one:
class Chatroom {
  constructor(storage){
    this.storage = storage
    this.view = new Updatable({
      draft: { text: "" },
      viewing: { groupId: null, threadId: null }
    })
    storage.on('changes', () => this.refreshView())
    this.view.on('value', (_, changes) => {
      if (changes['viewing/groupId'] || changes['viewing/threadId']){
        this.refreshView()
      }
    })
  }

  refreshView(){
    let {viewing} = this.view
    this.view.update({
      "data/groups": this.storage.groups(),
      "data/group": this.storage.group(viewing.groupId),
      "data/thread": this.storage.thread(viewing.groupId, viewing.threadId)
    })
  }

  newGroup(){
    this.view.update({"viewing/groupId": this.storage.newGroup()})
  }

  post(){
    let {draft, thread, groupId} = this.view.value
    this.storage.post(thread || {groupId}, draft)
    this.view.update({draft: {text: ""}, customEditor: null})
  }
}

///**Backend**\\Here's a function that will take such a model and make sure it's backed by firebase.
class ChatStorage {
  constructor(fbref){
    let user = firebase.auth().currentUser
    this.user = user ? { uid: user.uid, displayName: user.displayName } : {uid: "test", name: "Test User"}
    this.fbref = fbref
    this.data = {}
  }

  on(ev, cb){
    let {fbref, user} = this
    this.query = fbref.child('groups').orderByChild(`members/${user.uid}`)
    this.query.on('value', this.handler = s => cb(this.data = s.val() || {}))
  }

  groups(){ return this.data }
  group(id){ return this.data[id] || {} }
  thread(gid, tid){
    let t = this.group(gid).threads
    return t && t[tid] || {}
  }

  newGroup(){
    let {fbref, user} = this
    let id = fbref.push().key
    fbref.child(`groups/${id}`).set({ id, members: { [user.uid]: user } })
    return id
  }

  post(thread, message){
    if (!message.author) message.author = this.user
    if (!message.id)     message.id     = this.fbref.push().key
    if (!thread.id)      thread.id      = message.id
    message.threadId = thread.id
    let data = { id: thread.id, [`_messages/${message.id}`]: message }
    this.store(thread, data, message)
  }

  store(thread, data, message){
    let {groupId, id} = thread
    if (this.indexer) this.indexer(thread, data, message)
    this.fbref.child(`groups/${groupId}/threads/${id}`).update(data)
  }
}

///**Let's try it out**\\\\First we can try the store:
import firebase, {loginButtons} from './firebase.jsx'
loginButtons
let store = new ChatStorage(firebase.database().ref('chattytest'))
let newGroupId = store.newGroup()
store.post({groupId: newGroupId}, {
    text: "This is a message in a new thread in a new group."
})

///Now we can create a view on it the store and see if we can view our message.
let view = new Chatroom(store)
view.view.update({"viewing/groupId": newGroupId})    