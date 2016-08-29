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

let Header = ({from, senders, thread, group}) => {
    
}

let Buttons = ({thread, casts, script, onCast}) => {
    
}

let Body = ({text}) => (
)

export default var MessageView = (props) => (
    
)

class MessageComposer extends React.Component {