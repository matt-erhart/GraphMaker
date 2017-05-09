import React from 'react';
import styled from 'styled-components'
import _ from 'lodash'

const LineCss = styled.line`
      strokeWidth: 4;
      stroke: grey;
      &:hover{
          stroke: black;
          strokeWidth: 5;
      }
`
const Line = (props) => {
    const {x1, x2, y1, y2, id, onClick, xShift, yShift} = props;
    return (
        <LineCss 
        x1={x1+xShift} y1={y1+yShift} x2={x2+xShift} y2={y2+yShift} 
        onClick={e=> onClick(e)}
        />
    )
}
export default Line;

const Lines = (props) => {
    const {nodes, links} = props;
    const lines = 
    _.map(links, link => {
        let source = nodes[link.source];
        let target = nodes[link.target];
        return (
            <Line 
            id={link.id} 
            x1={source.x} y1={source.y} x2={target.x} y2={target.y} xShift={75} yShift={30}
            onClick={e=> {
                const {offsetX, offsetY, clientX, clientY, button} = e.nativeEvent
                //redux dispatch setLinkOptions
                this.setState({linkOptions: {left: offsetX, top: offsetY, id: link.id }})
            }}
            />
        )
        })
}


