//used as selectedActivations: activationSelector(state) in ForceGraph mapStateToProps
import {createSelector} from 'reselect';
import _ from 'lodash';
const nodes = state => state.graph.nodes;
const defaultNodeTags = ['chunk', 'snippet', 'source'];

const uniqueNodeTags = (nodes) => {
    const uniqueTags = _.reduce(nodes, (acc, node) => {
        _.forEach(node.tags, tag => {
            if (!_.includes(acc,tag)) {
                return acc.push(tag)
            }
        })
        return acc
    }, defaultNodeTags)
    return uniqueTags
  }

  export default createSelector(
        nodes,
        uniqueNodeTags
  )