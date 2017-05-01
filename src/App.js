import React from 'react';
import styled from 'styled-components'
import Rx from 'rxjs'
import _ from 'lodash'
import uid from 'uid-safe'
import ram from 'ramda'

const ZoomDivContainer = styled.div`
  width:  ${props => props.width};
  height: ${props => props.height};
  overflow: 'hidden';
  border: '1px solid black'

`
let subj = new Rx.Subject();

class Figure extends React.Component {
    state = {
      scale: 1,
      width: 1500,
      height: 1000,
      x: 0,
      y: 0,
      circles: {}, // {'id': {id: 'id', x:, y:, r:, fill}}
      lines: {}, // {'id': {id: 'id', x1:, y1:, x2:, y2:}}
      links: {},
      selected: []
    }
    newCircle = (id, x, y, r) => {

    }

    addCircle = (state, newCircle) => {
        this.setState({circles: Object.assign({}, this.state.circles, {[newCircle.id]: newCircle})});
    }

    removeCircle = (state, id) => {
        
    }

    componentWillMount(){
      let newCircle = (down, distance) => ({id: 'circle-' + uid.sync(8), x: down.offsetX, y: down.offsetY, r: distance, stroke: 'black'});
      let mouseDown$ = subj.filter(action => action.type === 'mouseDown').map(down => {
        let circ = newCircle(down, 1);
        this.addCircle(this.state, circ)
        return circ
      })
      let mouseUp$   = subj.filter(action => action.type === 'mouseUp');
      let mouseMove$ = subj.filter(action => action.type === 'mouseMove');
      let circleRightDown$ = subj.filter(action => action.type === 'circleRightDown').subscribe(x=>console.log('circ',x))
      let downUpDist$ = (circ) => mouseMove$.takeUntil(mouseUp$).map(move => Math.abs(circ.x-move.offsetX));
      mouseDown$.mergeMap(circ => downUpDist$(circ).do(distance => {circ.r = distance; this.addCircle(this.state, circ)}))
      .subscribe(x => console.log());
    
    }

    componentDidUpdate(){
      console.log(this.state.links)
    }


    render() {
        const {x, y, scale, width, height, ...other} = this.state;
        return (
          <div>
            <div>hey</div>
            <div style={{width, height, overflow: 'hidden', border: '1px solid black'}} 
              onClick={e => {
                const { offsetX, offsetY } = e.nativeEvent
                subj.next({ type: 'click-background', offsetX, offsetY })
              }}
            onMouseMove={e => {
                const {offsetX, offsetY} = e.nativeEvent
                subj.next({type: 'mouseMove', offsetX, offsetY})
              }}
              onMouseDown={e => {
                const {offsetX, offsetY, button} = e.nativeEvent
                console.log('in div')
                subj.next({type: 'mouseDown', offsetX, offsetY})
              }}
              onContextMenu={e=> {
                e.preventDefault()
              }}
              onMouseUp={e => {
                const {offsetX, offsetY} = e.nativeEvent
                subj.next({type: 'mouseUp', offsetX, offsetY})
              }}

              >
              <div style={{transform: `scale(${scale}, ${scale}) translate(${x}px, ${y}px`, overflow: 'hidden'}}
               width={width} height={height} {...other}>
               <svg width={width} height={height}>
                 {_.map(this.state.circles, (circle) => {
                   return (
                     <circle key={circle.id} cx={circle.x} cy={circle.y} r={circle.r} fill='blue' stroke={circle.stroke} strokeWidth={10} opacity={.5}
                             onMouseDown={e => e.stopPropagation()}
                             onContextMenu={e => e.preventDefault()}
                             onClick={e => {
                                e.stopPropagation();
                                const {offsetX, offsetY, buttonNum} = e.nativeEvent; 
                                const buttonFromNum = {0: 'Left', 1: 'Middle', 2:'Right'}
                                let selectedCircle = {...circle, stroke: 'green'};
                                if (this.state.selected.length === 1){
                                  let newLink = {id: 'link-'+ uid.sync(8), source:this.state.selected[0], target: circle.id}
                                    this.setState({links: {...this.state.links, [newLink.id]: newLink}, selected: []})
                                    
                                } else {
                                  this.setState({selected: this.state.selected.concat([circle.id]), 
                                  circles: {...this.state.circles, [circle.id]: selectedCircle}})
                                }
                                  
                                subj.next({type: 'circle' + buttonFromNum[buttonNum] + 'Down', offsetX, offsetY})
                             }}
                             />  
                   )
                 })}
                 {_.map(this.state.links, link => {
                   let source = this.state.circles[link.source];
                   let target = this.state.circles[link.target];
                   console.log('source', source,'target', target)
                    return (
                      <line key={link.id} x1={source.x} y1={source.y} x2={target.x} y2={target.y} strokeWidth="4" stroke="black" />
                    )
                 })}
              </svg>
               </div>
            </div>
           <input type="number" name='x' defaultValue={this.state.x} onChange={e=> this.setState({x:parseInt(e.target.value)})}/>
           <input defaultValue={0} type='number' onChange={e=> {
                 console.log(e.target.value)
                 this.setState({scale: parseInt(e.target.value)})
                 }} />
            </div>
        )
    }
}

class App extends React.Component {
    render() {
        return <Figure />
    }
}

export default App;