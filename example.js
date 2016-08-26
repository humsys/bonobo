///**Chatterbase**\\\\What we're going to day is build a little chatroom with _**soft automation**_. What I mean by that, is that we can start a thread in the chatroom that has a script associated with it, and the script says how to guide people along through a set of roles and expectations, using notifications.\\\\Our goal is to make it easier for ordinary people to describe a set of social interactions they want automatically facilitated, and that these interactions might involve collecting and processing data from multiple people in the chatroom. But we want the engine to support:\\- _**Deviance**_. It should be easy for each participant to do something different than what the script is suggesting to them. We will see if we can handle people accepting roles and then shedding them later, posting data that doesn't fit schemas, and the like.//- _**Anarchy**_. People should be accountable to one another, not to the script. That means that the script mostly makes suggestions, but is not the source of messages and instructions itself. The script and its author are not an authority, but lend authority to the players.//- _**De-mediation**_. Ideally, the system should not assume that everything will be done through it's screen-based interfaces. The same script actions which can be fulfilled via text chat shuld also be fulfillable via direct, in-person interactions that are detected by the system, through synchronous or asynchronous voice, or through any other organic means by which the user can carry ou their role.//- _**Counterfaciliation**_. It should be possible for a innovate user to investigate the scripts behind whatever she sees, find out who wrote them, and make edits that run live, in parallel in the same chatroom, that suggest other ways of coordinating.

///Here's an example script:
const exampleScript = `

organizer:
  Who has suggestions for book ideas for our meeting on {date}?

members:
  @organizer What about {bookIdea | members.bookIdea}?


-- 4 days --


organizer:
  Great, lets all read {book | members.bookIdea} for {date}. Who's [attending]?


-- 4 days --


organizer:
  @attending see you all soon! 
`


///Which we can parse like this
import Parser from './parser'
export var parsedExample = Parser.parse(exampleScript)