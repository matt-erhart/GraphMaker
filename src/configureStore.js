import { createStore, applyMiddleware, combineReducers } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { createLogger } from 'redux-logger'
import * as reducers from './reducers';
// import { reducer as formReducer } from 'redux-form'

const configureStore = () => {
  const middlewares = [];
  if (process.env.NODE_ENV !== 'production') {
    middlewares.push(createLogger());
  }

let rootReducer = combineReducers({
  graph: reducers.graph,
  panZoomSize: reducers.panZoomSize,
  interactionStart: reducers.interactionStart,
  linkOptions: reducers.linkOptions
})

let initialState = {
  graph:{links: {}, nodes: {}},
  panZoomSize: {zoomScaleFactor: 1, panX: 0, panY: 0, panStart: { x: 0, y: 0 },
  graphWidth: 1500, graphHeight: 1000},
  interactionStart: { dragStart: { x: 0, y: 0 }, linkStart: { nodeID: '' } },
  linkOptions: {}
}

  return createStore(
    rootReducer,
    initialState,
    composeWithDevTools(applyMiddleware(...middlewares))
  );
};

export default configureStore;