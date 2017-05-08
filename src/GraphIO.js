import React from 'react';
import styled from 'styled-components'
import Rx from 'rxjs'
import _ from 'lodash'
import uid from 'uid-safe'
import ram from 'ramda'
import NodeDiv from './NodeDiv'
import TextArea from './TextArea'
import ZoomContainer from './ZoomContainer'
import {buttonFromNum} from './constants'
import PropTypes from 'prop-types'
import Rebase from 're-base';

var base = Rebase.createClass({
    apiKey: "AIzaSyD2f07HcJOim-7AQGBU6Tdn2zNzhizrk20",
    authDomain: "graphmaker-4f5f7.firebaseapp.com",
    databaseURL: "https://graphmaker-4f5f7.firebaseio.com",
    projectId: "graphmaker-4f5f7",
    storageBucket: "graphmaker-4f5f7.appspot.com",
    messagingSenderId: "148125882055"
});

class GraphIO extends React.Component {

state = {graphs: {}};

addGraph = (graphName, newGraph) => {
  this.setState({
    graphs: {...this.state.graphs, [graphName]: newGraph} //updates Firebase and the local state
  });
}

componentDidMount(){
  base.syncState(`graphs`, {
    context: this,
    state: 'graphs',
    asArray: false
  });
  this.addGraph('graph-asdf', {links: 123, nodes: 321})
  base.fetch('graphs', {
    context: this,
    asArray: false,
    then(data){
      console.log('fetch', data);
    }
  });
}

render(){
    return (
        <ul>
            <li>list here</li>
        </ul>
    )
}

}
export default GraphIO;