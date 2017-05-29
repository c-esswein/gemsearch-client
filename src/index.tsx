import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './containers/App';
import './index.css';

import { createStore, applyMiddleware } from 'redux';
import { items } from './reducers/index';
import { StoreState } from './types/index';
import { Provider } from 'react-redux';
import thunkMiddleware from 'redux-thunk';
//import createLogger from 'redux-logger';

const logger = require('redux-logger');

const store = createStore<StoreState>(items, {
    queryItems: [],
    resultItems: []
  },
  applyMiddleware(thunkMiddleware, logger.createLogger())
);
/*
if (module.hot) {
  // Enable Webpack hot module replacement for reducers
  module.hot.accept('./reducers', () => {
    const nextRootReducer = require('./reducers').default;
    store.replaceReducer(nextRootReducer);
  });
}
*/
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root') as HTMLElement
);

