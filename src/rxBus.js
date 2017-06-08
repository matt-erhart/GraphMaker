//rxjs helps manage complex sequences of events across any component interactions
import Rx from 'rxjs';
import { store } from './index';
import _ from 'lodash';
import uid from 'uid-safe';
import * as d3qt from 'd3-quadtree'
import * as d3Color from 'd3-color'

const keyup$ = Rx.Observable.fromEvent(window, 'keyup').do(x=>console.log(x));


export let rxBus = new Rx.Subject();
export let e$ = { //so we get autocomplete, e is events. $ is rxjs
    leftMouseUp: null,
    mouseUp: null,
    mouseMove: null,
    clickBG: null,
    rightClickBG: null,
    leftMouseDown: null,
    middleMouseDown: null,
    rightMouseDown: null,
    mouseWheel: null,
    dragStart: null,
    linkClick: null,
    linkDown: null,
    linkUp: null,
}
e$ = _.mapValues(e$, (val, key) => { return {str: key, obs: rxBus.filter(x => x.type === key) }}) // obs that listens for key
//ui stream patterns:
const nodesInRectangle = (nodes, rect) => { 
    const {x,y,width,height} = rect;
    const x2 = x+width; const y2=y+height;
    return _.filter(nodes, node => {
        return _.inRange(node.x, x, x2) && _.inRange(node.y, y, y2)
    })
}

//delete selected nodes
const removeSelectedNodes$ = keyup$.filter(key=>key.code==='Delete').do(key=> store.dispatch({type: 'REMOVE_SELECTED_NODES'}))
const createGroup$ = keyup$.filter(key=>{return (key.key==='g' && key.altKey)})
                                .do(key=> {
                                        const color = d3Color.cubehelix(Math.random()*350,.6,.6).toString();
                                        store.dispatch({type: 'CREATE_GROUP', color})
                                    })

//const dragSelect
let nodesInRectPrev = {};
const dragSelect$ = e$.leftMouseDown.obs.mergeMap(action => e$.mouseMove.obs.takeUntil(e$.mouseUp.obs)
            .do(mouseMoveData => {
                    const {offsetX, offsetY, clientX, clientY} = action;
                    const state = store.getState();
                    const zoom = state.panZoomSize.zoomScaleFactor;
                    const w = (mouseMoveData.clientX-clientX)/zoom; //dragging right positive
                    const h = ( mouseMoveData.clientY-clientY)/zoom; //dragging down positive
                    const x = w < 0? offsetX + w: offsetX; 
                    const y = h < 0? offsetY + h: offsetY;
                    const width = Math.abs(w);
                    const height = Math.abs(h);
                    const dragSelect = {x, y, width, height}
                    const nodesInRect = nodesInRectangle(state.graph.nodes, dragSelect);
                    if (nodesInRect.length < nodesInRectPrev.length) {
                        const nodesToRevert = _.difference(nodesInRectPrev, nodesInRect)
                        _.forEach(nodesToRevert, (prevNode, key) => {
                            store.dispatch({type: 'SET_NODE', node: {...prevNode, selected: false}})
                    })} else {
                        _.forEach(nodesInRect, (node, key) => {
                        if (!node.selected) {
                            store.dispatch({type: 'SET_NODE', node: {...node, selected: true}})
                        }
                        })
                    }
                    if (width>2) store.dispatch({type: 'SET_DRAG_SELECT', dragSelect})
                    nodesInRectPrev = nodesInRect
                }
            ).finally(_ => {
                store.dispatch({type: 'SET_DRAG_SELECT', dragSelect: {x:0,y:0,width:0,height:0}})
                nodesInRectPrev = {};
            }) )

//deselect all on bg click
const downUpBG$ = Rx.Observable.merge(e$.leftMouseDown.obs.take(1), e$.mouseUp.obs.take(1)).filter(x=>x !== undefined).repeat();
const deSelectAll$ = downUpBG$.bufferWhen(() => downUpBG$.debounceTime(250)).filter(x=>x.length===2).do(upDown => {
                                const state = store.getState();
                                store.dispatch({type: 'UPDATE_NODES', updates: {selected: false }}); //toggle selected on click not drag
                            })


//seperate clicking vs dragging a node
const downUp$ = Rx.Observable.merge(e$.dragStart.obs.take(1), e$.mouseUp.obs.take(1)).filter(x=>x !== undefined).repeat()
const clickNotDrag$ = downUp$.bufferWhen(() => downUp$.debounceTime(250)).filter(x=>x.length===2).do(upDown => {
                                const state = store.getState();
                                const node = state.graph.nodes[upDown[0].id]
                                store.dispatch({type: 'SET_NODE', node: {...node, selected: !node.selected }}); //toggle selected on click not drag
                            })
  

//NODE INTERACTIONS
export const newNode = (click, text='') => ({ id: 'node-' + uid.sync(8),
 x: click.offsetX-78, y: click.offsetY-23,
 text: text, selected: false, 
 tags:['snippet']});
let addNode$ = e$.rightClickBG.obs.do(click => {
    let node = newNode(click);
    store.dispatch({type: 'SET_NODE', node })
})

