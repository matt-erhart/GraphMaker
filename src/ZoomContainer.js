import React from 'react';
import styled from 'styled-components'
import Rx from 'rxjs'
import {buttonFromNum, subj} from './constants'
import {rxBus, rxActions} from './rxBus';
import { connect } from 'react-redux';

export const ZoomDivContainer = styled.div`
  overflow: hidden;
  border: 1px solid black;
`
export const ZoomDiv = styled.div`
    transform: ${props => {
      return `scale(${props.zoomScaleFactor}, ${props.zoomScaleFactor}) 
              translate(${props.panX}px, ${props.panY}px)`;
    }}
    overflow: hidden;
    border: 1px solid grey;
`
function mapStateToProps(state) {
  return { 
    panZoomSize: state.panZoomSize,
 }
}

function mapDispatchToProps(dispatch) {
  return {
    setZoom: (zoomScaleFactor) => dispatch({type: 'SET_ZOOM', zoomScaleFactor}),
    setPanX: (panX) => dispatch({type: 'SET_PANX', panX}),
    setPanY: (panY) => dispatch({type: 'SET_PANY', panY}),
    setPanStart: (panStart) => dispatch({type: 'SET_PAN_START', panStart})
  }
}

class ZoomContainer extends React.Component {

  componentWillMount(){
     let {panX, panY, zoomScaleFactor, graphWidth, graphHeight} = this.props.panZoomSize;
     let {middleMouseDown$, mouseUp$, mouseMove$} = rxActions;
    //pan ---------------------------------------------------------------------------------------------- pan
    let panStart$ = middleMouseDown$.do(x => {
      this.props.setPanStart({x: this.props.panZoomSize.panX, y: this.props.panZoomSize.panY})})
    let panEnd$ = mouseUp$.do(x => console.log(x))
    const setPan = (panStart, moveData) => {
        let {zoomScaleFactor} = this.props.panZoomSize;
        let { x, y } = this.props.panZoomSize.panStart;
        let dx = (moveData.clientX - panStart.clientX) / zoomScaleFactor;
        let dy = (moveData.clientY - panStart.clientY) / zoomScaleFactor;
        console.log('setpan', x,y,dx,dy)
        this.props.setPanX( x + dx );
        this.props.setPanY( y + dy );
    }
    let pan$ = panStart$.switchMap(panStart => {
        return mouseMove$.do(moveData => setPan(panStart, moveData)).takeUntil(panEnd$)
    })

    //zoom ---------------------------------------------------------------------------------------------- zoom
    let zoom$ = rxActions.mouseWheel$
        .do(action => {
            const dxFactor = .2
            const zoomDx = action.deltaY > 0 ? -1 * dxFactor : 1 * dxFactor;
            let oldZoom = this.props.panZoomSize.zoomScaleFactor;
            console.log(action)
            this.props.setZoom(oldZoom + zoomDx)
        })
        Rx.Observable.merge(zoom$, pan$).subscribe()
  }

  render() {
    const {panX, panY, zoomScaleFactor, graphWidth, graphHeight} = this.props.panZoomSize;
            return (
            <ZoomDivContainer width={graphWidth} height={graphHeight} 
              onClick={e => {
                const { offsetX, offsetY } = e.nativeEvent
                rxBus.next({ type: 'clickBG$', offsetX, offsetY })
              }}
              onContextMenu={e => {
                e.preventDefault()
                const { offsetX, offsetY } = e.nativeEvent
                rxBus.next({ type: 'rightClickBG$', offsetX, offsetY })
              }}
            onMouseMove={e => {
                const {offsetX, offsetY, clientX, clientY} = e.nativeEvent
                rxBus.next({type: 'mouseMove$', offsetX, offsetY, clientX, clientY})
              }}
              onMouseDown={e => {
                const {offsetX, offsetY, clientX, clientY, button} = e.nativeEvent
                console.log(buttonFromNum[button] + 'MouseDown$')
                rxBus.next({type: buttonFromNum[button] + 'MouseDown$', 
                          offsetX, offsetY, clientX, clientY})
              }}
              onMouseUp={e => {
                const {offsetX, offsetY, clientX, clientY} = e.nativeEvent
                rxBus.next({type: 'mouseUp$', offsetX, offsetY, clientX, clientY})
              }}
              onWheel={e => {
                console.log('wheel')
                const {deltaY} = e.nativeEvent;
                rxBus.next({type: 'mouseWheel$', deltaY})
              }}

              >
              <ZoomDiv panX={panX} panY={panY} zoomScaleFactor={zoomScaleFactor} 
              width={graphWidth} height={graphHeight}
               > 
               {this.props.children}
               </ZoomDiv>
            </ZoomDivContainer>
            )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ZoomContainer)