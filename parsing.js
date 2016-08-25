///**Chatterbase**\\\\What we're going to day is build a little chatroom with _**soft automation**_. What I mean by that, is that we can start a thread in the chatroom that has a script associated with it, and the script says how to guide people along through a set of roles and expectations, using notifications.\\\\Here's an example script:
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
///**Why?**//Our goal is to make it easier for ordinary people to describe a set of social interactions they want automatically facilitated. But with three important qualities:\\- _**Undemanding**_. It should be easy for each participant to do something different than what the script is suggesting to them. We will see if we can handle people accepting roles and then shedding them later, posting data that doesn't fit schemas, and the like.//- _**Grassroots**_. People should be accountable to one another, not to the script. That means that the script mostly makes suggestions, but is not the source of messages and instructions itself. The script and its author are not an authority, but lend authority to the players.//- _**Medium-agnostic**_. Ideally, the system should not assume that everything will be done through it's screen-based interfaces. The same script actions which can be fulfilled via text chat shuld also be fulfillable via direct, in-person interactions that re detected by the system, or through synchronous or asynchronous voice.\\We'll also add some functionality for collecting and processing data from multiple people in the chatroom.\\\\\\\\
///So let's get on with parsing our example script.\\\\**Parser**\\\\We can define a few useful regexes:


let ROLE_IDENT = '([a-zA-Z][a-zA-Z0-9]*)'
let MENTION    = '(@[a-zA-Z][a-zA-Z0-9]*)'
let DELAY      = '(([0-9]+)\\s*(min|minutes|m|days|d|day|minute))'
let RANGE      = '([0-9]+)'
let EMPTY_LINE = /^\s*(\/\/.*)?$/
let SCENE_COMPONENT = `(${ROLE_IDENT}|${DELAY})`

let ROLES      = `(${ROLE_IDENT}(,\\s*${ROLE_IDENT})*)`
let MENTIONS   = new RegExp(`^(${MENTION}\\s*,?\\s*)+`)
let SCENE_COMPONENTS = `(${SCENE_COMPONENT}(,\\s*${SCENE_COMPONENT})*)`

let TITLE      = /^"(.*)"\s*$/
let HINT       = /^\s*\((.*)\)\s*$/
let SCENE      = new RegExp(`^--\\s*${SCENE_COMPONENTS}\\s*--$`)
let CHARACTER  = new RegExp(`^${ROLE_IDENT}\\.\\s+(.*?)$`)
let MESSAGE    = new RegExp(`^${ROLES}:\\s+(.*?)$`)
let CASTBUTTON = new RegExp(`\\[(${RANGE}\\s+)?${ROLE_IDENT}\\]`, 'g')

///and build them into a simple parser
let Parser = {
  inSeconds(n, unit){
    return n * {s: 1, m: 60, h: 60*60, d: 60*60*24}[unit[0]]
  },

  parse(text){
    this.script = { characters: {}, messages: [] }
    var m, hint, scene, conditions = {}

    // first, lines that start with indentation are part of the previous line
    text = text.replace(/:\n[ \t]+(?=[^\s])/g, ': ')
    text = text.replace(/.\n[ \t]+(?=[^\s])/g, '. ')

    // every remaining line should either be:
    text.split(/\n/).forEach(line => {
      if (m = line.match(TITLE)){ // title
        this.script.title = m[1]
      } else if (m = line.match(CHARACTER)){ // character desc
        this.script.characters[m[1]] = { description: m[2] }
      } else if (m = line.match(HINT)){ // notification text
        hint = m[1]
      } else if (m = line.match(SCENE)){ // scene conditional
        let components = m[1]
        components = components.replace(new RegExp(DELAY, 'g'), (_, _2, n, unit) => {
          n = this.inSeconds(n, unit)
          if (conditions.delay) conditions.delay += n
          else conditions.delay = n
          return ''
        })
        components = components.replace(new RegExp(ROLE_IDENT, 'g'), r => {
          conditions[r] = 'exists'
          return ''
        })
      } else if (m = line.match(MESSAGE)){ // template message
        let senders = m[1].split(/,\s*/)
        let text = m[5]
        let recipients = []
        if (m = text.match(MENTIONS)){
          recipients = m[0].match(new RegExp(MENTION, 'g')).map(x => x.slice(1))
          text = text.replace(MENTIONS, '')
        }
        let subconditions = Object.assign({}, conditions)
        let humanSenders = senders.filter(s => s.match(/^[a-z]/) && s !== 'members')
        recipients.concat(humanSenders).forEach(r => subconditions[r] = 'exists')
        let casts = []
        while (m = CASTBUTTON.exec(text)){
          let count = m[1] && m[2]
          let role = m[3]
          casts.push(role)
          if (!this.script.characters[role]) this.script.characters[role] = {}
          if (count){
            this.script.characters[role].min = this.script.characters[role].max = count
          } else {
            if (!this.script.characters[role].min) this.script.characters[role].min = 1
          }
        }
        this.script.messages.push({
          notification: hint,
          conditions: subconditions,
          senders: senders,
          recipients: recipients,
          text: text,
          casts: casts,
          isDraft: senders.length > 1 || !senders[0].match(/^[A-Z]/)
        })
        hint = null
      } else if (!line.match(EMPTY_LINE)){ // or empty/comment
        throw `Unrecognized: ${line}`
      }
    })

    return this.script
  }
}

///Let's see how it runs on our script:
Parser.parse(exampleScript)

export default Parser