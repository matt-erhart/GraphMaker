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
        onContextMenu={e=> {
                    e.preventDefault();
                }
            }
        />
    )
}
export default Line;

