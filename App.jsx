///### Frontend\\### Adding buttons to join roles\\### Adding an empty notification count and screen\\### Adding a script runner\\### Showing notifications based on the thread's script\\### The data view

let GroupCell = ({group}) => (
  <div
    className="table-view-cell group"
    onClick={() => viewState.update({selectedGroup: group.id})}
    >
    Group: {group.id}
    <Participants group={group}/>
  </div>
)

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