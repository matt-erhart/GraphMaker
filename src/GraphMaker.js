import React from 'react';
import { connect } from 'react-redux';
// import styled from 'styled-components';
// import _ from 'lodash';
// import * as d3 from 'd3';
import {rxActions} from './rxBus'; //rxBus
// import Rx from 'rxjs';
import ZoomContainer from './ZoomContainer'

function mapStateToProps(state) {
  return { 
    graph: state.graph
 }
}

function mapDispatchToProps(dispatch) {
  return {
    setGraph: (graph) => dispatch({type: 'SET_GRAPH', graph}),
  }
}

class GraphMaker extends React.Component {

    componentWillMount(){
     }
    render(){
        return (
        <div >
        <ZoomContainer>
            <h1>hey</h1>
        </ZoomContainer>

        </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(GraphMaker)