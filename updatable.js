///update an object with support for deep paths
export function update(obj,spec){
  for (var k in spec){
    let parts = k.split('/')
    let child = obj
    parts.forEach((c,i) => {
      if (i == parts.length - 1) child[c] = spec[k]
      else if (!child[c]) child[c] = {}
      child = child[c]
    })
  }
  return obj
}


///update an object and trigger listeners
export class Updatable {
  constructor(v={}){ this.value = v; this.listeners = [] }
  on(ev, cb){ this.listeners.push(cb) }
  off(ev, cb){ this.listeners.splice(this.listeners.find(cb), 1) }
  update(spec, wasUpdating=this.updating){
    update(this.value, spec)
    Object.assign(this, this.value)
    if (wasUpdating) return
    this.updating = true
    this.listeners.forEach(l => l(this.value, spec))
    this.updating = wasUpdating
  }
}

update({}, {
    "a": "5",
    "data/a": "1",
    "data/b": "2",
    "data/c": "4"
})