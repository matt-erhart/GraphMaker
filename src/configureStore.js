import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import { reactReduxFirebase, firebaseStateReducer } from 'react-redux-firebase'
import { composeWithDevTools } from 'redux-devtools-extension';
import * as reducers from './reducers';
import * as firebase from 'firebase'
// import { reducer as formReducer } from 'redux-form'
// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyDOBWE5a-0bO8k_hBbfJjXlr2dfRAMfkK4",
    authDomain: "knowledgecollector-20674.firebaseapp.com",
    databaseURL: "https://knowledgecollector-20674.firebaseio.com",
    projectId: "knowledgecollector-20674",
    storageBucket: "knowledgecollector-20674.appspot.com",
    messagingSenderId: "441463277516"
}
export var fire = firebase.initializeApp(firebaseConfig);
export var storageRef = firebase.storage().ref();

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
  firebase: firebaseStateReducer,
  sidePanel: reducers.sidePanel
})

let initialState = {
  graph:{links: {}, nodes: {}, groups: {}},
  panZoomSize: {zoomScaleFactor: 1, panX: 0, panY: 0, panStart: { x: 0, y: 0 },
  graphWidth: 1500, graphHeight: 1000},
  interactionStart: { dragStart: { x: 0, y: 0 }, linkStart: { nodeID: '' } },
  linkOptions: {}
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