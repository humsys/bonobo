// let exampleGroup = { id: 'group1', members: { joe: { uid: 'joe', displayName: 'Joe E' } }}
// let y = <MessageView
//             text="Hello there buddy"
//             from="joe"
//             senders={["organizer"]}
//             casts={['alpha', 'beta']}
//             thread={exampleThread}
//             group={exampleGroup}
//             script={script}
//             onCast={(role, joined) => console.log(role,joined)}
//             />

import React from 'react'

let CastingButton = ({role, thread, script, onCast, userId}) => {
    let title = role,
        joined = thread.roles[role][userId],
        desc = script.characters[role].description,
        join = () => {
            let confirmed = true
            if (desc) confirmed = confirm(desc)
            if confirmed onCast(role, true)
        },
        leave = () => {
            if (confirm('Leave this role?')) return onCast(role, false)            
        }
    if (joined) return <button onClick={leave}>{title} (joined)</button>
    else return <button onClick={join}>{title}</button>
}


let Header = ({from, senders, thread, group}) => {
    let fromUser = group.members[fromUser]
    return <div className="Section Header">
        From: {fromUser.displayName} {senders.join(', ')}
    </div>
}

let Buttons = (props) => {
    if (props.casts && props.casts.length){
        return <div className="Section Buttons">
	        {props.casts.map(r => <CastingButton role={r} {...props} />)}
	    </div>
    }
}

export default var MessageView = (props) => (
    <div className="MessageView Card">
        <Header {...props} />
        <div className="Section Body">{props.text}</div>
        <Buttons {...props} />
        {props.children}
    </div>    
)