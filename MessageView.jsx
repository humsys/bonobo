import React from 'react'

let CastingButton = ({role, thread, script, cast, userId}) => {
    let title = role,
        roleMembers = thread.roles[role] || {},
        joined = roleMembers[userId],
        roleSpec = script.characters[role] || {},
        desc = roleSpec.description,
        join = () => {
            let confirmed = true
            if (desc) confirmed = confirm(desc)
            if (confirmed) cast(thread, role, true)
        },
        leave = () => {
            if (confirm('Leave this role?')) return cast(thread, role, false)
        }
    if (joined) return <button onClick={leave}>{title} (joined)</button>
    else return <button onClick={join}>Join as <b>{title}</b></button>
}


let Header = ({from, senders=[], thread, group}) => {
    let fromUser = group.members[from]
    return <div className="Section Header">
        From: {fromUser.displayName} <i>{senders.join(', ')}</i>
    </div>
}

let Buttons = (props) => {
    if (!props.casts || !props.casts.length) return
    return <div className="Section Buttons">
        {props.casts.map(r => <CastingButton role={r} {...props} />)}
    </div>
}

const MessageView = (props) => (
    <div className="MessageView Card" onClick={props.onClick}>
        <Header {...props} />
        <div className="Section Body">{props.text}</div>
        <Buttons {...props} />
        {props.children}
    </div>
)

export default MessageView
