import React from 'react';
import styled from 'styled-components'
import { rxBus, e$ } from './rxBus';
import TextArea from './TextArea'
import _ from 'lodash'
import { connect } from 'react-redux';


function mapStateToProps(state) {
    return {
        graph: state.graph,
        panZoomSize: state.panZoomSize,
        interactionStart: state.interactionStart,
        linkOptions: state.linkOptions
    }
}

function mapDispatchToProps(dispatch) {
    return {
        setLink: (link) => dispatch({ type: 'SET_LINK', link }),
        removeLink: (id) => dispatch({ type: 'REMOVE_LINK', id }),
        setLinkOptions: (linkOptions) => dispatch({ type: 'SET_LINK_OPTIONS', linkOptions })
    }
}

class LinkOptions extends React.Component {
    render(){
        const {links, nodes} = this.props.graph;
        const {linkOptions} = this.props; //maybe rename floating menus?
        return (
            <span style={{ left: linkOptions.left, top: linkOptions.top, position: 'absolute' }}>
        <input autoFocus value={links[linkOptions.id].label} placeholder="Link label then enter."
            
            onChange={e => {
                const linkToUpdate = links[linkOptions.id];
                this.props.setLink({ ...linkToUpdate, label: e.target.value })
            }}
            onBlur={e => {
                const linkToUpdate = links[linkOptions.id];
                this.props.setLink({ ...linkToUpdate, label: e.target.value })
                this.props.setLinkOptions({ })
            }}
            onKeyUp={e => {
                if (e.key === 'Enter' || e.key === 'Esc') {
                    this.props.setLinkOptions({ })
                }
            }}
            type="text" />
            <button  title="delete link" onClick={e =>{ 
                console.log('button-------------------------------------------------------------')
                this.props.removeLink(linkOptions.id)
                this.props.setLinkOptions({ })
                }}>X</button>
            </span>
        )
    } 
}

export default connect(mapStateToProps, mapDispatchToProps)(LinkOptions)