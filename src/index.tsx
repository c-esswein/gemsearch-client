import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ConnectedApp } from 'components/app';

import { createStore, applyMiddleware } from 'redux';
import { items } from 'reducers/index';
import { StoreState } from 'types/index';
import { Provider } from 'react-redux';
import thunkMiddleware from 'redux-thunk';
import { DispatchContextProvider } from 'components/dispatchContextProvider';
import { AppContainer as ReactHotLoaderAppContainer } from 'react-hot-loader';

require('./index.css');

function configureStore(initialState: StoreState) {
  const store = createStore(items as any, initialState, applyMiddleware(thunkMiddleware));
  return store;
}


const store = configureStore({
    queryItems: [],
    resultItems: [],
    typeFilter: ['track', 'artist']
  }
);


const render = (App: React.ComponentClass<{}>) => {
  ReactDOM.render(
    (
      <ReactHotLoaderAppContainer>

        <DispatchContextProvider dispatch={store.dispatch}>
          <Provider store={store}>
            <App />
          </Provider>
        </DispatchContextProvider>

      </ReactHotLoaderAppContainer>
    ),
    document.getElementById('root'),
  );
};

render(ConnectedApp);


// Hot Module Replacement API https://github.com/gaearon/react-hot-loader/tree/master/docs#migration-to-30
declare const module: any;
if (module.hot) {
  module.hot.accept(
    'components/app',
    () => {
      render(ConnectedApp);

      console.log('react hot reloaded');
    },
  );
}

