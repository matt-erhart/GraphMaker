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
      // let mouseDown$ = subj.filter(action => action.type === 'LeftDown').map(down => {
      //   let circ = newCircle(down, 1);
      //   this.addCircle(this.state, circ)
      //   return circ
      // })
      let mouseUp$   = subj.filter(action => action.type === 'mouseUp');
      let mouseMove$ = subj.filter(action => action.type === 'mouseMove');
      let clickBG$   = subj.filter(action => action.type === 'click-background');
      let addNode$ = clickBG$.do(click => {
        let node = newNode(click);
        this.setState({nodes: {...this.state.nodes, [node.id]: node }});
      })

      let select$ = subj.filter(action => action.type === 'select')
      //'nodeMouseUp' 'dragStart' 'select' 'link'
      let dragStart$ = subj.filter(action => action.type === 'dragStart');
      let dnd$ = dragStart$.mergeMap(action => mouseMove$.takeUntil(mouseUp$).do(moveData => {
          let {x,y} = this.state.dragStart;
          let oldNode = this.state.nodes[action.id]
          let dx = moveData.clientX-action.clientX;
          let dy = moveData.clientY-action.clientY;
          console.log(dx,dy)
          let newNode = {...oldNode, x: x+dx, y: y+dy}; //might be faster to mutate
          this.setState({nodes: {...this.state.nodes, [action.id]: newNode}});
          console.log(this.state.nodes[action.id])
      }))
      const test = {'link': {} }

      //@ts-ignore
      const newLink = (source, target) => ({id: 'link-' + uid.sync(8), source, target});



      let linkClick$     = subj.filter(action => action.type === 'link')
      let linkOrBGClick$ = Rx.Observable.merge(linkClick$, clickBG$)
      let startStop$ = linkClick$.take(1).switchMap(clickLink => {
              return mouseMove$.do(x=>console.log('preview line'))
              .takeUntil(linkOrBGClick$.take(1).do(x=>console.log('setstate here'))).do(x=>console.log(x))
      }).repeat()
      
      // let startStop$ = Rx.Observable.concat(linkClick$.take(1), 
      //         mouseMove$.do(x=>console.log('preview line')).takeUntil(linkOrBGClick$.take(1).do(x=>console.log('setstate here')) ) ).repeat().do(x=>console.log(x))
      
      // let win$ = linkClick$.switchMap(link => mouseMove$.takeUntil(linkOrBGClick$).combineLatest(linkOrBGClick$))
    
      // let makeLink$  = mouseMove$.windowToggle(startStop$.first().do(x=>console.log('1',x)), 
      // ()=> startStop$.last().do(x=>console.log('2',x))).switch().combineLatest(startStop$);


      // const previewLink$ = (clickLink) => {
      //   return mouseMove$.takeUntil(linkOrBGClick$).do(moveData => {
      //     let dx = moveData.clientX - clickLink.clientX;
      //     let dy = moveData.clientY - clickLink.clientY;
      //     let newLink = { ...this.state.linkStart, x2: x1 + dx, y: y1 + dy }; //might be faster to mutate
      //     this.setState({ linkStart: newLink })
      //   }
      //   )
      // }
      // const initializeLink = (clickLink) => {
      //   let { nodeID, x1, y1 } = this.state.linkStart;
      //   if (this.state.linkStart.nodeID === '') {
      //     let { x, y, id } = this.state.nodes[clickLink.id];
      //     this.setState({ linkStart: { nodeID: id, x1: x, y1: y } })
      //   }
      // } 
      // const addLink = (clickLink) => {
      //   let { nodeID, x1, y1 } = this.state.linkStart;
      //   if (nodeID.length > 0 && nodeID !== clickLink.id) {
      //     let link = newLink(nodeID, clickLink.id)
      //     this.setState({ links: { ...this.state.links, [link.id]: link } })
      //     this.setState({ linkStart: { nodeID: '' } })
      //   }
      // }

      // let linkCreate$ = linkClick$.take(1).switchMap(clickLink => {
      //     return previewLink$(clickLink)
      //  })

        


      //   }
      // )



      Rx.Observable.merge(addNode$,dnd$,startStop$).subscribe(x => console.log());


      // let circleRightDown$ = subj.filter(action => action.type === 'circleRightDown').subscribe(x=>console.log('circ',x))
      // let downUpDist$ = (circ) => mouseMove$.takeUntil(mouseUp$).map(move => Math.abs(circ.x-move.offsetX));
      // mouseDown$.mergeMap(circ => downUpDist$(circ).do(distance => {circ.r = distance; this.addCircle(this.state, circ)}))
      
      //  subj.subscribe(x=>console.log(x))
    
    }

    componentDidUpdate(){
      // console.log(this.state.nodes)
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
                 {_.map(this.state.links, link => {
                   let source = this.state.circles[link.source];
                   let target = this.state.circles[link.target];
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