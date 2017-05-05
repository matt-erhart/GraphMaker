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

class Figure extends React.Component {
    state = {
      zoomScaleFactor: 1,
      graphWidth: 1500, 
      graphHeight: 1000, 
      panX: 0, 
      panY: 0, 
      circles: {}, // {'id': {id: 'id', x:, y:, r:, fill}}
      lines: {}, // {'id': {id: 'id', x1:, y1:, x2:, y2:}}
      links: {},
      selected: [],
      nodes: {}, // {id: {id: ..., x,y,width,height, title?, metadata?, tags?, type? }} //everything will be positioned relative to nodes
      dragStart: {x: 0, y: 0},
      panStart: {x: 0, y: 0},
      linkStart: {nodeID: ''}
  }
    newCircle = (id, x, y, r) => {

    }

    addCircle = (state, newCircle) => {
        this.setState({circles: Object.assign({}, this.state.circles, {[newCircle.id]: newCircle})});
    }

    removeCircle = (state, id) => {
        
    }

    componentWillMount(){
      const {subj} = this.context;
      const newNode = (click) => ({id: 'node-' + uid.sync(8), x: click.offsetX, y: click.offsetY, text: ''}); //@ts-ignore

      let mouseUp$   = subj.filter(action => action.type === 'mouseUp');
      let mouseMove$ = subj.filter(action => action.type === 'mouseMove');
      let clickBG$   = subj.filter(action => action.type === 'clickBackground');
      let rightClickBG$   = subj.filter(action => action.type === 'rightClickBackground');
      let addNode$ = rightClickBG$.do(click => {
        let node = newNode(click);
        this.setState({nodes: {...this.state.nodes, [node.id]: node }});
      })

      let select$ = subj.filter(action => action.type === 'select')
      //drag nodes ----------------------------------------------------------------------------------------------
      let dragStart$ = subj.filter(action => action.type === 'dragStart');
      let dnd$ = dragStart$.mergeMap(action => mouseMove$.takeUntil(mouseUp$).do(moveData => {
          let {x,y} = this.state.dragStart;
          let oldNode = this.state.nodes[action.id]
          let dx = (moveData.clientX-action.clientX)/this.state.zoomScaleFactor;
          let dy = (moveData.clientY-action.clientY)/this.state.zoomScaleFactor;
          console.log(dx,dy)
          let newNode = {...oldNode, x: x+dx, y: y+dy}; //might be faster to mutate
          this.setState({nodes: {...this.state.nodes, [action.id]: newNode}});
          console.log(this.state.nodes[action.id])
      }))
      const test = {'link': {} }

      //make links ----------------------------------------------------------------------------------------------
      const initLink = (link1) => {
        let { nodeID, x1, y1 } = this.state.linkStart;
        if (this.state.linkStart.nodeID === '') {
          let { x, y, id } = this.state.nodes[link1.id];
          this.setState({ linkStart: { nodeID: id, x1: x, y1: y } })
        }
      }

      const previewLink = (link1, moveData) => {
          let { nodeID, x1, y1 } = this.state.linkStart;
          let dx = (moveData.clientX - link1.clientX)/this.state.zoomScaleFactor;
          let dy = (moveData.clientY - link1.clientY)/this.state.zoomScaleFactor;
          let newLink = { ...this.state.linkStart, x2: x1 + dx, y2: y1 + dy }; //might be faster to mutate
          this.setState({ linkStart: newLink })
      }

      const newLink = (source, target) => ({id: 'link-' + uid.sync(8), source, target});
      const setLink = (link1, click2) => {
          if (click2.hasOwnProperty('id') && click2.id.length > 0 && click2.id !== link1.id) {
            let link = newLink(link1.id, click2.id)
            this.setState({links: {...this.state.links, [link.id]: link}});
            this.setState({ linkStart: { nodeID: '' } })
          } else {
            this.setState({ linkStart: { nodeID: '' } })
          }
        }

      let linkClick$     = subj.filter(action => action.type === 'link')
      let stopPreview$ = Rx.Observable.merge(linkClick$, clickBG$)
      /*the trick to getting this to work for any number of pairs of clicks
       is the take(1) at the begining and the repeat() at the end */
      let initLink$ = linkClick$.take(1).do(link1=>initLink(link1))
      

      let addLink$ = initLink$.switchMap(link1 => {
              return mouseMove$.do(moveData=>previewLink(link1, moveData))
                    .takeUntil(stopPreview$.do(click2 => setLink(link1, click2)))
      }).repeat();
      
      //pan ----------------------------------------------------------------------------------------------
      let panStart$ = subj.filter(action => action.type === 'MiddleDown')
                        .do(x=>this.setState({panStart: {x: this.state.panX, y: this.state.panY}}))
      let panEnd$ = subj.filter(action => action.type === 'mouseUp').do(x => console.log(x))
      const setPan = (panStart, moveData) => {
          let {x,y} = this.state.panStart;
          let dx = (moveData.clientX-panStart.clientX)/this.state.zoomScaleFactor;
          let dy = (moveData.clientY-panStart.clientY)/this.state.zoomScaleFactor;
          this.setState({panX: x+dx});
          this.setState({panY: y+dy});
      }
      let pan$ = panStart$.switchMap(panStart => {
        return mouseMove$.do(moveData=>setPan(panStart, moveData)).takeUntil(panEnd$)
      })

     //zoom ---------------------------------------------------------------------------------------------- mouseWheel
     let zoom$ = subj.filter(action => action.type === 'mouseWheel')
                  .do(action => {
                    const dxFactor = .2
                    const zoomDx = action.deltaY > 0 ? -1*dxFactor: 1*dxFactor;
                    let oldZoom = this.state.zoomScaleFactor;
                    this.setState({zoomScaleFactor: oldZoom+zoomDx})
                  })


      Rx.Observable.merge(addNode$,dnd$,addLink$,pan$, zoom$).subscribe(x => console.log(x));
    }

