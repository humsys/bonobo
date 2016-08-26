///**Ok, now for the fun part! **\\\\Let's take a (chatroom thread,  script) pair, and decide what notifications will keep the script moving along in the thread.
function suggestions(thread, script, userId){
	let castAsAnyOf = (roles) => roles.some(r => thread.roles[r][userId])
    let ready = (m) => {
        for (var k in m.conditions){
          // - all roles exist..
          if (m.conditions[k] == 'exists' && !thread[k]) return false
          // - delay has happened.. TODO
          // - relevant data is known.. TODO
          return true
        }
    }

    // every templated message to be authored by a role I'm in whose conditions are met
    script.messages.filter(m => castAsAnyOf(m.from) && ready(m)).map(m => ({
        id: `draft-${m.templateNo}-${userId}`,
        templateNo: m.templateNo,
        groupId: group.id,
        threadId: thread.id
    }))
}

import {parsedExampleScript} from './example.js'
let exampleThread = {
    roles: {
        organizer: { joe: true },
        members: { jim: true }
    }    
}

suggestions(exampleThread, parsedExampleScript, 'joe')
suggestions(exampleThread, parsedExampleScript, 'jim')

export default suggestions