import React from 'react';
import styled from 'styled-components'
import _ from 'lodash'
import * as d3 from 'd3-shape'

const LineCss = styled.line`
      strokeWidth: 4;
      stroke: grey;
      &:hover{
          strokeWidth: 5;
      }
`
const PathCss = styled.path`
    strokeWidth: 4;
      stroke: grey;
      &:hover{
          strokeWidth: 5;
      }

`
const pathMaker = d3.line().x(d=>d.x).y(d=>d.y);

const Line = (props) => {
    const {x1, x2, y1, y2, id, onClick, xShift, yShift, label} = props;
    const data = [{x:x1+xShift, y:y1+yShift}, {x:x2+xShift, y:y2+yShift}]
    const midX = (x1+x2+xShift*2)/2;
    const midY = (y1+y2+yShift*2)/2;
    return (
        <g>
            <PathCss id={id}
                d={pathMaker(data)} markerEnd="url(#markerArrow2)"
                onClick={e => {onClick(e); e.stopPropagation()}}
                onContextMenu={e => {
                    e.preventDefault();
                }
                }
            />
            <text  x={midX} y={midY} textAnchor="middle" style={{stroke: 'white', fill:'black'}}
                onClick={e => {onClick(e); e.stopPropagation()}}
                onContextMenu={e => {
                    e.preventDefault();
                    e.stopPropagation()
                }}>
                {label}
            </text>
        </g>
        
    )
}
export default Line;

{/*<textPath startOffset="50%" xlinkHref={'#' + id}>
                    {label}
                </textPath>*/}

        /*<LineCss 
        x1={x1+xShift} y1={y1+yShift} x2={x2+xShift} y2={y2+yShift} markerEnd="url(#markerArrow2)"
        onClick={e=> onClick(e)}
        onContextMenu={e=> {
                    e.preventDefault();
                }
            }
        />*/