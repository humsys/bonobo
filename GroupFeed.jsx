import React from 'react'
import MessageView from './MessageView.jsx'
import MessageComposer from './MessageComposer.jsx'
import suggestions from './suggestions.js'



////


const Table = ({data, users}) => (
  <div className="table">
    {
      Object.keys(data).map(
        key => (
          <div className="Row">
            <b>{key}</b>
            <ul>{
              Object.keys(data[key]).map(
                uid => <li>{users[uid].displayName}: {data[key][uid]}</li>
              )
            }</ul>
          </div>
        )
      )
    }
  </div>
)

class ThreadViewer extends React.Component {
  constructor(p){ super(p); this.state = { showingData: false } }
  render(){
    let {messages={}, onClose, thread, script, userId, group} = this.props
    if (this.state.showingData) return <div className="Screen">
        <header className="bar bar-nav">
            <h1 className="title"> Data </h1>
            <button className="btn pull-left" onClick={() => this.setState({showingData:false})}> Close </button>
        </header>
        <div className="content">
          <h2>Roles</h2>
          <Table data={thread.roles} users={group.members} />
          <h2>Data</h2>
          <Table data={thread.data} users={group.members} />
        </div>
    </div>

    else return <div className="Screen">
        <header className="bar bar-nav">
            <h1 className="title"> Thread </h1>
            <button className="btn pull-left" onClick={onClose}> Close </button>
            <button className="btn pull-right" onClick={() => this.setState({showingData:true})}> Data </button>
        </header>
        <div className="content">{
            Object.values(messages).map(m => <MessageView {...m} {...this.props} />)
        }</div>
        <MessageComposer {...this.props} suggestions={suggestions(thread, script, userId)} />
    </div>
  }
}



////


const ThreadTeaser = (props) => {
    let {thread} = props
    let messageIds = Object.keys(thread.messages || {}).sort()
    let firstMessage = thread.messages && thread.messages[messageIds[0]]
    if (!firstMessage){
      return <div className="MessageView">
        <div className="Card" onClick={props.onClick}>
            <div className="MainSection Body">...</div>
        </div>
        <div className="CardFooter">
          new; <i>{new Date(thread.ctime).toLocaleString()}</i>
        </div>
      </div>
    }
    return <MessageView {...firstMessage}
               script={thread.script}
               {...props}>
     <div className="CardFooter">
       {messageIds.length - 1} replies; <i>{new Date(thread.ctime).toLocaleString()}</i>
     </div>
    </MessageView>
}

class ThreadComposer extends React.Component {
    constructor(props){
        super(props)
        this.state = { draftText: "" }
    }

    render(){
        let {draftText=""} = this.state
        let {group, userId, newThread} = this.props
        return <form className="row Palette">
            <input
                value={draftText}
                onChange={ ev => this.setState({draftText: ev.target.value}) }
                placeholder="Type a message..."
            />
            <button onClick={ev => {
                ev.preventDefault()
            	if (!draftText) return
		        newThread(group, draftText)
        		this.setState({ draftText: "" })
            }}>Submit</button>
            <button onClick={ev=>{
                ev.preventDefault()
                let script = prompt('Enter a script!')
                newThread(group, draftText, script)
                this.setState({ draftText: "" })
            }}>Start script</button>
        </form>
    }
}

export default class GroupFeed extends React.Component {
    constructor(props){
        super(props)
        this.state = { selectedThreadId: null }
    }

    render(){
        let {group, onClose} = this.props
        let {members} = group
        let {selectedThreadId} = this.state
        if (selectedThreadId){
          let selectedThread = group.threads[selectedThreadId]
            return <ThreadViewer
                       thread={selectedThread}
                       {...selectedThread}
                       {...this.props}
                       onClose={ () => this.setState({selectedThreadId:null}) }
                       />
        }
        let orderedThreads = Object.values(group.threads || {}).sort(
          (a, b) => ((b.mtime||0) - (a.mtime||-10))
        )
        return <div className="Screen">
            <header className="bar bar-nav">
           		<h1 className="title">
                    {group.id}
                    <p>
                        {Object.values(members).map(m => <b>{m.displayName}</b>)}
                    </p>
                    <button className="btn pull-left" onClick={onClose}> Close </button>
            	</h1>
            </header>
            <div className="content">
                <ThreadComposer {...this.props} />
                {
                    orderedThreads.map(th => (
                        <ThreadTeaser
                            thread={th}
                            onClick={() => this.setState({selectedThreadId: th.id})}
                            {...this.props}
                        />
                    ))
                }
            </div>
        </div>
    }
}
