import React from 'react';
import ReactDOM from 'react-dom';
import GraphMaker from './GraphMaker';
import './index.css';
import PropTypes from 'prop-types';
import configureStore from './configureStore'; //this is where redux state starts
import { Provider } from 'react-redux'; //passes store into the app

export const store = configureStore();

/*class Provider extends React.Component {

  getChildContext(){
    return {
      subj: this.props.subj
    }
  }

  render(){
    return this.props.children;
  }
}
Provider.childContextTypes = {
  subj: PropTypes.object
}

ReactDOM.render(
  <Provider subj={subj}>
    <App />
  </Provider>
  ,
  document.getElementById('root')
);*/


// import { Router, Route, browserHistory } from 'react-router'; //back button needs history

 const Root = ({ store }) => (
  <Provider store={store}>
    <GraphMaker/>
  </Provider>
);

Root.propTypes = {
  store: PropTypes.object.isRequired
};
import { render } from 'react-dom';

render(
  <Root store={store}/>,
  document.getElementById('root')
);