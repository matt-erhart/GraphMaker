import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import { reactReduxFirebase, firebaseStateReducer } from 'react-redux-firebase'
import { composeWithDevTools } from 'redux-devtools-extension';
import * as reducers from './reducers';
// import { reducer as formReducer } from 'redux-form'

const configureStore = () => {
  const middlewares = [];
  if (process.env.NODE_ENV !== 'production') {
    middlewares.push();
  }

let rootReducer = combineReducers({
  graph: reducers.graph,
  panZoomSize: reducers.panZoomSize,
  interactionStart: reducers.interactionStart,
  linkOptions: reducers.linkOptions,
  firebase: firebaseStateReducer
})

let initialState = {
  graph:{links: {}, nodes: {}},
  panZoomSize: {zoomScaleFactor: 1, panX: 0, panY: 0, panStart: { x: 0, y: 0 },
  graphWidth: 1500, graphHeight: 1000},
  interactionStart: { dragStart: { x: 0, y: 0 }, linkStart: { nodeID: '' } },
  linkOptions: {}
}

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyD2f07HcJOim-7AQGBU6Tdn2zNzhizrk20",
    authDomain: "graphmaker-4f5f7.firebaseapp.com",
    databaseURL: "https://graphmaker-4f5f7.firebaseio.com",
    projectId: "graphmaker-4f5f7",
    storageBucket: "graphmaker-4f5f7.appspot.com",
    messagingSenderId: "148125882055"
}

// react-redux-firebase options
const config = {
  userProfile: 'users', // firebase root where user profiles are stored
  enableLogging: false, // enable/disable Firebase's database logging
}

// Add redux Firebase to compose
const createStoreWithFirebase = compose(
  reactReduxFirebase(firebaseConfig, config)
)(createStore)

  return createStoreWithFirebase(
    rootReducer,
    initialState,
    composeWithDevTools(applyMiddleware(...middlewares))
  );
};

export default configureStore;