//drag nodes
// let dnd$ = e$.dragStart.obs.mergeMap(action => e$.mouseMove.obs.takeUntil(e$.mouseUp.obs).do(moveData => {
//     const state = store.getState();
//     let { x, y } = state.interactionStart.dragStart;
//     let oldNode = state.graph.nodes[action.id];
//     let dx = (moveData.clientX - action.clientX) / state.panZoomSize.zoomScaleFactor;
//     let dy = (moveData.clientY - action.clientY) / state.panZoomSize.zoomScaleFactor;
//     let newNode = { ...oldNode, x: x + dx, y: y + dy }; 
//     store.dispatch({type: 'SET_NODE', node: newNode })
// }))

let dnd$ = e$.dragStart.obs.mergeMap(action => e$.mouseMove.obs.takeUntil(e$.mouseUp.obs)
            .bufferCount(2,1).do(mouseMoveData => {
                const [prevMouse, currMouse] = mouseMoveData;
                if (prevMouse && currMouse){
                    const state = store.getState();
                    const draggedNode = state.graph.nodes[action.id];
                    if (!draggedNode.selected) store.dispatch({type: 'SET_NODE', node: {...draggedNode, selected: true} })
                    const shiftX = (currMouse.clientX - prevMouse.clientX) / state.panZoomSize.zoomScaleFactor;
                    const shiftY = (currMouse.clientY - prevMouse.clientY) / state.panZoomSize.zoomScaleFactor;
                store.dispatch({type: 'MOVE_SELECTED_NODES', shiftX, shiftY })
                }
            }).finally(_ => {
                const state = store.getState();
                const draggedNode = state.graph.nodes[action.id];

                store.dispatch({type: 'SET_NODE', node: {...draggedNode, selected: action.selected} })
            }) )

//make links
const initLink = (link1) => {
    const state = store.getState();
    if (state.interactionStart.linkStart.nodeID === '') {
        let { x, y, id } = state.graph.nodes[link1.id];
        store.dispatch({type: 'SET_LINK_START', linkStart: { nodeID: id, x1: x, y1: y }})
    }
}

//view link while making it
const previewLink = (link1, moveData) => {
    const state = store.getState();
    let { x1, y1 } = state.interactionStart.linkStart;
    let dx = (moveData.clientX - link1.clientX) / state.panZoomSize.zoomScaleFactor;
    let dy = (moveData.clientY - link1.clientY) / state.panZoomSize.zoomScaleFactor;
    let shiftToAlignWithCursor = -23;
    let newLink = { ...state.interactionStart.linkStart, 
        x2: x1 + dx + 5, 
        y2: y1 + dy + shiftToAlignWithCursor};
    store.dispatch({type: 'SET_LINK_START', linkStart: newLink})
}

const newLink = (source, target) => ({ id: 'link-' + uid.sync(8), source, target, label: '', tags:[] });
const setLink = (link1, click2) => {
    if (click2.hasOwnProperty('id') && click2.id.length > 0 && click2.id !== link1.id) {
        let link = newLink(link1.id, click2.id)
        store.dispatch({type: 'SET_LINK', link: link})
        store.dispatch({type: 'SET_LINK_START', linkStart: { nodeID: '' }})
    } else {
        store.dispatch({type: 'SET_LINK_START', linkStart: { nodeID: '' }})
    }
}

let linkStart$ = Rx.Observable.merge(e$.linkClick.obs, e$.linkDown.obs)
let stopPreview$ = Rx.Observable.merge(e$.linkClick.obs, e$.clickBG.obs, e$.linkUp.obs, e$.mouseUp.obs)
/*the trick to getting this to work for any number of pairs of clicks
 is the take(1) at the begining and the repeat() at the end */
let initLink$ = linkStart$.take(1).do(link1 => initLink(link1))

let addLink$ = initLink$.switchMap(link1 => {
    return e$.mouseMove.obs.do(moveData => previewLink(link1, moveData))
        .takeUntil(stopPreview$.do(click2 => setLink(link1, click2)))
}).repeat();

//pan 
let panStart$ = e$.middleMouseDown.obs.do(x => {
    const state = store.getState();
    store.dispatch({type: 'SET_PAN_START', panStart: { x: state.panZoomSize.panX, y: state.panZoomSize.panY }})
})
let panEnd$ = e$.mouseUp.obs.do(x => console.log(x))
const setPan = (panStart, moveData) => {
    const state = store.getState();
    let { zoomScaleFactor } = state.panZoomSize;
    let { x, y } = state.panZoomSize.panStart;
    let dx = (moveData.clientX - panStart.clientX) / state.panZoomSize.zoomScaleFactor;
    let dy = (moveData.clientY - panStart.clientY) / state.panZoomSize.zoomScaleFactor;
    store.dispatch({type: 'SET_PANX', panX: x+dx})
    store.dispatch({type: 'SET_PANY', panY: y+dy})
}
let pan$ = panStart$.switchMap(panStart => {
    return e$.mouseMove.obs.do(moveData => setPan(panStart, moveData)).takeUntil(panEnd$)
})

//zoom 
let zoom$ = e$.mouseWheel.obs
    .do(action => {
        const state = store.getState();
        const dxFactor = .2
        const zoomDx = action.deltaY > 0 ? -1 * dxFactor : 1 * dxFactor;
        let oldZoom = state.panZoomSize.zoomScaleFactor;
        store.dispatch({type: 'SET_ZOOM', zoomScaleFactor: oldZoom + zoomDx})
    })

//each one of these listens for patterns, and we listen to them all with subscribe
Rx.Observable.merge(addNode$, dnd$, addLink$, pan$, zoom$, clickNotDrag$, deSelectAll$, dragSelect$, removeSelectedNodes$, createGroup$).subscribe();