import React from 'react'
import './styles.css'

export default class MessageComposer extends React.Component {
    constructor(props){
        super(props)
        this.state = { open: false }
    }
    
    send(){
        let {draftText, activeSuggestion} = this.state
        if (!draftText) return
        this.props.onSend(draftText, activeSuggestion)
        this.setState({ draftText: "", activeSuggestion: null })
    }
    
    render(){
        let {open, draftText=""} = this.state
        let {suggestions, onSend} = this.props
        let row = <div className="row">
                    <button  onClick={ () => this.setState({open:!this.state.open}) } >
                        {suggestions.length} suggs
                    </button>
                    <input
                        onChange={ ev => this.setState({draftText: ev.target.value}) }
                        value={draftText}
                        placeholder="Type a message..."
                    />
                    <button onClick={() => this.send()}>send</button>
                </div>
        if (open){
            // it's a list of suggestions
            return  <div className="composer">
                <div className="table-view"> {
                    suggestions.map(s => (
                        <div onClick={
                                () => this.setState({
                                    open: false, draftText: s.cue.text, activeSuggestion: s
                                })
                            } className="table-view-cell">
							{s.cue.hint} {s.cue.text}
                        </div>
                    ))
                }</div>
                {row}
            </div>
        } else {
            // it's a toolbar and textfield
            return  <div className="composer"> {row} </div>
        }
    }
}