///**Chatterbase**\\\\Today we are going to build a little chatroom with _**declarative social**_ and _**soft automation**__._\\- _**Declarative Social**__._ We separate out a certain kind of logic from the rest of the code, and make it declarative, easy to understand, and editable by users. What we'll separate out in this way is the _social flow_ of the software: the specification for which information is collected, from which users, who gets shown what, who gets notified, what all the roles and expectations are, and the timing for all of the above. We will put this information in an editable script (like this one) and that script will drive the rest of the software.

/// 
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
///- Second, we make sure that this script is never _in charge_. Instead, the script will be used to make suggestions which the user can follow. But the user is always free to submit some _other_ data, send it to some _other_ person, or even to rewrite the script so the roles and rules change completely.\\\\**Motivation—the tyrranies of messaging and the tyrranies of automation** \\\\Most things that are accomplished by social software could be done by hand just using messaging—you could run a book club, organize 1000 workers in a construction site, or run a dating site just by using something like facebook messenger. You’d have to collect tasks and photos and profiles and everything by hand and forward them around, and so on. This would be awful. The tyrannies of coordination via messaging include:\\- **Endless checking,** to move things along,//- **Can’t get an overview**//- Interactions are limited to **short term utterances **rather than** long-term plans**//- And because there's no explicit process that means://- You're always **starting from scratch**,//- No **clarity about ongoing roles**,//- There are **covert, unintentional power dynamics**,//- There's nowhere to encode **organizational wisdom about process**\\But the automation of our lives—via bots or other social software—is awful in it’s own way. The tyrannies of bots include:\\- **Rigidity**. It's difficult for participants to do something different than what the script assumes, or to post data that doesn't fit schemas.//- _**Impersonal Authority**_. People report to the script or to dashboards, rather than to one another. The script becomes an awful authority. No one feels responsible for the broader goal, or to each other.//- _**Overmediation**_. These systems assume everything will be done through their screen-based interfaces. Simple social actions can't happen naturally through convesation in-person because they won't advance the script.//- _**Esoterism**_. Users with better ideas often can't change the way the automation works, or suggest alternatives, or even see the overall gist of the automation.\\The goals of soft automation is to be free both from the _tyrannies of messaging_ and from _the tyrannies of conventional automation_.\\**An approach to software** It's likely that the approach here can applied very broadly: most social software is a kind of automated conversation between multiple parties. Usually the conversational nature of software is obscured because the participants are filling out forms or using widgets instead of typing sentences. But it's likely that most software could be decomposed cleanly into three different kinds of specifications:\\- declarative views for data and UI//- numerical algorithms//- routing information about which information to collect, when, from who, and who else should see it\\If that's true, an approach that works for soft automation in chat could—if augmented with other systems for declaring views on data and for making pure function algorithms—show us how to soften automation everywhere.\\\\



///**Soft automation in chat**\\\\So here's what it means for chat: with soft automation, we can start a thread in the chatroom that has a script associated with it, and the script says how to guide people along through a set of roles and expectations, maybe collecting some data, using notifications.\\Our goal is to make it easier for ordinary people to describe a set of social interactions they want automatically facilitated. To avoid the pitfalls above, our engine must support:\\- _**Discretion**_. It should be easy for each participant to do something different than what the script is suggesting to them. We will see if we can handle people accepting roles and then shedding them later, posting data that doesn't fit schemas, and the like.//- _**Fellowship**_. People should be accountable to one another, not to the script. That means that the script mostly makes suggestions, but is not the source of messages and instructions itself. The script and its author are not an authority, but lend authority to the players.//- _**Media-Independence**_. Ideally, the system should not assume that everything will be done through it's screen-based interfaces. The same script actions which can be fulfilled via text chat shuld also be fulfillable via direct, in-person interactions that are detected by the system, through synchronous or asynchronous voice, or through any other organic means by which the user can carry ou their role.//- _**Adaptation**_. It should be possible for a innovative user to investigate the scripts behind whatever she sees, find out who wrote them, and make edits that run live, in parallel in the same chatroom, that suggest other ways of coordinating.\\

///**Our strategy**\\\\To accomplish this, we will:\\- Separate out the part of programming that concerns **conversation flow** and **data collection/distribution** into a script which everyone can understand and modify//- Show all users easy-to-understand representations of the program state: as either **a thread of chat messages/actions**, and as **a browsable database**.//- Limit the script to making **suggestions** as to what kind of data each user should share or forward around to other users, so that no one has to interact directly with the script, or interact in a way that rigidly follows its expectations//- Design the script format so that **the same script lines can automate interactions across several mediums**: text chat, video chat, VR, and most importantly just crossing the room to talk with your colleagues\\Let’s begin.\\

///Here's an example script:



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

///Together in an app:
import App from './App.jsx'
let a = <App/>