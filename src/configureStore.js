import { createStore, applyMiddleware, combineReducers } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { createLogger } from 'redux-logger'
import * as reducers from './reducers';
import { reducer as formReducer } from 'redux-form'

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
  return createStore(
    rootReducer,
    composeWithDevTools(applyMiddleware(...middlewares))
  );
};

export default configureStore;