import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import _ from 'lodash';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import {rxBus, rxActions} from './rxBus';
import Rx from 'rxjs';
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
        console.log(rxActions)
     }
    render(){
        return (<div onClick={e=>{rxBus.next('asdf')}}>hey</div>)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(GraphMaker)