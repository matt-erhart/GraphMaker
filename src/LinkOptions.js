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
        setLinkOptions: (linkOptions) => dispatch({ type: 'SET_LINK_OPTIONS', linkOptions })
    }
}

class LinkOptions extends React.Component {
    render(){
        const {links, nodes} = this.props.graph;
        const {linkOptions} = this.props; //maybe rename floating menus?
        return (
        <input autoFocus value={links[linkOptions.id].label}
            style={{ left: linkOptions.left, top: linkOptions.top, position: 'absolute' }}
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
                if (e.key === 'Enter') {
                    this.props.setLinkOptions({ })
                }
            }}
            type="text" />
        )
    } 
}

export default connect(mapStateToProps, mapDispatchToProps)(LinkOptions)