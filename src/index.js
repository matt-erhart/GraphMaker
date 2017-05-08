import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import Rx from 'rxjs';
import PropTypes from 'prop-types';

let subj = new Rx.Subject();

class Provider extends React.Component {

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
);
