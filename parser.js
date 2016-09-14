///So let's get on with parsing our example script.\\\\\\**Parser**\\\\We can define a few useful regexes:

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
let DATA       = /\{([a-zA-Z]+): (.*?)\}/g

///and build them into a simple parser
let Parser = {
  inSeconds(n, unit){
    return n * {s: 1, m: 60, h: 60*60, d: 60*60*24}[unit[0]]
  },

  parseRange(text){
    if (text == '1+') return [1,5000]
    let [min,max] = text.split('-')
    if (!max) return [min, min]
    else return [min, max]
  },

  parseMessage(text){
    var m
    let recipients = [], casts = {}, data = {}
    if (m = text.match(MENTIONS)){
      recipients = m[0].match(new RegExp(MENTION, 'g')).map(x => x.slice(1))
      text = text.replace(MENTIONS, '')
    }
    while (m = CASTBUTTON.exec(text)){
      casts[m[3]] = this.parseRange(m[1] && m[2] || "1+")
    }
    while (m = DATA.exec(text)){
      data[m[1]] = m[2]
    }
    return { recipients, text, casts, data }
  },

  parse(text){
    this.script = { characters: {}, cues: [] }
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
        let { recipients, text, casts, data } = this.parseMessage(m[5])
        let subconditions = Object.assign({}, conditions)
        let humanSenders = senders.filter(s => s.match(/^[a-z]/) && s !== 'members')
        recipients.concat(humanSenders).forEach(r => subconditions[r] = 'exists')
        Object.keys(casts).forEach(role => {
          let count = casts[role]
          if (!this.script.characters[role]) this.script.characters[role] = {}
          if (count){
            this.script.characters[role].min = this.script.characters[role].max = count
          } else {
            if (!this.script.characters[role].min) this.script.characters[role].min = 1
          }
        })
        this.script.cues.push({
          id: this.script.cues.length,
          prompt: hint || null,
          conditions: subconditions,
          senders, recipients, text, casts, data,
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

export default Parser
