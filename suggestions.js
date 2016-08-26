///**Ok, now for the fun part! **\\\\Let's take a (chatroom thread,  script) pair, and decide what notifications will keep the script moving along in the thread.
function suggestions(thread, script, userId){
	let castAsAnyOf = (roles) => roles.some(r => thread.roles[r][userId])
    let ready = (m) => {
        for (var k in m.conditions){
          // - all roles exist..
          if (m.conditions[k] == 'exists' && !thread.roles[k]) return false
          // - all knowledge known
          if (m.conditions[k] == 'known' && !thread[k]) return false
          // - delay has happened.. 
          if (m.conditions.delay && Date.now() - thread.ctime < m.conditions.delay) return false
          return true
        }
    }

    // every templated message to be authored by a role I'm in whose conditions are met
    return script.cues.filter(m => castAsAnyOf(m.senders) && ready(m)).map(m => ({
        id: `draft-${m.id}-${userId}`,
        cue: m,
        groupId: thread.groupId,
        threadId: thread.id
    }))
}

export default suggestions