import React from 'react';
import GraphMaker from './GraphMaker';
import PropTypes from 'prop-types';
import configureStore from './configureStore'; //this is where redux state starts
import { Provider } from 'react-redux'; //passes store into the app
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

export const store = configureStore();

// import { Router, Route, browserHistory } from 'react-router'; //back button needs history

 const Root = ({ store }) => (
  <Provider store={store}>
    <MuiThemeProvider>
      <GraphMaker/>
    </MuiThemeProvider>
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