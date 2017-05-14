import _ from 'lodash'

const removeNodeAndItsLinks = (state, action) => {
    const linksWithNode = _.filter(state.links, link => _.includes(link, action.node.id));
    const links = _.omit(state.links, _.map(linksWithNode, link => link.id));
    const nodes = _.omit(state.nodes, action.node.id);
    return {nodes, links}
}

const moveSelectedNodes = (state, action) => {
    const {shiftX, shiftY} = action;
    const selectedNodes = _.filter(state.nodes, {'selected': true}) //reselect
    const movedNodes = _.map(selectedNodes, node => {
        return {...node, x: node.x+shiftX, y: node.y+shiftY}
    })
    return {...state, nodes: {...state.nodes, ...movedNodes}};
}

const updateNodes = (state, action) => { //selected nodes or all nodes
    const {updates, updateSelected} = action; // e.g. {color: 'blue', category: 'cause'}
    const selectedNodes = updateSelected? _.filter(state.nodes, {'selected': true}) : state.nodes
    const updatedNodes = _.map(selectedNodes, node => {
        return {...node, ...updates} 
    })
    return {...state, nodes: {...state.nodes, ...updatedNodes}};
}

// const updateNode = (state, action) => { //todo: consolidate set/update for selected/not
//     const {nodes, selected} = action;
//     const updatedNode = {...node, selected}
//     return {...state, nodes: {...state.nodes, ...updatedNode}};
// }

export const graph = (state = { nodes: {}, links: {} }, action) => {
    switch (action.type) {
        case 'SET_GRAPH': return action.graph
        case 'GET_LOCAL_STORAGE_GRAPH': return action.graph
        case 'SET_NODE': return {...state, nodes: {...state.nodes, [action.node.id]: action.node}};
        case 'UPDATE_NODES': return updateNodes(state, action);
        case 'MOVE_SELECTED_NODES': return moveSelectedNodes(state, action);
        case 'SET_LINK': return {...state, links: {...state.links, [action.link.id]: action.link}}
        case 'REMOVE_NODE': return removeNodeAndItsLinks(state, action)
        case 'REMOVE_LINK': return {...state, links: _.omit(state.links, action.id)}        
        default: return state
    }
}

const panZoomSizeDefaults = {
    zoomScaleFactor: 1, panX: 0, panY: 0,
    graphWidth: 1500, graphHeight: 1000,
}
export const panZoomSize = (state = {
    zoomScaleFactor: 1, panX: 0, panY: 0,
    graphWidth: 1500, graphHeight: 1000},
     action) => {
    switch (action.type) {
        case 'SET_ZOOM': return { ...state, zoomScaleFactor: action.zoomScaleFactor };
        case 'SET_PANX': return { ...state, panX: action.panX };
        case 'SET_PANY': return { ...state, panY: action.panY };
        case 'SET_GRAPH_WIDTH': return { ...state, graphWidth: action.graphWidth };
        case 'SET_GRAPH_HEIGHT': return { ...state, graphHeight: action.graphHeight };
        case 'SET_PAN_START': return {  ...state, panStart: action.panStart };
        default: return state
    }
}

const interactionStartDefaults = { dragStart: { x: 0, y: 0 }, linkStart: { nodeID: '' }, 
dragSelect: {x1:0, y1:0, x2:0, y2:0 } };
export const interactionStart = (state = interactionStartDefaults, action) => { //more like previews with mousemove
    switch (action.type) {
        case 'SET_DRAG_START': return { ...state, dragStart: action.dragStart };
        case 'SET_LINK_START': return { ...state, linkStart: action.linkStart };
        case 'SET_DRAG_SELECT': return { ...state, dragSelect: action.dragSelect };
        default: return state
    }
}

export const linkOptions = (state = {}, action) => {
    switch (action.type) {
        case 'SET_LINK_OPTIONS': return  action.linkOptions ; 
        default: return state
    }
}

export const selected = (state = {nodes: [], links:[]}, action) => {
    _.isArray(action.id)? '': console.error('id must be an array')
    switch (action.type) {
        case 'ADD_NODES': return     {...state, nodes: _.concat(state.nodes, action.id)}
        case 'REMOVE_NODES': return  {...state, nodes: _.without(state.nodes, action.id)} 
        case 'ADD_LINKS': return     {...state, links: _.concat(state.links, action.id)}
        case 'REMOVE_LINKS': return  {...state, links: _.without(state.links, action.id)} 
        default: return state
    }
}