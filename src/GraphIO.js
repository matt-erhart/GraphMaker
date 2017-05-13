import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { firebaseConnect, isLoaded, isEmpty, dataToJS } from 'react-redux-firebase'

function mapStateToProps(state) {
    return {
        graph: state.graph
    }
}

function mapDispatchToProps(dispatch) {
    return {
        setGraph: (graph) => dispatch({ type: 'SET_GRAPH', graph }),
        setLinkOptions: (linkOptions) => dispatch({ type: 'SET_LINK_OPTIONS', linkOptions })
    }
}

class GraphIO extends React.Component {
    componentWillMount() {
    }

    render() { 
        const {push, set, update, remove} = this.props.firebase;
        const {graphs, graphNames, graph} = this.props;
        const graphList = !isLoaded(graphs)?'Loading':isEmpty(graphs)?'empty': 
        Object.keys(graphs).map(
            (key, name) => (
              <li style={{cursor: 'pointer'}} key={key} onClick={e=>{
                        this.props.setGraph(this.props.graphs[key]); //auto got them all, just selecting from memory
                        }}> {key} 
                        <span onClick={e=>{
                            remove('graphs/' + key)
                            }}> [X] </span> </li>
            )
          )
        return (
            <div>
                <button onClick={e=>{
                    var d = new Date();
                    var datestring = d.getDate()  + "_" + (d.getMonth()+1) + "_" + d.getFullYear() + "_" +
                    d.getHours() + "_" + d.getMinutes() + '_' + d.getSeconds();
                    update(`/graphs/graph-${datestring}`, graph)
                }}>Save Graph</button>
                <ul>
                   {graphList}
                </ul>
            </div>
        )
    }
}

const connected = connect(mapStateToProps, mapDispatchToProps)(GraphIO)
const fireBasedComponent = firebaseConnect(['/graphs', '/graphNames'])(connected)

export default connect(
  ({firebase}) => ({
    graphs: dataToJS(firebase, 'graphs'),
    graphNames: dataToJS(firebase, 'graphNames'),
  })
)(fireBasedComponent)