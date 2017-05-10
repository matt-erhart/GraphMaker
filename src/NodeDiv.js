import React from 'react';
import styled from 'styled-components'
import { rxBus, rxActions } from './rxBus';
import TextArea from './TextArea'
import _ from './lodash'

const NodeDivCss = styled.div`
  position: absolute;
  padding: 0;
  margin: 0;
  border: grey solid thin;
  border-radius:6px;
  background-color: lightblue;
  opacity: .99;
`
const publishClientXY = (rxActionName, e) => {
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
    setDragStart: (zoomScaleFactor) => dispatch({type: 'SET_ZOOM', zoomScaleFactor}),

  }
}

class NodeDiv extends React.Component {
  render() {
    const {node} = this.props; //required
    const {x,y} = node;

    return (
      <NodeDiv key={node.id} style={{ left: x, top: y }} onContextMenu={e => e.stopPropagation()}>
        <span style={{ cursor: 'move' }}
          onMouseDown={e => {
            publishClientXY('dragStart$', e)
            this.props.setDragStart({ x: node.x, y: node.y } ) //redux
          }}
          onClick={e => { e.stopPropagation(); e.preventDefault(); }}
          onMouseUp={e => { e.stopPropagation(); rxBus.next({ type: 'mouseUp$', id: node.id }) }}>
          drag</span>

        <span 
          onClick={e =>     { publishClientXY('linkClick$', e) }}
          onMouseDown={e => { publishClientXY('linkMouseDown$', e) }}
          onMouseUp  ={e => { publishClientXY('linkMouseUp$', e) }}
          style={{ cursor: 'alias' }}> link </span>

        <span onClick={e => { rxBus.next({ type: 'select', id: node.id }) }} 
          style={{ cursor: 'cell' }}>select </span>
        <span style={{ cursor: 'crosshair' }}>delete</span>
        <TextArea rows='1' autoFocus
          onClick={e => e.stopPropagation()}
          onBlur={e => 
          this.setState({ graph: { ...this.state.graph, 
          nodes: { ...this.state.graph.nodes, [node.id]: { ...node, text: e.target.value } } } })}
        ></TextArea>
      </NodeDiv>
    )
  }
}