    componentDidUpdate(){
      console.log('zoom',this.state.zoomScaleFactor)
    }


    render() {
        const {panX, panY, zoomScaleFactor, graphWidth, graphHeight, ...other} = this.state;
        let {subj } = this.context;
        let x = 100;
        return (
          <div>
              <ZoomContainer panX={panX} panY={panY} zoomScaleFactor={zoomScaleFactor} 
                             width={graphWidth} height={graphHeight}>
               <svg width={graphWidth} height={graphHeight}>
                 {this.state.linkStart.hasOwnProperty('x2') && 
                     <line {...this.state.linkStart} strokeWidth="4" stroke="black" />
                 }
                 {_.map(this.state.links, link => {
                   let source = this.state.nodes[link.source];
                   let target = this.state.nodes[link.target];
                   console.log('source', source,'target', target)
                    return (
                      <line key={link.id} x1={source.x} y1={source.y} x2={target.x} y2={target.y} strokeWidth="4" stroke="black" />
                    )
                 })}
              </svg>
               {_.map(this.state.nodes, node =>{
                 const {x,y} = node;
                 return (
                   <NodeDiv key={node.id} style={{ left: x, top: y }} 
                   >
                     <div>{node.id}</div>
                     <span 
                       onMouseDown={e=>{
                         const {clientX, clientY} = e.nativeEvent
                         e.stopPropagation(); 
                         e.preventDefault(); 
                         subj.next({type: 'dragStart', id: node.id, clientX, clientY}); 
                         this.setState({dragStart: {x: node.x, y: node.y}})
                         }} 
                       onClick={e=> {e.stopPropagation(); e.preventDefault();}}
                       onMouseUp={e=> {e.stopPropagation(); subj.next({type: 'mouseUp', id: node.id})}}>
                       drag 
                       </span> 
                     <span onClick={e=>{
                       e.stopPropagation()
                       const {clientX, clientY} = e.nativeEvent
                       subj.next({type: 'link', id: node.id, clientX, clientY}); 
                       
                       }}>link </span> 



                     <span onClick={e=>{subj.next({type: 'select', id: node.id})}}>select </span>
                     <span>delete</span>
                     <TextArea rows='1' autoFocus
                       onClick={e => e.stopPropagation()}
                       onBlur={e => this.setState({nodes: {...this.state.nodes, [node.id]: {...node, text: e.target.value}} })}
                       ></TextArea>
                   </NodeDiv>
                 )
                  
               })

               }
                

              
            </ZoomContainer>
           <input type="number" name='x' defaultValue={0} onChange={e=> this.setState({panX:parseInt(e.target.value)})}/>
           <input defaultValue={1} type='number' onChange={e=> {
                 
                 this.setState({zoomScaleFactor: parseInt(e.target.value)})
                 console.log(this.state)
                 }} />
            </div>
        )
    }
}

Figure.contextTypes = {
    subj: PropTypes.object
}

class App extends React.Component {
    render() {
        return <Figure />
    }
}

export default App;