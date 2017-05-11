import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import ZoomContainer from './ZoomContainer'
import NodeDiv from './NodeDiv'
import Line from './Line'
import LinkOptions from './LinkOptions'
import { firebaseConnect, isLoaded, isEmpty, dataToJS } from 'react-redux-firebase'
import GraphIO from './GraphIO'
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
        setGraph: (graph) => dispatch({ type: 'SET_GRAPH', graph }),
        setLinkOptions: (linkOptions) => dispatch({ type: 'SET_LINK_OPTIONS', linkOptions })
    }
}

class GraphMaker extends React.Component {
    componentWillMount() {
    }
    render() {
        const { panX, panY, zoomScaleFactor,
            graphWidth, graphHeight } = this.props.panZoomSize;
        const { nodes, links } = this.props.graph;
        const { linkOptions } = this.props;
        const { linkStart } = this.props.interactionStart;

        return (
            <div >
                <ZoomContainer>
                    <svg width={graphWidth} height={graphHeight}>
                        {linkStart.hasOwnProperty('x2') &&
                            <Line {..._.omit(linkStart, 'nodeID') } xShift={75} yShift={30} />
                        }
                        {_.map(links, link => {
                            let source = nodes[link.source];
                            let target = nodes[link.target];
                            return (
                                <Line key={link.id} x1={source.x} y1={source.y} x2={target.x} y2={target.y}
                                    id={link.id} xShift={75} yShift={30}
                                    onClick={e => {
                                        const { offsetX, offsetY } = e.nativeEvent
                                        this.props.setLinkOptions({ left: offsetX, top: offsetY, id: link.id })
                                    }}
                                />
                            )
                        })}
                    </svg>
                    {/*HTML LAYER zooms pans with svg layer*/}
                    {_.map(this.props.graph.nodes, node => {
                        return (<NodeDiv key={node.id} node={node} />)
                    })
                    }
                    {linkOptions.hasOwnProperty('id') && <LinkOptions />}

                </ZoomContainer>
                <GraphIO></GraphIO>
            </div>
        )
    }
}

const connected = connect(mapStateToProps, mapDispatchToProps)(GraphMaker)
const fireBasedComponent = firebaseConnect(['/graphs', '/graphNames'])(connected)

export default connect(
  ({firebase}) => ({
    graphs: dataToJS(firebase, 'graphs'),
    graphNames: dataToJS(firebase, 'graphNames'),
  })
)(fireBasedComponent)