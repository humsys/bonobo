import Parser from './parser.js'

let user, groups, query, m;

// support test users
if (m = location.hash.match(/\((.*?);(.*?)\)/)){
  console.log('matched!', m)
  user = { uid: m[1], displayName: m[2] }
}


export function liveData(fbRoot, cb){
  let go = () => {
    cb({user, groups})
    if (user && !query){
      query = fbRoot.child('groups').orderByChild(`members/${user.uid}`)
      query.on('value', s => { groups = s.val() || {}; go() })
    }
  }
  if (!user) {
    firebase.auth().onAuthStateChanged(u => { user = u; go() })
    user = firebase.auth().currentUser
  }
  go()
}

export function actions(fbRoot, user){

  let messageFromText = (text) => {
    let msg = Parser.parseMessage(text)
    msg.id = fbRoot.push().key
    msg.from = user.uid
    return msg
  }

  let updateThread = (thread, update) => {
    let thr = fbRoot.child(`groups/${thread.groupId}/threads/${thread.id}`)
    update.mtime = Date.now()
    thr.update(update)
    let gr = fbRoot.child(`groups/${thread.groupId}`)
    gr.update({
      [`members/${user.uid}`]: user,
      mtime: Date.now()
    })
  }

  return {
    newThread(group, draftText, script = null){
      let msg = messageFromText(draftText)
      let thread = {
        id: msg.id,
        groupId: group.id,
        script: script && Parser.parse(script),
        roles: { organizer: { [user.uid]: true } },
        ctime: Date.now(),
        mtime: Date.now()
      }
      if (draftText) thread[`messages/${msg.id}`] = msg
      updateThread(thread, thread)
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
      let update = { [`messages/${msg.id}`]: msg }
      for (var k in msg.data) update[`data/${k}/${user.uid}`] = msg.data[k]
      updateThread(thread, update)
    },

    cast(thread, role, joining = true){
      updateThread(thread, { [`roles/${role}/${user.uid}`]: joining })
    }
  }

}
