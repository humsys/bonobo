import React from 'react'
import MessageView from './MessageView.jsx'
import MessageComposer from './MessageComposer.jsx'
import suggestions from './suggestions.js'

const ThreadTeaser = (props) => {
    let {thread} = props
    let messageIds = Object.keys(thread.messages || {}).sort()
    let firstMessage = thread.messages && thread.messages[messageIds[0]]
    return <MessageView {...firstMessage}
               script={thread.script}
               {...props}>
        {messageIds.length - 1} replies
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
            <button onClick={() => {
            	if (!draftText) return
		        newThread(group, draftText)
        		this.setState({ draftText: "" })
            }}>Submit</button>
            <button onClick={()=>{
                let script = prompt('Enter a script!')
                newThread(group, draftText, script)
                this.setState({ draftText: "" })
            }}>Start script</button>
        </form>
    }
}

const ThreadViewer = (props) => {
    let {messages, onClose, thread, script, userId} = props
    return <div className="Screen">
        <header className="bar bar-nav">
            <h1 className="title"> Thread </h1>
            <button className="btn pull-left" onClick={onClose}> Close </button>
        </header>
        <div className="content">{
            Object.values(messages).map(m => <MessageView {...m} {...props} />)
        }</div>
        <MessageComposer {...props} suggestions={suggestions(thread, script, userId)} />
    </div>
}

export default class GroupFeed extends React.Component {
    constructor(props){
        super(props)
        this.state = { selectedThread: null }
    }

    render(){
        let {members} = this.props.group
        let {selectedThread} = this.state
        if (selectedThread){
            return <ThreadViewer
                       thread={selectedThread}
                       {...selectedThread}
                       {...this.props}
                       onClose={ () => this.setState({selectedThread:null}) }
                       />
        }
        return <div className="Screen">
            <header className="bar bar-nav">
           		<h1 className="title">
                    {this.props.group.id}
                    <p>
                        {Object.values(members).map(m => <b>{m.displayName}</b>)}
                    </p>
            	</h1>
            </header>
            <div className="content">
                <ThreadComposer {...this.props} />
                {
                    Object.keys(this.props.group.threads || {}).map(threadId => (
                        <ThreadTeaser
                            thread={this.props.group.threads[threadId]}
                            onClick={() => this.setState({selectedThread: this.props.group.threads[threadId]})}
                            {...this.props}
                        />
                    ))
                }
            </div>
        </div>
    }
}
