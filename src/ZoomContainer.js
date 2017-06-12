import React from "react";
import styled from "styled-components";
import Rx from "rxjs";
import { rxBus, e$ } from "./rxBus";
import { connect } from "react-redux";
import _ from "lodash";
export const ZoomDivContainer = styled.div`
  overflow: hidden;
  border: 1px solid black;
`;
export const ZoomDiv = styled.div`
    transform: ${props => {
      return `scale(${props.zoomScaleFactor}, ${props.zoomScaleFactor}) 
              translate(${props.panX}px, ${props.panY}px)`;
    }}
    overflow: hidden;
    border: 1px solid grey;
`;

function mapStateToProps(state) {
  return {
    panZoomSize: state.panZoomSize
  };
}

const e$Out = (e$Name, e) => {
  const { offsetX, offsetY, clientX, clientY, button } = e.nativeEvent;
  rxBus.next({ type: e$Name, offsetX, offsetY, clientX, clientY, button }); //send to rxBus for processing
};

class ZoomContainer extends React.Component {
  render() {
    const {
      panX,
      panY,
      zoomScaleFactor,
      graphWidth,
      graphHeight
    } = this.props.panZoomSize;
    return (
      <ZoomDivContainer
        width={graphWidth}
        height={graphHeight}
        onClick={e => {
          e$Out(e$.clickBG.str, e);
        }}
        onContextMenu={e => {
          e.preventDefault();
          e$Out(e$.rightClickBG.str, e);
        }}
        onMouseMove={e => {
          e$Out(e$.mouseMove.str, e);
        }}
        onMouseDown={e => {
          const { offsetX, offsetY, clientX, clientY, button } = e.nativeEvent;
          const buttonFromNum = { 0: "left", 1: "middle", 2: "right" };
          rxBus.next({
            type: buttonFromNum[button] + "MouseDown",
            offsetX,
            offsetY,
            clientX,
            clientY,
            button
          });
        }}
        onMouseUp={e => {
          e$Out(e$.mouseUp.str, e);
        }}
        onWheel={e => {
          if (
            !_.isString(e.target.className) ||
            !e.target.className.includes("Select-")
          ) {
            rxBus.next({
              type: e$.mouseWheel.str,
              deltaY: e.nativeEvent.deltaY
            });
          }
        }}
      >

        <ZoomDiv
          panX={panX}
          panY={panY}
          zoomScaleFactor={zoomScaleFactor}
          width={graphWidth}
          height={graphHeight}
        >
          {this.props.children}
        </ZoomDiv>
      </ZoomDivContainer>
    );
  }
}

export default connect(mapStateToProps)(ZoomContainer);
