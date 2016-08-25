///### Frontend\\### Adding buttons to join roles\\### Adding an empty notification count and screen\\### Adding a script runner\\### Showing notifications based on the thread's script\\### The data view

// UI -- app

let ChatApp = ({viewModel}) => statefulComponent(props => {
  let {dialog, viewing} = props
  let {groupId, threadId} = viewing
  return dialog ||
    (threadId && <MessagesColumn {...props} />) ||
    (groupId  && <ThreadsColumn  {...props} />) ||
    (            <GroupsColumn   {...props} />)
}, viewModel)



// UI -- widgets

let Participants = ({group}) => (
  <div>
    {Object.values(group.members).map(m => <b>{m.displayName}</b>)}
  </div>
)


// UI -- cells


let Message = ({message, group, thread, attachment, cx}) => (
  <div className="card message">
    <div className="main">
      <div className="header">{message.author.displayName}</div>
      <div className="body">{cx.messageBody(message)}</div>
    </div>
    { attachment && <div onClick={attachment.onClick} className="attchment">{attachment.text}</div> }
  </div>
)

let GroupCell = ({group}) => (
  <div
    className="table-view-cell group"
    onClick={() => viewState.update({selectedGroup: group.id})}
    >
    Group: {group.id}
    <Participants group={group}/>
  </div>
)

let ThreadTeaser = ({cx, group, thread}) => {
  let keys = Object.keys(thread._messages || {})
  let firstMessage = keys[0] && thread._messages[keys.sort()[0]]
  return <Message
    cx={cx}
    message={firstMessage || {author:{name:"noone"},text:"nothing"}}
    attachment={{
      text: `${keys.length-1} more messages`,
      onClick: () => viewState.update({selectedThread: thread.id})
    }}
  />
}

let Editor = ({draft, onPost}) => (
  <form className="Editor" onSubmit={ev => { ev.preventDefault(); onPost(ev.target[0].value) } }>
    <input value={draft} onChange={ ev => viewState.update({draft: ev.target.value}) }></input>
  </form>
)



// UI -- pages


let GroupsColumn = (props) => (
  <Column
    title="Your Groups"
    leftButton={['alert', () => viewState.update({showNotifications:true})]}
    rightButton={['add', () => props.cx.newGroup()]}
    >
    <div className="table-view">
      { Object.values(props.groups).map(g => <GroupCell group={g} />) }
    </div>
  </Column>
)

let ThreadsColumn = ({cx, group}) => (
  <Column
    title={<Participants group={group}/>}
    leftButton={['close', () => viewState.update({selectedGroup:null})]}
    rightButton={['add', () => cx.showNewThreadDialog()]}
    >
    {
      Object.values(group.threads || {}).map(
        t => <ThreadTeaser cx={cx} thread={t} group={group} />
      )
    }
  </Column>
)

let MessagesColumn = ({draft, group, thread, cx}) => (
  <Column
    title="Thread"
    leftButton={['close', () => viewState.update({selectedThread:null})]}
    rightButton={['data', () => viewState.update({showData:true})]}
    >
    {
      Object.values(thread._messages || {}).map(
        m => <Message cx={cx} message={m} group={group} thread={thread} />
      )
    }
    <Editor
      draft={draft}
      onPost={
        text => {
          cx.store({ text: text, threadId: thread.id })
          viewState.update({draft:""})
        }
      }/>
  </Column>
)
