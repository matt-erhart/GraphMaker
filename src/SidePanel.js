import React from 'react';
import Drawer from 'material-ui/Drawer';
import RaisedButton from 'material-ui/RaisedButton';
import { connect } from 'react-redux';
import { List, ListItem } from 'material-ui/List';
import Divider from 'material-ui/Divider';
import Subheader from 'material-ui/Subheader';
import _ from 'lodash'
import { firebaseConnect, dataToJS } from 'react-redux-firebase'

import {storageRef} from './configureStore'


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
  state = {
    pathsLoaded: false,
    imgSrcs: {}
  }
  componentDidMount(){
    
  }
  componentDidUpdate(){
      _.forEach(this.props.snippets, (snip,key) => {
        if (!_.includes(_.keys(this.state.imgSrcs), key)){
          console.log('snip', snip, key)
          const ref = storageRef.child(snip.imgPath);
            ref.getDownloadURL().then((url) => {
            this.setState({imgSrcs: {...this.state.imgSrcs, [key]: url}})  
          });
        }
      })      
  }

  render() {
    const snippets = this.props.snippets;
    console.log(this.state.imgSrcs)
    return (
      <div>

        <Drawer open={this.props.showPanel} openSecondary={true}>
          <RaisedButton
            label="Toggle Drawer"
            onClick={e=>{this.props.toggleSidePanel()}}
          />
          <Divider></Divider>
          <List>
            <Subheader>Snippets</Subheader>
            {snippets && _.map(snippets, (snip, key) => {
              return <ListItem onClick={e=>{}} key={key} draggable="true" onDragStart={e=>e.nativeEvent.dataTransfer.setData("comment", snip.comment)}>
                {snip.title}
                {this.state.imgSrcs[key] && <img src={this.state.imgSrcs[key]} alt="" height="100" width="200"/>}
                <p>{snip.snippet}</p>
                <p>{snip.comment}</p>
              </ListItem>
            })}
          </List>
          <Divider></Divider>



        </Drawer>
      </div>
    );
  }
}

const connected = connect(mapStateToProps, mapDispatchToProps)(SidePanel)
const fireBasedComponent = firebaseConnect(['/snippets'])(connected)

export default connect(
  ({firebase}) => ({
    snippets: dataToJS(firebase, 'snippets'),
  })
)(fireBasedComponent)