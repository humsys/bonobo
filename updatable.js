///update an object with support for deep paths
export function update(obj,spec){
  for (var k in spec){
    let parts = k.split('/')
    parts.forEach((c,i) => {
      if (i == parts.length - 1) obj[c] = spec[k]
      else if (!obj[c]) obj[c] = {}
      obj = obj[c]
    })
  }
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
