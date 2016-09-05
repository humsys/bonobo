let user, data, query;



export function liveData(fbRoot, cb){
  let go = () => {
    cb({user, data})
    if (user && !query){
      query = fbRoot.child('groups').orderByChild(`members/${user.uid}`)
      query.on('value', s => { data = s.val() || {}; go() })
    }
  }
  firebase.auth().onAuthStateChanged(u => { user = u; go() })
  user = firebase.auth().currentUser
  go()
}




export function actions(fbRoot, user){

  let messageFromText = (text) => {
    return {
      id: fbRoot.push().key,
      from: user.uid,
      text: text
    }
  }

  let updateThread = (thread, update) => {
    let thr = fbRoot.child(`groups/${thread.groupId}/threads/${thread.id}`)
    thr.update(update)
    let gr = fbRoot.child(`groups/${thread.groupId}`)
    gr.child(`members/${user.uid}`).set(user)
  }

  return {
    newThread(group, draftText, script = null){
      let msg = messageFromText(draftText)
      let thread = { id: msg.id, groupId: group.id }
      updateThread(thread, {
        id: thread.id,
        groupId: group.id,
        script: script,
        [`messages/${msg.id}`]: msg
      })
    },

    newGroup(){
      let id = fbRoot.push().key
      fbRoot.child(`groups/${id}`).set({ id, members: { [user.uid]: user } })
      return id
    },

    send(thread, draftText, activeSuggestion){
      let msg = messageFromText(draftText)
      if (activeSuggestion){
        msg.suggestionId = activeSuggestion.id
        msg.cueId = activeSuggestion.cue.id
      }
      updateThread(thread, { [`messages/${msg.id}`]: msg })
    },

    cast(thread, role, joining = true){
      updateThread(thread, { [`roles/${role}/${user.uid}`]: joining })
    }
  }

}
