import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import ZoomContainer from './ZoomContainer'
import NodeDiv from './NodeDiv'
import Line from './Line'
import LinkOptions from './LinkOptions'
import { firebaseConnect, isLoaded, isEmpty, dataToJS } from 'react-redux-firebase'
import GraphIO from './GraphIO'
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import SidePanel from './SidePanel'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import * as d3Poly from 'd3-polygon'
import {newNode} from './rxBus'
function mapStateToProps(state) {
    return {
        graph:       state.graph,
        panZoomSize: state.panZoomSize,
        interactionStart: state.interactionStart,
        linkOptions:  state.linkOptions
    }
}

function mapDispatchToProps(dispatch) {
    return {
        setGraph: (graph) => dispatch({ type: 'SET_GRAPH', graph }),
        setLinkOptions: (linkOptions) => dispatch({ type: 'SET_LINK_OPTIONS', linkOptions }),
        toggleSidePanel: () => dispatch({ type: 'TOGGLE_PANEL' }),
        setNode: (node) => dispatch({type: 'SET_NODE', node })
    }
}


class GraphMaker extends React.Component {
    componentWillMount() {
    }
    render() {
        const { panX, panY, zoomScaleFactor,
            graphWidth, graphHeight } = this.props.panZoomSize;
        const { nodes, links, groups } = this.props.graph;
        const { linkOptions } = this.props;
        const { linkStart, dragSelect } = this.props.interactionStart;
        // const hull = d3Poly.polygonHull([[100, 200], [200, 100], [100, 100], [200,200], [150, 150]])
        let hulls = []
        if (groups && Object.keys(groups).length > 0) {
            const hullFromGroup = group => d3Poly.polygonHull(group.nodeIDs.map(id => [nodes[id].x+75, nodes[id].y+20]))
            const hullPath = hull => {
                if (hull !== undefined && hull !== null) {
                    return hull.splice(1).reduce((acc, d) =>  acc + 'L' + d.join(), 'M' + hull[0].join()) + 'Z'
                } else {
                    // return 'M' + hull[0].join() + 'L' + hull[1].join(); //2 point, no hull
                }
            }
            hulls = _.map(groups, group => ({id: group.id, hullPath: hullPath(hullFromGroup(group)), color: group.color})); //

        }
        return (
            <div >
                  <RaisedButton onClick={e=>{this.props.toggleSidePanel()}}>Side Panel</RaisedButton>
                    <SidePanel></SidePanel>

                <ZoomContainer >
                    <svg width={graphWidth} height={graphHeight} onDragOver={e=>{e.preventDefault(); console.log('dragover', e)}} 
                        onDrop={e=>{
                            e.preventDefault(); 
                             const comment = e.nativeEvent.dataTransfer.getData("comment")
                             this.props.setNode(newNode(e.nativeEvent, comment));

                             }}>
                        {hulls && hulls.map(hull => <path key={hull.id} d={hull.hullPath} fill={hull.color} stroke={hull.color} strokeWidth='150' strokeLinejoin='round' opacity={.5}></path>)}
                        <defs>
                            <marker id="markerArrow1" refX="-30" refY="5" viewBox="0 0 10 10" style={{'stroke':'none', fill: 'grey'}}
                                markerWidth="3" markerHeight="3" orient="auto">
                                <path d="M 0 0 L 10 5 L 0 10 z" />
                            </marker>
                            <marker id="markerArrow2" refX="30" refY="5" viewBox="0 0 10 10" style={{'stroke':'none', fill: 'grey'}}
                                markerWidth="3" markerHeight="3" orient="auto">
                                <path d="M 0 0 L 10 5 L 0 10 z" />
                            </marker>
                        </defs>
                        {linkStart.hasOwnProperty('x2') &&
                            <Line {..._.omit(linkStart, 'nodeID') } xShift={75} yShift={10} />
                        }
                        {dragSelect !== undefined && 
                            <rect {...dragSelect} stroke='black' fill="none" />
                        }
                        
                        {_.map(links, link => {
                            let source = nodes[link.source];
                            let target = nodes[link.target];
                            return (
                                <Line key={link.id} x1={source.x} y1={source.y} x2={target.x} y2={target.y} tags={link.tags}
                                    id={link.id} xShift={75} yShift={10} markerMid="url(#markerArrow1)" label={link.label}
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
                        return (<NodeDiv key={node.id} node={node} className='selectable' />)
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