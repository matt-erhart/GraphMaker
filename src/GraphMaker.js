import React from 'react';
import { connect } from 'react-redux';
// import styled from 'styled-components';
// import _ from 'lodash';
// import * as d3 from 'd3';
import {rxActions} from './rxBus'; //rxBus
// import Rx from 'rxjs';
import ZoomContainer from './ZoomContainer'
// import Lines from './Lines'


function mapStateToProps(state) {
    return {
        graph: state.graph,
        panZoomSize: state.panZoomSize,
        interactionStart: state.interactionStart,
        linkOptions: state.linkOptions
    }
}

function mapDispatchToProps(dispatch) {
  return {
    setGraph:     (graph) => dispatch({type: 'SET_GRAPH', graph}),
    setDragStart: (graph) => dispatch({type: 'SET_GRAPH', graph})
  }
}

class GraphMaker extends React.Component {

    componentWillMount(){
     }
    render(){
      const {panX, panY, zoomScaleFactor, 
          graphWidth, graphHeight} = this.props.panZoomSize;
      const {nodes, links} = this.props.graph;


        return (
        <div >
        <ZoomContainer>
            <svg width={graphWidth} height={graphHeight}>
            </svg>



        </ZoomContainer>

        </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(GraphMaker)