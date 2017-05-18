import React from 'react';
import styled from 'styled-components'
import { rxBus, e$ } from './rxBus';
import TextArea from './TextArea'
import _ from 'lodash'
import { connect } from 'react-redux';
import ReactDOM from 'react-dom'
import Select from 'react-select';
import { Creatable } from 'react-select';
import uniqueNodeTags from './selector_uniqueNodeTags'

const NodeDivCss = styled.div`
  position: absolute;
  padding: 0;
  margin: 0;
  background-color: none;
  opacity: .99;
  &:hover > div{
   transition: all 0.2s ease-in-out .05s;
   opacity: 1;
  }
`

const MenuDivCss = styled.div`
  width: 160px;
  display: flex;
  justify-content: space-between
  opacity: 0;
  left: -0px;
  top: -25px;
  height: 40px;
  position: absolute;
  font-size: .7em;
  &:hover {
   opacity: 0;
  }
`
const MenuItemCss = styled.i`
  flex: 0;
  &:hover {
    font-weight: 500;
  }

`

const RemoveNode = styled(MenuItemCss)`
  cursor: default;
  color: black;
  &:hover {
    color: red;
    font-weight: bold;
  }
`

const publishClientXY = (rxActionName, e, node) => {
  const { clientX, clientY } = e.nativeEvent
  e.stopPropagation(); e.preventDefault();
  rxBus.next({ type: rxActionName, id: node.id, selected: node.selected, clientX, clientY });
}

function mapStateToProps(state) {
  return { 
    panZoomSize: state.panZoomSize,
    linkStart: state.interactionStart.linkStart,
    uniqueNodeTags:  uniqueNodeTags(state)
 }
}

function mapDispatchToProps(dispatch) {
  return {
    setNode: (node) => dispatch({type: 'SET_NODE', node}),
    removeNode: (node) => dispatch({type: 'REMOVE_NODE', node}),
    setDragStart: (dragStart) => dispatch({type: 'SET_DRAG_START', dragStart}), //dont need?
  }
}
const focusUsernameInputField = input => {
  if (input) {
    setTimeout(() => input.focus(), 100);
  }
};

class NodeDiv extends React.Component {
  render() {
    const {node} = this.props; //required
    const {x,y} = node;
    const uniqueNodeTags = this.props.uniqueNodeTags.map(x=>({label: x, value: x}));
    const currentTags = node.tags.map(x=>({label: x, value: x}));
    return (
      <NodeDivCss key={node.id} style={{ left: x, top: y }} 
      onContextMenu={e => e.stopPropagation()}
      onMouseUp={e => { publishClientXY(e$.linkUp.str, e, node) }}
      >
       <MenuDivCss >
        <MenuItemCss style={{ cursor: 'move' }} title="move node" className="material-icons"
          onMouseDown={e => {
            publishClientXY(e$.dragStart.str, e, node)
            this.props.setDragStart({ x: node.x, y: node.y } ) //redux
          }}
          onClick={e => { e.stopPropagation(); e.preventDefault(); }}
          onMouseUp={e => { e.stopPropagation(); rxBus.next({ type: e$.mouseUp.str, id: node.id }) }}>
          open_with</MenuItemCss>

        <MenuItemCss className="material-icons" title="link nodes"
          onClick={e =>     { publishClientXY(e$.linkClick.str, e, node) }}
          onMouseDown={e => { publishClientXY(e$.linkDown.str, e, node) }}
          onMouseUp  ={e => { publishClientXY(e$.linkUp.str, e, node) }}
          style={{ cursor: 'alias' }}> call_made </MenuItemCss>

        <RemoveNode title='DELETE NODE' onClick={e=>{this.props.removeNode(node)}} className="material-icons">clear</RemoveNode>

      </MenuDivCss>
        <TextArea rows={1} autoFocus value={node.text} readOnly={node.readOnly} selected={node.selected}
          ref={(textArea) => { this[node.id] = textArea; }}
          onBlur={e => 
          this.props.setNode({ ...node, text: e.target.value, readOnly: true })}
          onDoubleClick={e=>{
             e.stopPropagation()
             this.props.setNode({ ...node, readOnly: false })
             ReactDOM.findDOMNode(this[node.id]).focus()
          }}
          onChange={e => 
          this.props.setNode({ ...node, text: e.target.value })}
          onMouseDown={e => {
            if (node.readOnly) {
            publishClientXY(e$.dragStart.str, e, node)
            {/*this.props.setDragStart({ x: node.x, y: node.y } ) //redux*/}
            }
          }}
          onMouseUp={e => { 
            e.stopPropagation(); rxBus.next({ type: e$.mouseUp.str, id: node.id })
            e.currentTarget.style.backgroundColor = '#2C6CC3';
            }
          }
          onMouseEnter={e=>{
            if (this.props.linkStart.hasOwnProperty('x2') & this.props.linkStart.nodeID !== node.id){
              e.currentTarget.style.backgroundColor = 'darkgreen';
            }
          }}
          onMouseLeave={e=>{
            e.currentTarget.style.backgroundColor = '#2C6CC3';
          }}
        ></TextArea>
        <Creatable multi placeholder="Node tags" value={currentTags}
				options={uniqueNodeTags} onChange={value => this.props.setNode({...node, tags: value.map(x=>x.value)})} />

      </NodeDivCss>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NodeDiv)
