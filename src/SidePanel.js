import React from 'react';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import { connect } from 'react-redux';
import { List, ListItem } from 'material-ui/List';
import ActionInfo from 'material-ui/svg-icons/action/info';
import Divider from 'material-ui/Divider';
import Subheader from 'material-ui/Subheader';
import _ from 'lodash'
function mapStateToProps(state) {
  return {
    nodes: state.graph.nodes,
    showPanel: state.sidePanel.showPanel
  }
}

function mapDispatchToProps(dispatch) {
  return {
    toggleSidePanel: () => dispatch({ type: 'TOGGLE_PANEL' }),
    setNode: (node) => dispatch({type: 'SET_NODE', node})

  }
}


class SidePanel extends React.Component {

  render() {
    const chunks = _.filter(this.props.nodes, node => _.includes(node.tags, 'chunk'))
    const snippets = _.filter(this.props.nodes, node => _.includes(node.tags, 'snippet'))
    const sources = _.filter(this.props.nodes, node => _.includes(node.tags, 'source'))
    return (
      <div>

        <Drawer open={this.props.showPanel} openSecondary={true}>
          <RaisedButton
            label="Toggle Drawer"
            onClick={e=>{this.props.toggleSidePanel()}}
          />
          <List>
            <Subheader>Chunks</Subheader>
            {chunks && _.map(chunks, (node, i) => {
              return <ListItem key={i} onClick={e=>{this.props.setNode({...node, selected: true})}} >{node.text}</ListItem>
            })}
          </List>
          <Divider></Divider>
          <List>
            <Subheader>Snippets</Subheader>
            {snippets && _.map(snippets, (node, i) => {
              return <ListItem onClick={e=>{this.props.setNode({...node, selected: true})}} key={i}>{node.text}</ListItem>
            })}
          </List>
          <Divider></Divider>
          <List>
            <Subheader>Sources</Subheader>
            {sources && _.map(sources, (node, i) => {
              return <ListItem onClick={e=>{this.props.setNode({...node, selected: true})}} key={i}>{node.text}</ListItem>
            })}
          </List>



        </Drawer>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SidePanel)
