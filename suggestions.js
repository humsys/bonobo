///**Generating suggestions**\\\\We take a (thread, script, userId) pair, and decide what notifications to that user will keep the script moving along in the thread.
function suggestions(thread, script, userId){
	let castAsAnyOf = (roles) => roles.some(r => thread.roles[r][userId])
    return script.cues.filter(m => {
      ///Each notification relates to a cue from the script. Conditions for a particular cue are met if:
      if (!castAsAnyOf(m.senders)) return false
        ///- any requested delay has elapsed
        if (m.conditions.delay){
          if (Date.now() - thread.ctime < m.conditions.delay) return false
        }
        for (var k in m.conditions){
          ///- all necessary roles are casted
          if (m.conditions[k] == 'exists' && !thread.roles[k]) return false
          ///- all necessary knowledge is known
          if (m.conditions[k] == 'known' && !thread[k]) return false
          return true
        }
      return true
    }).map(m => ({ ///So cues cause suggestions when their conditions are met and the user is one of the senders
        id: `draft-${m.id}-${userId}`,
        cue: m,
        groupId: thread.groupId,
        threadId: thread.id
    }))
}

export default suggestions