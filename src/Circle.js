import React from 'react';
import styled from 'styled-components'

const Circle = (props) => {

return (
    <circle key={circle.id} cx={circle.x} cy={circle.y} r={circle.r} fill='blue' stroke={circle.stroke} strokeWidth={10} opacity={.5}
        onMouseDown={e => e.stopPropagation()}
        onContextMenu={e => e.preventDefault()}
        onClick={e => {
        e.stopPropagation();
        const {offsetX, offsetY, buttonNum} = e.nativeEvent; 
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

}
