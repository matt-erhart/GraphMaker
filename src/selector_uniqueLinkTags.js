import {createSelector} from 'reselect';
import _ from 'lodash';
const links = state => state.graph.links;
const defaultLinkTags = ['increases', 'decreases', 'causes', 'has a', 'is a', 'contains', 'prevents'];

const uniqueLinkTags = (links) => {
    const uniqueTags = _.reduce(links, (acc, link) => {
        _.forEach(link.tags, tag => {
            if (!_.includes(acc,tag)) {
                return acc.push(tag)
            }
        })
        return acc
    }, defaultLinkTags)
    return uniqueTags
  }

  export default createSelector(
        links,
        uniqueLinkTags
  )