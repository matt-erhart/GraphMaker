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
import  GraphIO from './GraphIO'

import Rebase from 're-base';

var base = Rebase.createClass({
    apiKey: "AIzaSyD2f07HcJOim-7AQGBU6Tdn2zNzhizrk20",
    authDomain: "graphmaker-4f5f7.firebaseapp.com",
    databaseURL: "https://graphmaker-4f5f7.firebaseio.com",
    projectId: "graphmaker-4f5f7",
    storageBucket: "graphmaker-4f5f7.appspot.com",
    messagingSenderId: "148125882055"
});

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
      linkStart: {nodeID: ''},
      linkOptions: {},
      graphNames: []
  }
    addGraph = (graphName) => {
      base.post(`graphs/${graphName}`, {
    data: {links: this.state.links, nodes: this.state.nodes},
      }).then(() => {
        console.log('saved graph')
      }).catch(err => {
        // handle error
      });
      base.post(`graphNames`, {
       data: graphName
      }).then(() => {
        console.log('saved graph')
      }).catch(err => {
        // handle error
      });
      this.setState({graphNames: this.state.graphNames.concat([graphName])})
    }

    loadGraph = (graphName) => {
      base.fetch(`graphs/${graphName}`, {
        context: this,
        asArray: false
      }).then(data => {
        console.log('then',data.nodes)
        const {links, nodes} = data;
        this.setState({ nodes: nodes})
        this.setState({ links: links})

      }).catch(error => {
        //handle error
      })
    }
    componentWillMount(){
      base.syncState(`graphNames`, {
        context: this,
        state: 'graphNames',
        asArray: true
      });

      const {subj} = this.context;
      const newNode = (click) => ({id: 'node-' + uid.sync(8), x: click.offsetX, y: click.offsetY, text: ''});

      let mouseUp$   = subj.filter(action => action.type === 'mouseUp');
      let mouseMove$ = subj.filter(action => action.type === 'mouseMove');
      let clickBG$   = subj.filter(action => action.type === 'clickBackground');
      let rightClickBG$   = subj.filter(action => action.type === 'rightClickBackground');
      let addNode$ = rightClickBG$.do(click => {
        let node = newNode(click);
        this.setState({nodes: {...this.state.nodes, [node.id]: node }});
      })

      let select$ = subj.filter(action => action.type === 'select')
      //drag nodes ---------------------------------------------------------------------------------------------- drag nodes
      let dragStart$ = subj.filter(action => action.type === 'dragStart');
      let dnd$ = dragStart$.mergeMap(action => mouseMove$.takeUntil(mouseUp$).do(moveData => {
          let {x,y} = this.state.dragStart;
          let oldNode = this.state.nodes[action.id]
          let dx = (moveData.clientX-action.clientX)/this.state.zoomScaleFactor;
          let dy = (moveData.clientY-action.clientY)/this.state.zoomScaleFactor;
          let newNode = {...oldNode, x: x+dx, y: y+dy}; //might be faster to mutate
          this.setState({nodes: {...this.state.nodes, [action.id]: newNode}});
      }))
      const test = {'link': {} }

      //make links ------------------------------------------------------------------------------------------ make links
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

      const newLink = (source, target) => ({id: 'link-' + uid.sync(8), source, target, label: ''});
      const setLink = (link1, click2) => {
          if (click2.hasOwnProperty('id') && click2.id.length > 0 && click2.id !== link1.id) {
            let link = newLink(link1.id, click2.id)
            this.setState({links: {...this.state.links, [link.id]: link}});
            this.setState({ linkStart: { nodeID: '' } })
          } else {
            this.setState({ linkStart: { nodeID: '' } })
          }
        }

      let linkClick$     = subj.filter(action => action.type === 'link' || action.type === 'linkMouseDown')
      let linkMouseUp$   = subj.filter(action => action.type === 'linkMouseUp')
      let stopPreview$ = Rx.Observable.merge(linkClick$, clickBG$, linkMouseUp$)
      /*the trick to getting this to work for any number of pairs of clicks
       is the take(1) at the begining and the repeat() at the end */
      let initLink$ = linkClick$.take(1).do(link1=>initLink(link1))
      

      let addLink$ = initLink$.switchMap(link1 => {
              return mouseMove$.do(moveData=>previewLink(link1, moveData))
                    .takeUntil(stopPreview$.do(click2 => setLink(link1, click2)))
      }).repeat();
      
      //pan ---------------------------------------------------------------------------------------------- pan
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

     //zoom ---------------------------------------------------------------------------------------------- zoom
     let zoom$ = subj.filter(action => action.type === 'mouseWheel')
                  .do(action => {
                    const dxFactor = .2
                    const zoomDx = action.deltaY > 0 ? -1*dxFactor: 1*dxFactor;
                    let oldZoom = this.state.zoomScaleFactor;
                    this.setState({zoomScaleFactor: oldZoom+zoomDx})
                  })


      Rx.Observable.merge(addNode$,dnd$,addLink$,pan$, zoom$).subscribe(x => console.log());
    }

    componentWillUpdate(){
      console.log(' state',this.state)
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
                     <line {..._.omit(this.state.linkStart,'nodeID')} strokeWidth="4" stroke="black" />
                 }
                 {/*draw svg links ---------------------------------------------------------------------- draw svg links*/}
                 {_.map(this.state.links, link => {
                   let source = this.state.nodes[link.source];
                   console.log(this.state.nodes, this.state.nodes[link.source], link.source)
                   let target = this.state.nodes[link.target];
                    return (
                      <line 
                      key={link.id} 
                      x1={source.x} y1={source.y} x2={target.x} y2={target.y} 
                      strokeWidth="4" stroke="black" 
                      onClick={e=>{
                           const {offsetX, offsetY, clientX, clientY, button} = e.nativeEvent
                           this.setState({linkOptions: {left: offsetX, top: offsetY, id: link.id }})
                      }}
                      />
                    )
                 })}
              </svg>
               {/*draw HTML nodes ----------------------------------------------------------------------------- draw HTML nodes*/}
               {_.map(this.state.nodes, node =>{
                 const {x,y} = node;
                 return (
                   <NodeDiv key={node.id} style={{ left: x, top: y }} onContextMenu={e=>e.stopPropagation()}>
                     
                     {/*//drag ---------------------------------------------------------------------------------- drag*/}
                     <span style={{cursor: 'move'}}
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
                     
                     {/*//create link ------------------------------------------------------------------------------ create link*/}
                     <span onClick={e=>{
                       e.preventDefault()
                       e.stopPropagation()
                       const {clientX, clientY} = e.nativeEvent
                       subj.next({type: 'link', id: node.id, clientX, clientY}); 
                       }} 
                       onMouseDown={e=>{
                       e.preventDefault()
                       e.stopPropagation()
                       const {clientX, clientY} = e.nativeEvent
                       subj.next({type: 'linkMouseDown', id: node.id, clientX, clientY}); 
                       }} 
                       onMouseUp={e=>{
                       e.preventDefault()
                       e.stopPropagation()
                       const {clientX, clientY} = e.nativeEvent
                       subj.next({type: 'linkMouseUp', id: node.id, clientX, clientY}); 
                       }}  
                       style={{cursor: 'alias'}}
                       > link </span> 


                     {/*//select --------------------------------------------------------------------------------------------------- select*/}
                     <span onClick={e=>{subj.next({type: 'select', id: node.id})}} style={{cursor: 'cell'}}>select </span>
                     {/*//delete --------------------------------------------------------------------------------------------------- delete*/}
                     <span style={{cursor: 'crosshair'}}>delete</span>
                     <TextArea rows='1' autoFocus
                       onClick={e => e.stopPropagation()}
                       onBlur={e => this.setState({nodes: {...this.state.nodes, [node.id]: {...node, text: e.target.value}} })}
                       ></TextArea>
                   </NodeDiv>
                 )
                  
               })
               }
               {/*//link options ------------------------------------------------------------------------------------------------------ link options*/}
                {this.state.linkOptions.hasOwnProperty('id') && 
                     <input autoFocus value={this.state.links[this.state.linkOptions.id].label}
                     style={{left: this.state.linkOptions.left, top: this.state.linkOptions.top, position: 'absolute' }} 
                     onChange={e=>{
                       console.log('change', this.state.links[this.state.linkOptions.id])
                       const {links, linkOptions} = this.state;
                       const linkToUpdate = links[linkOptions.id];
                       this.setState({links: {...links, [linkOptions.id]: {...linkToUpdate, label: e.target.value}} })
                     }}
                     onBlur={e=>{
                       console.log('asdf', this.state.links[this.state.linkOptions.id])
                       const {links, linkOptions} = this.state;
                       const linkToUpdate = links[linkOptions.id];
                       this.setState({links: {...links, [linkOptions.id]: {...linkToUpdate, label: e.target.value}} })
                       this.setState({linkOptions: {}})} } 
                     onKeyUp={e=>{
                       if (e.key === 'Enter') {
                          this.setState({linkOptions: {}})
                       }
                     }}
                     type="text"/>
                 }
            </ZoomContainer>
            <button onClick={e=>{
                  var d = new Date();
                  var datestring = d.getDate()  + "_" + (d.getMonth()+1) + "_" + d.getFullYear() + "_" +
                  d.getHours() + "_" + d.getMinutes() + '_' + d.getSeconds();
                  this.addGraph(`graph-${datestring}`)
              }}>Save Graph</button>
              <ul>
                {this.state.graphNames.map(name => {
                  return <li key={name} onClick={e=>{
                    console.log('name',name)
                    this.loadGraph(name)
                    }}> {name} </li>
                })}
              </ul>
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