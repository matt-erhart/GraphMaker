import _ from 'lodash'

export const graph = (state = { nodes: {}, links: {} }, action) => {
    switch (action.type) {
        case 'SET_GRAPH': return action.graph
        case 'GET_LOCAL_STORAGE_GRAPH': return action.graph
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

const interactionStartDefaults = { dragStart: { x: 0, y: 0 }, panStart: { x: 0, y: 0 }, linkStart: { nodeID: '' } };
export const interactionStart = (state = interactionStartDefaults, action) => {
    switch (action.type) {
        case 'SET_DRAG_START': return { ...state, dragStart: action.dragStart };
        case 'SET_LINK_START': return { ...state, linkStart: action.linkStart };
        default: return state
    }
}

export const linkOptions = (state = {}, action) => {
    switch (action.type) {
        case 'SET_LINK_OPTIONS': return { ...state, linkOptions: action.linkOptions }; //check this in appjs
        default: return state
    }
}