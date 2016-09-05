///**Chatterbase**\\\\What we're going to day is build a little chatroom with _**soft automation**_. What I mean by that, is that we can start a thread in the chatroom that has a script associated with it, and the script says how to guide people along through a set of roles and expectations, maybe collecting some data, using notifications.\\\\Our goal is to make it easier for ordinary people to describe a set of social interactions they want automatically facilitated. But we want the engine to support:\\- _**Discretion**_. It should be easy for each participant to do something different than what the script is suggesting to them. We will see if we can handle people accepting roles and then shedding them later, posting data that doesn't fit schemas, and the like.//- _**Fellowship**_. People should be accountable to one another, not to the script. That means that the script mostly makes suggestions, but is not the source of messages and instructions itself. The script and its author are not an authority, but lend authority to the players.//- _**Media-Independence**_. Ideally, the system should not assume that everything will be done through it's screen-based interfaces. The same script actions which can be fulfilled via text chat shuld also be fulfillable via direct, in-person interactions that are detected by the system, through synchronous or asynchronous voice, or through any other organic means by which the user can carry ou their role.//- _**Adaptation**_. It should be possible for a innovative user to investigate the scripts behind whatever she sees, find out who wrote them, and make edits that run live, in parallel in the same chatroom, that suggest other ways of coordinating.

///Here's an example script:
const exampleScript = `

organizer:
  Who has suggestions for book ideas for our meeting on {date}?

members:
  @organizer What about {bookIdea | bookIdea}?

-- 4 days --

organizer:
  Great, lets all read {book | bookIdea} for {date}. Who's [attending]?

-- 4 days --

organizer:
  @attending see you all soon!
`


///When parsed, we get an object of characters and cues. Each cue in the script has a set of conditions in which the script should cue a character
import Parser from './parser'
var script = Parser.parse(exampleScript)



///We can then use such a parsed script to generate suggestions for the users in a thread, based on roles they've joined as part of discussing things in the thread.
import suggestions from './suggestions.js'
let exampleThread = {
    id: 'thread1',
    groupId: 'group1',
    ctime: new Date(),
    roles: {
        organizer: { joe: true },
        members: { jim: true }
    },
    script: script
}

suggestions(exampleThread, script, 'joe')
let suggestionsForJim = suggestions(exampleThread, script, 'jim')

///Further below, we'll build a little chatroom interface that lets you do ordinary things\\- send ordinary messages//- start/join groups and threads\\And extraordinary things\\- attach scripts to threads//- join and leave roles as part of a thread//- collect/view thread data//- and follow suggestions\\\\\\In particular, we'll make:

///- a message composer that can show suggestions
import React from 'react'
import MessageComposer from './MessageComposer.jsx'
let x = <MessageComposer
            suggestions={suggestionsForJim}
            send={
            	(thread, text, suggestion) => console.log(text, suggestion)
        	}
            />

///- a message view that supports joining/leaving roles
import MessageView from './MessageView.jsx'
let exampleGroup = { id: 'group1', members: { joe: { uid: 'joe', displayName: 'Joe E' } }}
let exampleMessage = {
    id: 'example01',
    text: "Hello there buddy",
    from: 'joe',
    senders: ["organizer"],
    casts: ['alpha', 'beta']
}
let y = <MessageView
            {...exampleMessage}
            userId="jim"
            thread={exampleThread}
            group={exampleGroup}
            script={script}
            cast={(thread, role, joined) => console.log(role,joined)}
            />
///- a cute way to start threads with or without scripts
import GroupFeed from './GroupFeed.jsx'
exampleThread.messages = { [exampleMessage.id]: exampleMessage }
exampleGroup.threads = { [exampleThread.id]: exampleThread }
let z = <GroupFeed group={exampleGroup} userId="jim" />
///- and a way to view a thread as either messages or data tables
//TBD
