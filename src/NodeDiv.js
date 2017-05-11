import React from 'react';
import styled from 'styled-components'
import { rxBus, e$ } from './rxBus';
import TextArea from './TextArea'
import _ from 'lodash'
import { connect } from 'react-redux';
const NodeDivCss = styled.div`
  position: absolute;
  padding: 0;
  margin: 0;
  border: grey solid thin;
  border-radius:6px;
  background-color: lightblue;
  opacity: .99;
  &:hover > div{
   opacity: 1;
  }
`

const MenuDivCss = styled.div`
  opacity: 0;
  left: -0px;
  top: -20px;
  height: 40px;
  position: absolute;
  &:hover {
   opacity: 0;
  }
`

const publishClientXY = (rxActionName, e, node) => {
  const { clientX, clientY } = e.nativeEvent
  e.stopPropagation(); e.preventDefault();
  rxBus.next({ type: rxActionName, id: node.id, clientX, clientY });
}

function mapStateToProps(state) {
  return { 
    panZoomSize: state.panZoomSize,
 }
}

function mapDispatchToProps(dispatch) {
  return {
    setNode: (node) => dispatch({type: 'SET_NODE', node}),
    removeNode: (node) => dispatch({type: 'REMOVE_NODE', node}),
    setDragStart: (dragStart) => dispatch({type: 'SET_DRAG_START', dragStart})
  }
}

class NodeDiv extends React.Component {
  render() {
    const {node} = this.props; //required
    const {x,y} = node;

    return (
      <NodeDivCss key={node.id} style={{ left: x, top: y }} 
      onContextMenu={e => e.stopPropagation()}
      onMouseUp  ={e => { publishClientXY(e$.linkUp.str, e, node) }}
      >
       <MenuDivCss >
        <span style={{ cursor: 'move' }}
          onMouseDown={e => {
            publishClientXY(e$.dragStart.str, e, node)
            this.props.setDragStart({ x: node.x, y: node.y } ) //redux
          }}
          onClick={e => { e.stopPropagation(); e.preventDefault(); }}
          onMouseUp={e => { e.stopPropagation(); rxBus.next({ type: e$.mouseUp.str, id: node.id }) }}>
          drag</span>

        <span 
          onClick={e =>     { publishClientXY(e$.linkClick.str, e, node) }}
          onMouseDown={e => { publishClientXY(e$.linkDown.str, e, node) }}
          onMouseUp  ={e => { publishClientXY(e$.linkUp.str, e, node) }}
          style={{ cursor: 'alias' }}> link </span>

        <span onClick={e => { rxBus.next({ type: 'select', id: node.id }) }} 
          style={{ cursor: 'cell' }}>select </span>
        <span style={{ cursor: 'crosshair' }} onClick={e=>{this.props.removeNode(node)}}>delete</span>
      </MenuDivCss>
        <TextArea rows='1' autoFocus value={node.text}
          onClick={e => e.stopPropagation()}
          onBlur={e => 
          this.props.setNode({ ...node, text: e.target.value })}
          onChange={e => 
          this.props.setNode({ ...node, text: e.target.value })}
        ></TextArea>

      </NodeDivCss>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NodeDiv)
