import React from 'react'
import GroupFeed from './GroupFeed.jsx'

let GroupCell = ({group, onClick}) => (
  <div className="table-view-cell group" onClick={onClick}>
    Group: {group.id}
    <p>
        {Object.values(group.members).map(m => <b>{m.displayName}</b>)}
    </p>
  </div>
)                   

export default class GroupsList extends React.Component {
  constructor(props){
      super(props)
      this.state = { selectedGroup: null }
  }

  render(){
    let {selectedGroup} = this.state
    let {groups, newGroup} = this.props
    if (selectedGroup){
      return <GroupFeed
        onClose={ () => this.setState({selectedGroup:null}) }
        group={groups[selectedGroup] || { id: selectedGroup, members: {} }}
        {...this.props}
        />
    }
    return (
      <div className="Screen">
        <header className="bar bar-nav">
          <h1 className="title">Groups</h1>
          <button className="pull-right" onClick={
            () => this.setState({selectedGroup: newGroup()})
          }>
            add
          </button>
        </header>
        <div className="content">
          <div className="table-view">{
              Object.values(this.props.groups).map(
                  g => <GroupCell group={g} {...this.props} onClick={
                      () => this.setState({selectedGroup: g.id})
                  } />
              ) 
          }</div>
        </div>
      </div>
    )
  }
}
