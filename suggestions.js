///**Generating suggestions**\\\\We take a (chatroom thread, script) pair, and decide what notifications will keep the script moving along in the thread.
function suggestions(thread, script, userId){
	let castAsAnyOf = (roles) => roles.some(r => thread.roles[r][userId])
    let ready = (m) => { ///Conditions for a particular cue are met if:
        ///- any requested delay has elapsed
        if (m.conditions.delay){
          if (Date.now() - thread.ctime < m.conditions.delay) return false
        }
        for (var k in m.conditions){
          let c = m.conditions[k]
          ///- all necessary roles are casted
          if (c == 'exists' && !thread.roles[k]) return false
          ///- all necessary knowledge is known
          if (c == 'known' && !thread[k]) return false
          return true
        }
    }

    return script.cues.filter(m => castAsAnyOf(m.senders) && ready(m)).map(m => ({ ///So cues cause suggestions when their conditions are met and the user is one of the senders
        id: `draft-${m.id}-${userId}`,
        cue: m,
        groupId: thread.groupId,
        threadId: thread.id
    }))
}

export default suggestions