import React from 'react';
import styled from 'styled-components'
import Rx from 'rxjs'
import {buttonFromNum, subj} from './constants'
import PropTypes from 'prop-types'

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
`

const ZoomContainer = (props, {subj}) => {
    const {panX, panY, zoomScaleFactor, graphWidth, graphHeight, ...other} = props;
            return (
            <ZoomDivContainer width={graphWidth} height={graphHeight} 
              onClick={e => {
                const { offsetX, offsetY, button } = e.nativeEvent
                subj.next({ type: 'clickBackground', offsetX, offsetY })
              }}
              onContextMenu={e => {
                e.preventDefault()
                console.log('context')
                const { offsetX, offsetY } = e.nativeEvent
                subj.next({ type: 'rightClickBackground', offsetX, offsetY })
              }}
            onMouseMove={e => {
                const {offsetX, offsetY, clientX, clientY} = e.nativeEvent
                subj.next({type: 'mouseMove', offsetX, offsetY, clientX, clientY})
              }}
              onMouseDown={e => {
                const {offsetX, offsetY, clientX, clientY, button} = e.nativeEvent
                console.log('mousedown',{type: buttonFromNum[button] + 'Down', offsetX, offsetY, clientX, clientY} )
                subj.next({type: buttonFromNum[button] + 'Down', offsetX, offsetY, clientX, clientY})
              }}
              onMouseUp={e => {
                const {offsetX, offsetY, clientX, clientY, button} = e.nativeEvent
                subj.next({type: 'mouseUp', offsetX, offsetY, clientX, clientY})
              }}
              onWheel={e => {
                const {deltaY} = e.nativeEvent;
                subj.next({type: 'mouseWheel', deltaY})
              }}

              >
              <ZoomDiv panX={panX} panY={panY} zoomScaleFactor={zoomScaleFactor} 
              width={graphWidth} height={graphHeight}
               > 
               {props.children}
               </ZoomDiv>
            </ZoomDivContainer>
            )
}
ZoomContainer.contextTypes = {
    subj: PropTypes.object
}
export default ZoomContainer