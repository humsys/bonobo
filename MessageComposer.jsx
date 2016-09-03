import React from 'react'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import Toolbar from 'material-ui/Toolbar'
import RaisedButton from 'material-ui/RaisedButton'

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
        if (open){
            // it's a list of suggestions
            return <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
                <div className="composer">
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
                <div className="row">
                    <button onClick={ () => this.setState({open:false}) }>
                        {suggestions.length} suggs
                    </button>
                </div>
            	</div>
            </MuiThemeProvider>
        } else {
            // it's a toolbar and textfield
            return  <MuiThemeProvider>
                <div className="composer">
                <Toolbar>
                    <RaisedButton 
                        label={`${suggestions.length} suggs`} 
                        primary={true} 
                        onClick={ () => this.setState({open:true}) }
                    />
                    <input
                        onChange={ ev => this.setState({draftText: ev.target.value}) }
                        value={draftText}
                        placeholder="Type a message..."
                    />
                    <button onClick={() => this.send()}>send</button>
                </Toolbar>
            </div>
            </MuiThemeProvider>
        }
    }
}