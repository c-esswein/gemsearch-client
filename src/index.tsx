import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './containers/App';
import './index.css';

import { createStore, applyMiddleware } from 'redux';
import { items } from './reducers/index';
import { StoreState } from './types/index';
import { Provider } from 'react-redux';
import thunkMiddleware from 'redux-thunk';
const logger = require('redux-logger');

declare var module: { hot: any };

function configureStore(initialState: StoreState): any { // Store<StoreState>
  const store = createStore<StoreState>(items, initialState,
    applyMiddleware(thunkMiddleware, logger.createLogger()));

  if (module.hot) {
    module.hot.accept();
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('./reducers', () => {
      const nextRootReducer = require('./reducers').default;
      store.replaceReducer(nextRootReducer);
    });
  }

  return store;
}

const store = configureStore({
    queryItems: [],
    resultItems: []
  }
);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root') as HTMLElement
);
